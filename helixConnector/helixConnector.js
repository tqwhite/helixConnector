'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module);
const events = require('events');
const util = require('util');
const helixDataGen = require('helixdata');
const helixData = new helixDataGen();
const remoteControlManagerGen = require('./remote-control-manager');
const path = require('path');
const helixEngineGen = require('./accessors/helix-engine');
const staticDataGen = require('./static-data');

//START OF moduleFunction() ============================================================

const moduleFunction = function(args) {
	events.EventEmitter.call(this);

	const argsErrorList = qtools.validateProperties(
		{
			subject: args || {},
			targetScope: this, //will add listed items to targetScope
			propList: [
				{
					name: 'helixAccessParms',
					optional: false
				},
				{
					name: 'processIdentifier',
					optional: true
				},
				{
					name: 'authGoodies',
					optional: true
				},
				{
					name: 'noValidationNeeded',
					optional: true
				}
			]
		},
		true
	); //this is a server component, don't die on error

	if (argsErrorList) {
		throw new Error(argsErrorList);
	}

	this.noValidationNeeded = this.noValidationNeeded
		? this.noValidationNeeded
		: false;
	this.authGoodies = this.authGoodies ? this.authGoodies : {};

	this.systemProfile = this.systemProfile || {};
	this.immutableHelixAccessParms = qtools.clone(this.helixAccessParms);

	const self = this;
	this.forceEvent = function(eventName, outData) {
		this.emit(eventName, {
			eventName: eventName,
			data: outData
		});
	};
	this.args = args;
	

	//LOCAL FUNCTIONS ====================================

	const initializeProperties = function() {
		self.leasePoolUserFieldName = 'leaseUserName';
		self.leasePoolPasswordFieldName = 'leasePasswordEncrypted';
		self.helixRelationList = [];
		self.openDatabaseFunctionNames = ['openTestDb'];
		self.systemParms = {};
		self.userPoolOk = '';
		self.leaseUserName = '';
		self.authorized = false;

		self.helixAccessParms = qtools.clone(self.immutableHelixAccessParms);
	};

	const resetConnector = function() {
		initializeProperties();
		cancelExitPoolUser();
	};

	const getRelationList = function(control, callback) {
		const relationFieldName = 'relationName';

		const skipGetHelixRelations = true; //see comment below re: helixRelationList
		if (
			skipGetHelixRelations ||
			self.helixRelationList.length !== 0 ||
			qtools.in(control, self.openDatabaseFunctionNames)
		) {
			callback('', '');
			return;
		}

		const helixSchema = {
			relation: '',
			view: '',
			fieldSequenceList: [relationFieldName],
			mapping: {}
		};

		executeHelixOperation('listRelations', {
			helixSchema: helixSchema,
			debug: false,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					callback(err, result);
					return;
				}

				if (result.length < 1) {
					callback(
						'Helix not available or is broken: No relations were retrieved'
					);
				} else {
					result.map(function(item) {
						self.helixRelationList.push(item[relationFieldName]);
					});
					callback(err, result);
				}
			}
		});
	};

	self.getViewDetails = function(control, parameters) {
		const callback = parameters.callback
			? parameters.callback
			: function(err, result) {
					qtools.dump({ err: err });
					qtools.dump({ result: result });
				};

		const relationFieldName = 'relationName';

		const forceSkipHelixRelationLookup = true; //see note below

		if (
			forceSkipHelixRelationLookup ||
			self.helixRelationList.length !== 0 ||
			qtools.in(control, self.openDatabaseFunctionNames)
		) {
			callback('', '');
			return;
		}

		const helixSchema = {
			relation: parameters.relation,
			view: parameters.view,
			fieldSequenceList: [],
			mapping: {}
		};

		const viewDetailsConversion = function(
			helixFieldSequenceList,
			helixMapping,
			data
		) {
			const outObj = { weirdString: data };
			throw new Error(
				'getViewDetails() does not produce decent results. It is not yet implemented corrrectly.'
			);
			return outObj;
		};

		executeHelixOperation('getViewDetails', {
			specialStringConversion: viewDetailsConversion,
			helixSchema: helixSchema,
			debug: true,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					callback(err, result);
					return;
				}
				if (result.length < 1) {
					callback(
						'Helix not available or is broken: ' +
							parameters.relation +
							'/' +
							parameters.view +
							' does not exist or is broken.'
					);
				} else {
					// 					result.map(function(item) {
					// 						self.helixRelationList.push(item[relationFieldName]);
					// 					});
					callback(err, result);
				}
			}
		});
	};

	const switchToPoolUser = function(user, password) {
		self.systemParms.user = user;
		self.systemParms.password = password;
	};

	const initUserPoolIfNeeded = function(control, callback) {
		switch (control) {
			case 'openTestDb':
				callback();
				return false;
				break;
			case 'kill':
			case 'quitHelixNoSave':
				self.userPoolOk = false;
				break;
			default:
				self.userPoolOk = true;
				break;
		}

		const allPresent =
			self.helixAccessParms.userPoolLeaseRelation &&
			self.helixAccessParms.userPoolLeaseView &&
			self.helixAccessParms.userPoolReleaseRelation &&
			self.helixAccessParms.userPoolReleaseView
				? true
				: false;
		const anyPresent =
			self.helixAccessParms.userPoolLeaseRelation ||
			self.helixAccessParms.userPoolLeaseView ||
			self.helixAccessParms.userPoolReleaseRelation ||
			self.helixAccessParms.userPoolReleaseView
				? true
				: false;

		const missingTables = '';
		/*
		Turns out that Helix takes FOREVER to return the list of relations if it's very long.
		TODO: I need to refactor this to 1) not retrieve the list, 2) decide if detecting
		missing relations is an important error category, 3) implement a different way
		of detecting that Helix is not up and running. Presently, this is not detected.

		missingTables += !qtools.in(self.helixAccessParms.userPoolLeaseRelation, self.helixRelationList) ? self.helixAccessParms.userPoolLeaseRelation + " " : '';
		missingTables += !qtools.in(self.helixAccessParms.userPoolReleaseRelation, self.helixRelationList) ? self.helixAccessParms.userPoolReleaseRelation + " " : '';
*/

		if (allPresent && missingTables) {
			callback(
				'One or more of the User Pool Lease relations is missing: ' +
					missingTables
			);
			return;
		}

		if (anyPresent && !allPresent) {
			callback(
				'One of the User Pool Lease parameters is missing (userPoolLeaseRelation, userPoolLeaseView, userPoolReleaseRelation, userPoolReleaseView)'
			);
			return;
		}
		if (allPresent && self.userPoolOk && !self.leaseUserName) {
			getPoolUser(function(err, result) {
				if (!result || !result[0]) {
					qtools.logError('Did not receive a Pool User from Helix');
					callback('Did not receive a Pool User from Helix');
					return;
				}

				self.leaseUserName = result[0][self.leasePoolUserFieldName];

				switchToPoolUser(
					result[0][self.leasePoolUserFieldName],
					decryptLeasePassword(result[0][self.leasePoolPasswordFieldName])
				);

				initExitPoolUser();
				callback();
			});
			return;
		}

		callback();
		return;
	};

	const getPoolUser = function(callback) {
		const localCallback = function(err, result) {
			if (result && result[0]) {
				self.hasPoolUser = true;
			}
			callback(err, result);
		};
		const helixSchema = {
			relation: '',
			view: '',
			fieldSequenceList: [
				self.leasePoolUserFieldName,
				self.leasePoolPasswordFieldName
			],
			mapping: {},
			separators: {
				field: ', '
			}
		};
		executeHelixOperation('poolUserLease', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {},
			callback: localCallback
		});
	};

	const decryptLeasePassword = function(leasePasswordEncrypted) {
		const userPoolPasswordDecryptionKey =
			self.helixAccessParms.userPoolPasswordDecryptionKey;
		const userPoolPassword = /*decrypt*/ leasePasswordEncrypted;
		return leasePasswordEncrypted;
	};

	const releasePoolUser = function(callback) {
		callback = callback ? callback : function() {};

		if (!self.hasPoolUser) {
			callback();
			return;
		}

		const localCallback = function(err, result) {
			//note: tests kill Helix before they close so this is not triggered, it works if Helix stays up
			callback(err, result);
		};
		const helixSchema = {
			relation: '',
			view: '',
			fieldSequenceList: [],
			mapping: {}
		};
		executeHelixOperation('poolUserRelease', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {},
			callback: localCallback
		});
	};

	const exitEventHandler = function() {
		releasePoolUser();
	};

	const initExitPoolUser = function() {
		//process.stdin.resume();//so the program will not close instantly
		//do something when app is closing
		process.on('exit', exitEventHandler);

		//catches ctrl+c event
		//process.on('SIGINT', exitHandler.bind(null, {exit:true}));

		//catches uncaught exceptions
		//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
	};

	const cancelExitPoolUser = function() {
		process.removeListener('exit', exitEventHandler);
	};

	const demoJs = function() {
		const osa = require('osa');
		const test = function() {
			app = Application('Helix RADE');
			path = Path('/Users/tqwhite/Documents/webdev/lenny/panagon/toyHelix');
			app.open(path);
		};
		osa(test);
	};

	const compileScript = (
		scriptElement,
		processName,
		parameters,
		helixSchema
	) => {
		const inData = qtools.clone(parameters.inData) || {};
		const otherParms = parameters.otherParms || {};
		const systemParms = self.systemParms;

		const replaceObject = qtools.extend(
				{},
				self.helixAccessParms,
				helixSchema,
				inData,
				otherParms,
				systemParms,
				{
					processName: processName,
					leaseUserName: self.leaseUserName
				}
			),
			script = scriptElement.script;

		replaceObject.dataString = helixData.makeApplescriptDataString(
			helixSchema.fieldSequenceList,
			helixSchema.mapping,
			otherParms,
			inData
		);

		if (
			helixSchema.criterion &&
			parameters.criterion &&
			parameters.criterion.data
		) {
			replaceObject.criterion.dataString = helixData.makeApplescriptDataString(
				helixSchema.criterion.fieldSequenceList,
				helixSchema.mapping,
				otherParms,
				parameters.criterion.data
			);
		}
		const finalScript = qtools.templateReplace({
			template: script.toString(),
			replaceObject: replaceObject
		});

		return finalScript;
	};

	const executeHelixOperation = function(processName, parameters) {
		const helixSchema = qtools.clone(parameters.helixSchema) || {};
		const scriptElement = getScript(processName);

		const tmp = parameters.helixSchema
			? parameters.helixSchema.view
			: 'NO HELIX SCHEMA';
		qtools.logMilestone(
			`helix access script: ${processName}/${tmp} ${new Date().toLocaleString()}`
		);

		if (scriptElement.err) {
			!parameters.callback || parameters.callback(scriptElement.err);
			return;
		}

		const finalScript = compileScript(
				scriptElement,
				processName,
				parameters,
				helixSchema
			),
			callback = parameters.callback || function() {};

		if (parameters.debug) {
			console.log('finalScript=' + finalScript);
		}

		osascript(
			finalScript,
			{
				type:
					scriptElement.language.toLowerCase() == 'javascript'
						? ''
						: scriptElement.language //turns out that osascript won't let you specify, JS is the default
			},
			function(err, data) {
				if (!parameters.specialStringConversion) {
					data = helixData.helixStringToRecordList(helixSchema, data);
				} else {
					data = parameters.specialStringConversion(helixSchema, data);
				}

				if (parameters.debug) {
					qtools.logMilestone(`EXECUTING *${parameters.helixSchema.view}*`);
					const tmpp = data.length
						? data.slice(0, 2).map(item => JSON.stringify(item).substr(0, 200))
						: ['EMPTY'];
					qtools.logMilestone(`-- sample: ${tmpp[0]} ...`);
					qtools.logMilestone(`-- sample: ${tmpp[1]} ...`);
					qtools.logMilestone(`-- of ${data.length} records`);
				}

				callback(err, data, {
					user: self.systemParms.user
				});
			}
		);
	};

	//METHODS AND PROPERTIES ====================================

	const jwt = require('jsonwebtoken');

	self.generateAuthToken = function(userId, callback) {
		const token = jwt.sign(
			{
				userId: userId,
				instanceId: self.immutableHelixAccessParms.instanceId
			},
			self.immutableHelixAccessParms.authKey
		);
		callback('', token);
	};

	self.validateUserId = function(userId, token, callback) {
		if (self.noValidationNeeded || self.authorized) {
			callback('', true);
			return;
		}
		let decoded;
		try {
			decoded = jwt.verify(token, self.immutableHelixAccessParms.authKey);
		} catch (e) {
			callback(e);
			return;
		}
		if (decoded.instanceId != self.immutableHelixAccessParms.instanceId) {
			callback('instanceId does not match');
			return;
		}
		if (decoded.userId != userId) {
			callback('userId does not match');
			return;
		}
		self.authorized = true;
		callback('', true);
	};

	self.cancelValidation = function() {
		self.authorized = false;
	};
	//DISPATCH ====================================

	const inDataIsOk = function(parameters) {
		const helixSchema = parameters.helixSchema;
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
				qtools.logError(
					`The schema '${
						helixSchema.schemaName
					}' does not allow input data (no fieldSequenceList and inData exists)`
				);
				return `The schema '${
					helixSchema.schemaName
				}' does not allow input data (no fieldSequenceList and inData exists)`;
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

	const getScriptPathParameters = functionName => {
		const libDir = __dirname + '/lib/';

		var scriptNameMap = {
			save: {
				path: libDir + 'saveOne.applescript',
				language: 'AppleScript'
			},
			kill: {
				path: libDir + 'quitHelixNoSave.applescript',
				language: 'AppleScript'
			},
			startDb: {
				path: libDir + 'openTestDb.jax',
				language: 'Javascript'
			}
		};

		let scriptElement = scriptNameMap[functionName];

		if (scriptElement) {
			return scriptElement;
		}

		const internalLibPath = __dirname + '/lib/';
		const remoteControlDirectoryPath =
			self.helixAccessParms.remoteControlDirectoryPath;

		if (remoteControlDirectoryPath) {
			scriptElement = {
				path: path.join(
					remoteControlDirectoryPath,
					`${functionName}.applescript`
				),
				language: 'AppleScript'
			};

			if (qtools.realPath(scriptElement.path)) {
				return scriptElement;
			}

			scriptElement = {
				path: path.join(remoteControlDirectoryPath, `${functionName}.jax`),
				language: 'Javascript'
			};

			if (qtools.realPath(scriptElement.path)) {
				return scriptElement;
			}

			scriptElement = {
				path: path.join(remoteControlDirectoryPath, `${functionName}.bash`),
				language: 'BASH'
			};

			if (qtools.realPath(scriptElement.path)) {
				return scriptElement;
			}
		}

		scriptElement = {
			path: path.join(internalLibPath, `${functionName}.applescript`),
			language: 'AppleScript'
		};

		if (qtools.realPath(scriptElement.path)) {
			return scriptElement;
		}

		scriptElement = {
			path: path.join(internalLibPath, `${functionName}.jax`),
			language: 'Javascript'
		};

		if (qtools.realPath(scriptElement.path)) {
			return scriptElement;
		}

		scriptElement = {
			path: path.join(internalLibPath, `${functionName}.bash`),
			language: 'BASH'
		};

		if (qtools.realPath(scriptElement.path)) {
			return scriptElement;
		}
	};

	var getScript = functionName => {
		const scriptElement = getScriptPathParameters(functionName);

		if (qtools.fs.existsSync(scriptElement.path)) {
			scriptElement.script = qtools.fs
				.readFileSync(scriptElement.path)
				.toString();
		} else {
			scriptElement.err = `Error: File not found ${scriptElement.path}`;
		}

		return scriptElement;
	};

	const prepareProcess = function(control, parameters) {
		if (!parameters.schema && !parameters.helixSchema) {
			parameters.callback('Must have either schema or helixSchema');
			return;
		}

		if (parameters.helixSchema) {
			const badDataMessage = inDataIsOk(parameters);
			if (badDataMessage) {
				parameters.callback(badDataMessage);
				return;
			}
		}

		//this allows mapping of user friendly names to file names and processes
		switch (control) {
			case 'kill':
			case 'quitHelixNoSave':
				executeHelixOperation('quitHelixNoSave', parameters);
				resetConnector();
				break;
			case 'remoteControlManager':
				const remoteControlManager = new remoteControlManagerGen({
					getScript,
					compileScript
				});
				remoteControlManager.execute(control, parameters);
				break;
			default:
				executeHelixOperation(control, parameters);
				break;
		}
	};
	
	const helixAccess = (control, parameters) => {
		qtools.validateProperties({
			subject: parameters || {},
			propList: [
				{
					name: 'helixSchema',
					optional: false
				},
				{
					name: 'callback',
					optional: false
				},
				{
					name: 'otherParms',
					optional: true
				},
				{
					name: 'inData',
					optional: true
				},
				{
					name: 'criterion',
					optional: true
				},
				{
					name: 'debug',
					optional: true
				}
			]
		});

		const executeStaticTest = (helixSchema, callback) => {
			const buildResponse = (helixData, helixSchema, data) => {
				return helixData.arrayOfRecordsToArrayOfResponseObjects(
					helixSchema.fieldSequenceList,
					helixSchema.mapping,
					data
				);

				// specialStringConversion appears to be a deadend relic.
				// I leave it here so I don't forget if I ever change my mind
				// if (!parameters.specialStringConversion) {
				// 	return helixData.helixStringToRecordList(helixSchema, data);
				// } else {
				// 	return parameters.specialStringConversion(helixSchema, data);
				// }
			};
			const staticData = new staticDataGen();
			const outData = staticData.get(
				parameters.helixSchema.staticTestData,
				self.helixAccessParms.staticDataDirectoryPath,
				helixSchema,
				self.helixAccessParms
			);
			callback('', buildResponse(helixData, helixSchema, outData));
		};

		const runProcess = function() {
			if (parameters.helixSchema.staticTest) {
				executeStaticTest(parameters.helixSchema, parameters.callback);
				return;
			}

			getRelationList(control, function(err, result) {
				if (err) {
					parameters.callback(err);
					return;
				}
				initUserPoolIfNeeded(control, function(err) {
					if (err) {
						parameters.callback(err);
						return;
					}
					prepareProcess(control, parameters);
				});
			});
		};

		self.validateUserId(
			self.authGoodies.userId,
			self.authGoodies.authToken,
			function(err, result) {
				if (err) {
					parameters.callback(err);
				} else {
					runProcess();
				}
			}
		);
	};
	
	const remoteControlAccess = (control, parameters) => {
		qtools.validateProperties({
			subject: parameters || {},
			propList: [
				{
					name: 'schema',
					optional: false
				},
				{
					name: 'callback',
					optional: false
				},
				{
					name: 'otherParms',
					optional: true
				},
				{
					name: 'criterion',
					optional: true
				},
				{
					name: 'debug',
					optional: true
				}
			]
		});

		self.validateUserId(
			self.authGoodies.userId,
			self.authGoodies.authToken,
			function(err, result) {
				if (err) {
					parameters.callback(err);
				} else {
					prepareProcess(control, parameters);
				}
			}
		);
	};

	this.process = function(control, parameters) {
		const schemaType = qtools.getSurePath(
			parameters,
			'schema.schemaType',
			'helixAccess'
		);
		switch (schemaType) {
			case 'remoteControl':
				remoteControlAccess(control, parameters);
				break;

			case 'helixAccess':
			default:
				if (true) {
					helixAccess(control, parameters);
				} else {
					args.libDir = __dirname + '/lib/';
					const helixEngine = new helixEngineGen(args);
					helixEngine.helixAccess(control, parameters);
				}
		}
	};

	this.close = function() {
		releasePoolUser(resetConnector);
	};

	//INITIALIZATION ====================================

	const osascript = require('osascript').eval;

	initializeProperties();

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

