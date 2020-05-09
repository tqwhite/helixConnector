'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');
	
const asynchronousPipePlus = new require('asynchronous-pipe-plus')();
const asynchronousPipe = asynchronousPipePlus.asynchronousPipe;
const taskListPlus = asynchronousPipePlus.taskListPlus;
	
const helixDataGen = require('helixdata');
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
			}
		]
	});

	const { getScript, compileScript } = args;

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
		const callback = parameters.callback;
		const taskList = new taskListPlus();
		
		if (
			parameters.schema.skipPoolUser !== 'true' &&
			parameters.schema.skipPoolUser !== true
		) {
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
				parameters.poolUserObject = args.poolUserObject;
			}
			const workingParameters=qtools.clone(parameters);
			parameters.callback=localCallback;
			hxScriptRunner(processName, parameters);
		});
		if (
			parameters.schema.skipPoolUser !== 'true' &&
			parameters.schema.skipPoolUser !== true
		) {

		taskList.push((args, next) => {
			const localCallback = (err, releaseStatus) => {
				args.releaseStatus = releaseStatus;
				next(err, args);
			};
			if (args.poolUserObject) {
				parameters.poolUserObject = args.poolUserObject;
			}
			hxPoolUserAccessor.releasePoolUserObject(
					{ processName, helixAccessParms, poolUserObject:args.poolUserObject},
					localCallback
				);
		});
		}

		const initialData = typeof inData != 'undefined' ? inData : {};
		asynchronousPipe(taskList.getList(), initialData, (err, finalResult) => {
			if (err){
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
			helixAccessParms
		} = args;

		const helixSchema = qtools.clone(parameters.schema) || {};
		const scriptElement = getScript(processName);
		const osascript = require('osascript').eval;

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

	if (qtools.isTrue(parameters.schema.debugData) && parameters.schema.schemaName){
			const filePath=`${process.env.HOME}/Desktop/tmp/file_FromHelix_${new Date().getTime()}_${parameters.schema.schemaName}.txt`;
			qtools.logWarn(`WRITING received helix data to file: ${filePath}`);
			console.dir({"data [helix-engine.js.moduleFunction]":data});


			qtools.writeSureFile(filePath, data);
	}	
				data = data.replace(/([^\n])\n$/, '$1');

				let workingSchema = helixSchema;
				if (helixSchema.response) {
					workingSchema = helixSchema.response;
				}

				if (
					workingSchema.returnsJson === 'true' ||
					workingSchema.returnsJson === true
				) {
					try {
						data = JSON.parse(data);
					} catch (e) {
						callback(new Error(e));
						return;
					}
				} else {
					data = helixData.helixStringToRecordList(workingSchema, data);
				}

				callback('', data);
			}
		);
	};

	//API ENDPOINTS ====================================

	const hxScriptRunner = hxScriptRunnerActual({
		executeOsaScript,
		getScript,
		compileScript,
		helixData,
		helixAccessParms: this.helixAccessParms
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
	
	this.checkUserPool=callback=>{
		hxPoolUserAccessor.checkUserPool(callback);
	}

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

