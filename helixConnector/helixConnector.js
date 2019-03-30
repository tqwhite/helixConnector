'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module);
const util = require('util');
const path = require('path');
const osascript = require('osascript').eval;

const remoteControlManagerGen = require('./remote-control-manager');
const helixAccessManagerGen = require('./helix-engine');
const staticDataGen = require('./static-data');

const helixDataGen = require('helixdata');
const helixData = new helixDataGen();

//START OF moduleFunction() ============================================================

const moduleFunction = function(args) {
	const argsErrorList = qtools.validateProperties(
		{
			subject: args || {},
			targetScope: this, //will add listed items to targetScope
			propList: [
				{
					name: 'helixAccessParms',
					optional: false,
					note:
						'helixAccessParms is the .ini file plus a property, schema, with the entire schema.json'
				},
				{
					name: 'processIdentifier',
					optional: true
				},
				{
					name: 'authGoodies',
					optional: true
				}
			]
		},
		true
	); //this is a server component, don't die on error

	if (argsErrorList) {
		throw new Error(argsErrorList);
	}
	const self = this;
	self.helixAccessParms = qtools.clone(self.helixAccessParms);
	

	//LOCAL FUNCTIONS ====================================
	const exitEventHandler = () => {
		qtools.logMilestone('running exitEventHandler. does nothing');
		//releasePoolUser();
	};

	const cancelExitEventHandlers = () => {
		process.removeListener('exit', exitEventHandler);
	};

	//METHODS AND PROPERTIES ====================================

	const jwt = require('jsonwebtoken');

	const generateAuthTokenActual = (authKey, instanceId) => (
		userId,
		callback
	) => {
		const token = jwt.sign(
			{
				userId: userId,
				instanceId: instanceId
			},
			authKey
		);
		callback('', token);
	};
	
	const validateUserTokenActual = (jwt, authKey, instanceId) => authGoodies => {
		const { userId, authToken } = authGoodies;

		let decoded;
		try {
			decoded = jwt.verify(authToken, authKey);
		} catch (e) {
			return e.toString();
		}
		
		
console.log(`\n=-=============   decoded  ========================= [helixConnector.js.moduleFunction]\n`);

// 
// console.dir({"decoded [helixConnector.js.moduleFunction]":decoded});
// console.log("instanceId="+instanceId+" [helixConnector.js.moduleFunction]");
// console.log(`\n=-=============   instanceId  ========================= [helixConnector.js.moduleFunction]\n`);





		if (decoded.instanceId != instanceId) {
			return 'instanceId does not match';
		}
		if (decoded.userId != userId) {
			return 'userId does not match';
		}
		return decoded;
	};
	
	//DISPATCH ====================================

	const getScriptActual = remoteControlDirectoryPath => functionName => {
		const getScriptPathParameters = functionName => {
			const libDir = __dirname + '/lib/';

			const scriptNameMap = {
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
	
	
	const getCriterion = (parentSchema, schema) => {
		if (typeof schema == 'string') {
			const libPath = path.join(this.helixAccessParms.configDirPath, schema);
			const json = qtools.fs.readFileSync(libPath).toString();
			schema = JSON.parse(json);
		}
		return schema;
	};
	const compileScriptActual = (
		helixAccessParms,
		makeApplescriptDataString
	) => args => {
		const { scriptElement, processName, parameters, helixSchema } = args;

		const inData = qtools.clone(parameters.inData) || {};
		const otherParms = parameters.otherParms || {};

		const replaceObject = qtools.extend(
				{},
				helixAccessParms,
				helixSchema,
				inData,
				otherParms,
				{
					processName: processName
				}
			),
			script = scriptElement.script;

		replaceObject.dataString = makeApplescriptDataString(
			helixSchema.fieldSequenceList,
			helixSchema.mapping,
			otherParms,
			inData,
			helixSchema.separators
		);

		if (
			helixSchema.criterion &&
			parameters.criterion &&
			parameters.criterion.data
		) {
			replaceObject.criterion=getCriterion(helixSchema, helixSchema.criterion);
			replaceObject.criterion.dataString = makeApplescriptDataString(
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

	const executeProcessActual = (
		getScript,
		compileScript,
		executeStaticTestRoute,
		remoteControlManagerGen,
		helixAccessManagerGen
	) => (libraryScriptName, parameters, callback) => {
		if (!parameters.schema) {
			parameters('Must have schema');
			return;
		}
		//this allows mapping of user friendly names to file names and processes
		//also complex tasks if needed, especially if other thing need killing
		switch (libraryScriptName) {
			case 'kill':
			case 'quitHelixNoSave':
				new helixAccessManagerGen({
					getScript,
					compileScript
				}).execute('quitHelixNoSave', parameters);
				break;
			case 'staticTest':
				executeStaticTestRoute(
					parameters.schema,
					parameters.callback
				);
				break;
			case 'remoteControlManager':
				new remoteControlManagerGen({
					getScript,
					compileScript
				}).execute(parameters.schema.scriptName, parameters);
				break;
			case 'retrieveRecords':
			case 'saveDirect':
			case 'openTestDb':
				const processManager3 = new helixAccessManagerGen({
					getScript,
					compileScript
				});
				
				const invalid = processManager3.validateSchema(parameters);
				if (invalid) {
					callback(new Error(invalid));
					return;
				}

				processManager3.execute(libraryScriptName, parameters);
				break;
			default:
				parameters.callback(`unknown libraryScriptName type '${libraryScriptName}' in helixConnector.js`);
				break;
		}
	};
	
	const executeStaticTestRouteActual = staticDataGen => (
		helixSchema,
		callback
	) => {
		const executeStaticTest = (helixSchema, staticDataGen, callback) => {
			const buildResponse = (helixData, helixSchema, data) => {
				return helixData.arrayOfRecordsToArrayOfResponseObjects(
					helixSchema.fieldSequenceList,
					helixSchema.mapping,
					data
				);
			};
			const staticData = new staticDataGen();
			const outData = staticData.get(
				helixSchema.staticTestData,
				self.helixAccessParms.staticDataDirectoryPath,
				helixSchema,
				self.helixAccessParms
			);
			callback('', buildResponse(helixData, helixSchema, outData));
		};

		executeStaticTest(helixSchema, staticDataGen, callback);
	};
	
	this.process = (control, parameters) => {
		const publicEndpoint = qtools.getSurePath(
			parameters,
			'schema.publicEndpoint',
			false
		);

		if (!publicEndpoint) {
			const errorMessage = validateUserToken(this.authGoodies);
			if (typeof errorMessage == 'string') {
				parameters.callback(errorMessage);
				return;
			}
		}

		parameters.schema = parameters.helixSchema
			? parameters.helixSchema
			: parameters.schema;
		delete parameters.helixSchema; //eliminate overlooked helixSchema in favor of plain schema, 11/25/18, tqii

		let schemaType = qtools.getSurePath(
			parameters,
			'schema.schemaType',
			'helixAccess'
		);

		schemaType = qtools.getSurePath(parameters, 'schema.staticTestRequestFlag')
			? 'staticTest'
			: schemaType;

		control = qtools.getSurePath(parameters, 'schema.staticTestRequestFlag')
			? 'staticTest'
			: control;
		
		if (!['staticTest', 'remoteControl', 'helixAccess'].includes(schemaType)) {
			parameters.callback(new Error(`unknown schemaType '${schemaType}'`));
			return;
		}

		executeProcess(control, parameters, parameters.callback);
	};

	this.close = () => {
		//releasePoolUser();
	};

	//INITIALIZATION ====================================
	

	this.authGoodies = this.authGoodies ? this.authGoodies : {};

	this.forceEvent = (eventName, outData) => {
		this.emit(eventName, {
			eventName: eventName,
			data: outData
		});
	};
	
	const getScript = getScriptActual(
		self.helixAccessParms.remoteControlDirectoryPath
	);

	const compileScript = compileScriptActual(
		this.helixAccessParms,
		helixData.makeApplescriptDataString
	);
	
	const executeStaticTestRoute = executeStaticTestRouteActual(staticDataGen);
	const executeProcess = executeProcessActual(
		getScript,
		compileScript,
		executeStaticTestRoute,
		remoteControlManagerGen,
		helixAccessManagerGen
	);

	const validateUserToken = validateUserTokenActual(
		jwt,
		args.helixAccessParms.authKey,
		args.helixAccessParms.instanceId
	);
	
	this.generateAuthToken = generateAuthTokenActual(
		args.helixAccessParms.authKey,
		args.helixAccessParms.instanceId
	);
	
	
	this.validateUserTokenUnitTestEndpoint = validateUserToken; //for unit testing
	

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;

