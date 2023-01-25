'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

const asynchronousPipePlus = new require('qtools-asynchronous-pipe-plus')();
const asynchronousPipe = asynchronousPipePlus.asynchronousPipe;
const taskListPlus = asynchronousPipePlus.taskListPlus;

const helixDataGen = require('../lib/helix-data');
const helixData = new helixDataGen();

const poolUserGen = require('./lib/pool-user');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	qtools.validateProperties({
		subject: args || {},
		targetScope: this, //will add listed items to targetScope
		propList: [
			{
				name: 'getScript',
				optional: false
			},
			{
				name: 'compileScript',
				optional: false
			},
			{
				name: 'helixAccessParms',
				optional: false
			},
			{
				name: 'initCallback',
				optional: true
			},
			{
				name: 'otherParms',
				optional: true
			}
		]
	});

	const { getScript, compileScript, otherParms = {} } = args;

	//LOCAL FUNCTIONS ====================================

	const validateSchema = parameters => {
		const inDataIsOk = function(parameters) {
			const helixSchema = parameters.schema;
			let inData = parameters.inData;
			const fieldSequenceList = helixSchema.fieldSequenceList;

			if (typeof inData.length == 'undefined') {
				inData = [inData];
			}

			for (let i = 0, len = inData.length; i < len; i++) {
				const element = inData[i];
				var foundData = false;

				if (
					(!fieldSequenceList || fieldSequenceList.length === 0) &&
					qtools.count(element) !== 0
				) {
					// prettier-ignore
					qtools.logError(
						`The schema '${helixSchema.schemaName}' does not allow input data (no fieldSequenceList and inData exists)`
					);
					return (
						`The schema '${helixSchema.schemaName}'` +
						`does not allow input data (no fieldSequenceList and inData exists)`
					);
				}

				if (
					fieldSequenceList &&
					fieldSequenceList.length !== 0 &&
					qtools.count(element) === 0 &&
					!helixSchema.emptyRecordsAllowed
				) {
					return 'Record data must be supplied for this schema (emptyRecordsAllowed)';
				}

				for (let j in element) {
					if (element[j] && element[j] !== '') {
						foundData = true;
					}
					if (fieldSequenceList.indexOf(j) < 0) {
						return 'There is no field named ' + j + ' in this schema';
					}
					//later, I can check data type here, too
				}

				if (!foundData && !helixSchema.emptyRecordsAllowed) {
					return 'Empty records (ones with fields that are all missing or empty) are not allowed for this schema';
				}
			}

			return;
		};
		const badDataMessage = inDataIsOk(parameters);
		if (badDataMessage) {
			return badDataMessage;
		}
	};

	const executeHelixOperation = function(processName, parameters) {};

	const executeOsaScript = (script, parms, callback) => {
		const localCallback = (err, result) => {
			callback(err, result);
		};

		const exec = require('child_process').exec;
		const osaScript = require('osascript').eval;

		const workingParms = qtools.clone(parms);
		workingParms.type = workingParms.type.toLowerCase();

		switch (workingParms.type) {
			case 'applescript':
				osaScript(script, parms, localCallback);
				break;
			case 'bash':
				qtools.die({ 'workingParms.typeA': workingParms.type });
				exec(script, localCallback);
				break;
			default: //osascript default is javascript
			case 'jax':
				workingParms.type = 'javascript';
				osaScript(script, parms, localCallback);
				break;
		}
	};

	//WORKING FUNCTIONS ====================================

	const executeActual = (
		hxScriptRunner,
		hxPoolUserAccessor,
		helixAccessParms
	) => (processName, parameters) => {
		//
		// processName is libraryScriptName from helixConnector
		// parameters is retrievalParms from helixConnector
		//

		const retrievalParms = parameters;

		const callback = parameters.callback;
		const taskList = new taskListPlus();
		const { helixUserAuth } = helixAccessParms;

		const receivedUserAuth = helixUserAuth.hxUser || helixUserAuth.hxPassword;
		const needPoolUser = !(
			parameters.schema.skipPoolUser == true || receivedUserAuth
		);

		console.dir(
			{ ['helixUserAuth']: helixUserAuth },
			{ showHidden: false, depth: 2, colors: true }
		);

		console.log(`needPoolUser=${needPoolUser}`);

		if (needPoolUser) {
			taskList.push((args, next) => {
				const localCallback = (err, poolUserObject) => {
					if (err) {
						next(new Error(err));
						return;
					}

					args.poolUserObject = poolUserObject;
					next('', args);
				};

				hxPoolUserAccessor.getPoolUserObject(
					{ processName, helixAccessParms },
					localCallback
				);
			});
		}

		taskList.push((args, next) => {
			const localCallback = (err, queryData) => {
				args.queryData = queryData;
				next(err, args);
			};
			if (args.poolUserObject) {
				//here is where I think external user auth goes, maybe
				parameters.poolUserObject = args.poolUserObject;
			} else if (receivedUserAuth) {
				parameters.poolUserObject = {
					leaseUserName: helixUserAuth.hxUser,
					leasePassword: helixUserAuth.hxPassword
				};

				qtools.logMilestone(
					`received helix user auth parameters (user: '${
						helixUserAuth.hxUser
					}')`
				);
			}

			const workingParameters = qtools.clone(parameters);
			parameters.callback = localCallback;
			hxScriptRunner(processName, parameters); //hxScriptRunnerActual
		});

		if (needPoolUser) {
			taskList.push((args, next) => {
				const { poolUserObject } = args;
				let retryCount = 0;
				const localCallback = (err, releaseStatus) => {
					if (retryCount < 1 && err.toString().match(/-1712/)) {
						//-1712 is AppleEvent timed out
						retryCount++;
						executeRelease();
						return;
					}

					if (err) {
						err = new Error(
							`${err.toString()} (tried ${retryCount +
								1} times) [helix-engine.js]`
						);
					}
					args.releaseStatus = releaseStatus;
					next(err, args);
				};

				if (args.poolUserObject) {
					parameters.poolUserObject = poolUserObject;
				}

				const executeRelease = ((
					processName,
					helixAccessParms,
					poolUserObject,
					localCallback
				) => () => {
					hxPoolUserAccessor.releasePoolUserObject(
						{
							processName,
							helixAccessParms,
							poolUserObject
						},
						localCallback
					);
				})(processName, helixAccessParms, poolUserObject, localCallback);

				executeRelease();
			});
		}

		const initialData = typeof inData != 'undefined' ? inData : {};
		asynchronousPipe(taskList.getList(), initialData, (err, finalResult) => {
			if (err) {
				callback(new Error(err));
				return;
			}
			callback(err, finalResult.queryData);
		});
	};

	const hxScriptRunnerActual = args => (processName, parameters) => {
		const {
			executeOsaScript,
			getScript,
			compileScript,
			helixData,
			helixAccessParms,
			otherParms
		} = args;

		const helixSchema = qtools.clone(parameters.schema) || {};
		const scriptElement = getScript(processName);
		const osascript = require('osascript').eval;

		const { hxcReturnMetaDataOnly } = otherParms;

		const tmp =
			typeof parameters.schema != 'undefined'
				? parameters.schema.schemaName
				: 'NO HELIX SCHEMA';

		if (scriptElement.err) {
			!parameters.callback || parameters.callback(scriptElement.err);
			return;
		}

		//compileScript() is actually helixConnector.compileScriptActual which calla helixData.makeApplescriptDataString()
		const finalScript = compileScript({
				scriptElement,
				processName,
				parameters,
				helixSchema
			}),
			callback = parameters.callback || function() {};

		if (helixSchema.debug === 'true' || helixSchema.debug === true) {
			console.log(
				'finalScript=\n\n' +
					finalScript +
					'\n\n=================(helixEngine.js)\n'
			);
		}

		const languageSpec = {
			type:
				scriptElement.language.toLowerCase() == 'javascript'
					? ''
					: scriptElement.language //turns out that osascript won't let you specify, JS is the default
		};

		executeOsaScript(
			finalScript,
			languageSpec,

			(err, data = '') => {
				if (err) {
					callback(new Error(err));
					return;
				}

				if (
					qtools.isTrue(parameters.schema.debugData) &&
					parameters.schema.schemaName
				) {
					const filePath = `/tmp/hxc_FromHelix_${new Date().getTime()}_${
						parameters.schema.schemaName
					}.txt`;
					qtools.logWarn(
						`WRITING raw received from helix data to file (shows separators): ${filePath} (debugData=true)`
					);
					qtools.writeSureFile(filePath, data);
				}

				const stringData = data.replace(/([^\n])\n$/, '$1');
				let outData;

				let workingSchema = helixSchema;
				if (helixSchema.response) {
					workingSchema = helixSchema.response;
				}

				if (
					workingSchema.returnsJson === 'true' ||
					workingSchema.returnsJson === true
				) {
					try {
						outData = JSON.parse(stringData);
					} catch (e) {
						callback(new Error(e));
						return;
					}
				} else {
					outData = helixData.helixStringToRecordList(
						workingSchema,
						stringData
					);
				}
				
				const eligableForMetaData=!(workingSchema.internalSchema || workingSchema.schemaType=='remoteControl');

				if ( eligableForMetaData && hxcReturnMetaDataOnly) {
					outData = [
						{
							totalRecordsAvailable: stringData,
							schemaName: workingSchema.schemaName,
							relation: workingSchema.relation,
							view: workingSchema.view,
							criterionSchemaName: workingSchema.criterionSchemaName,
							queryData: args.otherParms,
							driverHxAccessRecordCount:
								helixAccessParms.driverHxAccessRecordCount
						}
					];
				}

				callback('', outData);
			}
		);
	};

	//API ENDPOINTS ====================================

	const hxScriptRunner = hxScriptRunnerActual({
		executeOsaScript,
		getScript,
		compileScript,
		helixData,
		helixAccessParms: this.helixAccessParms,
		otherParms
	});

	const hxPoolUserAccessor = new poolUserGen({
		helixAccessParms: this.helixAccessParms,
		hxScriptRunner
	});

	this.execute = executeActual(
		hxScriptRunner,
		hxPoolUserAccessor,
		this.helixAccessParms
	);

	this.validateSchema = validateSchema;

	this.checkUserPool = callback => {
		hxPoolUserAccessor.checkUserPool(callback);
	};

	//INITIALIZATION ====================================

	!this.initCallback || this.initCallback();

	//ECOSYSTEM REQUIREMENTS ====================================

	const ping = (message = 'NO MESSAGE SUPPLIED') => {
		return `${qtools.ping().employer} got the ${message}`;
	};

	this.ping = ping;

	this.shutdown = (message, callback) => {
		console.log(`\nshutting down ${qtools.ping().employer}`);
		callback('', message);
	};

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

