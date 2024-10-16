'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module);
const util = require('util');
const path = require('path');
const osascript = require('osascript').eval;

const remoteControlManagerGen = require('./remote-control-manager');
const helixEngineGen = require('./helix-engine');
const staticDataGen = require('./static-data');

const helixDataGen = require('./lib/helix-data');
const helixData = new helixDataGen();
const qt = require('qtools-functional-library');

const authenticationHandlerGen = require('./lib/authentication-handler');


let importableFileSequenceNumber = 0;

//START OF moduleFunction() ============================================================

const moduleFunction = function (args) {
	const argsErrorList = qtools.validateProperties(
		{
			subject: args || {},
			targetScope: this, //will add listed items to targetScope
			propList: [
				{
					name: 'helixUserAuth',
					optional: false,
				},
				{
					name: 'helixAccessParms',
					optional: false,
					note: 'helixAccessParms is the .ini file plus a property, schema, with the entire schema.json',
				},
				{
					name: 'processIdentifier',
					optional: true,
				},
				{
					name: 'apiAccessAuthParms',
					optional: true,
				},
				{
					name: 'req',
					optional: false,
				},
				{
					name: 'bootstrap',
					optional: true,
				},
			],
		},
		true,
	); //this is a server component, don't die on error

	const { hxScriptRunner, helixUserAuth, bootstrap } = args;
	

	if (argsErrorList) {
		throw new Error(argsErrorList);
	}
	const self = this;
	self.helixAccessParms = qtools.clone(self.helixAccessParms);
	self.helixAccessParms.helixUserAuth = helixUserAuth;

	const authenticationHandler = new authenticationHandlerGen({
		authKey: args.helixAccessParms.authKey,
		instanceId: args.helixAccessParms.instanceId,
		suppressTokenSecurityFeatures:
			args.helixAccessParms.suppressTokenSecurityFeatures,
		req: this.req,
	});

	this.apiAccessAuthParms = this.apiAccessAuthParms
		? this.apiAccessAuthParms
		: {};
	

	//LOCAL FUNCTIONS ====================================
	const exitEventHandler = () => {
		qtools.logMilestone('running exitEventHandler. does nothing');
		//releasePoolUser();
	};

	const cancelExitEventHandlers = () => {
		process.removeListener('exit', exitEventHandler);
	};

	//METHODS AND PROPERTIES ====================================

	

	//GET SCRIPT -----------------------------------------------------------------------

	const getScriptActual = (remoteControlDirectoryPath) => (functionName) => {
		const getScriptPathParameters = (functionName) => {
			const libDir = __dirname + '/interfaceLibrary/';

			const scriptNameMap = {
				save: {
					path: libDir + 'saveOne.applescript',
					language: 'AppleScript',
				},
				kill: {
					path: libDir + 'testQuitHelixNoSave.applescript',
					language: 'AppleScript',
				},
			};
			let scriptElement = scriptNameMap[functionName];

			if (scriptElement) {
				return { ...scriptElement, scriptFilePath: scriptElement.path };
			}

			const internalLibPath = path.join(__dirname, 'interfaceLibrary');

			if (remoteControlDirectoryPath) {
				scriptElement = {
					path: path.join(
						remoteControlDirectoryPath,
						`${functionName}.applescript`,
					),
					language: 'AppleScript',
					tqiiHacks: 'he is the worst! (remove this)',
				};

				if (qtools.realPath(scriptElement.path)) {
					return { ...scriptElement, scriptFilePath: scriptElement.path };
				}

				scriptElement = {
					path: path.join(remoteControlDirectoryPath, `${functionName}.jax`),
					language: 'Javascript',
				};

				if (qtools.realPath(scriptElement.path)) {
					return { ...scriptElement, scriptFilePath: scriptElement.path };
				}

				scriptElement = {
					path: path.join(remoteControlDirectoryPath, `${functionName}.bash`),
					language: 'BASH',
				};

				if (qtools.realPath(scriptElement.path)) {
					return { ...scriptElement, scriptFilePath: scriptElement.path };
				}
			}

			const internalScriptFilePath = path.join(
				internalLibPath,
				`${functionName}.applescript`,
			);

			scriptElement = {
				path: internalScriptFilePath,
				language: 'AppleScript',
				tqiiHacks: 'sure as hell does! (remove this)',
			};

			if (qtools.realPath(scriptElement.path)) {
				return { ...scriptElement, scriptFilePath: scriptElement.path };
			}

			scriptElement = {
				path: path.join(internalLibPath, `${functionName}.jax`),
				language: 'Javascript',
			};

			if (qtools.realPath(scriptElement.path)) {
				return { ...scriptElement, scriptFilePath: scriptElement.path };
			}

			scriptElement = {
				path: path.join(internalLibPath, `${functionName}.bash`),
				language: 'BASH',
			};

			if (qtools.realPath(scriptElement.path)) {
				return { ...scriptElement, scriptFilePath: scriptElement.path };
			}
		};
		const scriptElement = getScriptPathParameters(functionName);

		if (!scriptElement) {
			qtools.logError(`missing scriptElement for ${functionName}`);
			return;
		}

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
	

	

	//COMPILE SCRIPT -----------------------------------------------------------------------
	

	

	const compileScriptActual =
		(helixAccessParms, makeApplescriptDataString) => (args) => {
			const { scriptElement, processName, parameters, helixSchema } = args;

			const inData = qtools.clone(parameters.inData) || {};
			const otherParms = { ...(parameters.otherParms || {}), ...scriptElement };

			const workingHelixAccessParms = qtools.clone(helixAccessParms);

			//substitute pool user credentials into the replaceObject
			if (
				parameters.poolUserObject &&
				parameters.poolUserObject.leaseUserName
			) {
				workingHelixAccessParms.user = parameters.poolUserObject.leaseUserName;
				workingHelixAccessParms.password =
					parameters.poolUserObject.leasePassword;
			}

			for (var i in inData) {
				var element = inData[i];

				if (typeof element == 'string') {
					inData[i] = element.replace(/\"/g, '\\"');
				}

				// 			for (var j in element) {
				// 				const detail = element[j];
				// 				element[j] =
				// 					typeof detail == 'string' ? detail.replace(/\"/g, '\\"') : detail;
				// 			}
			}

			const replaceObject = qtools.extend(
					{},
					workingHelixAccessParms,
					helixSchema,
					inData,
					otherParms,
					{
						processName: processName,
					},
				),
				script = scriptElement.script;

			replaceObject.dataString = makeApplescriptDataString({
				schema: helixSchema,
				otherParms,
				inData,
				separators: helixSchema.separators,
				workingHelixAccessParms,
			});

			if (qtools.isTrue(helixSchema.debugData) && !helixSchema.internalSchema) {
				const filePath = `/tmp/hxcReplaceObj_${
					helixSchema.schemaName
				}/hxc_HelixReplaceObject_${new Date().getTime()}_${
					helixSchema.schemaName
				}.json`;
				qtools.logWarn(
					`WRITING helix replaceObject with helix db output data to file: ${filePath} (debugData=true)`,
				);
				qtools.writeSureFile(
					filePath,
					JSON.stringify(
						{
							inData,
							dataString: replaceObject.dataString,
							processName: replaceObject.processName,
							helixSchema,
							otherParms,
						},
						'',
						'\t',
					),
				);

				const importableDirName = `/tmp/importable/${helixSchema.schemaName}_${(new Date().getTime() / 1000000).toFixed(0)}`;
				require('fs').mkdirSync(importableDirName, { recursive: true });
				const importableFilePath = `${importableDirName}/${
					helixSchema.schemaName
				}_Helix_IMPORTABLE__${importableFileSequenceNumber++}.txt`;
				qtools.logWarn(
					`WRITING helix IMPORTABLE File with helix db output data to file: ${importableFilePath} (debugData=true)`,
				);
				qtools.writeSureFile(
					importableFilePath,
					replaceObject.dataString.replace(/^"/, '').replace(/"$/, ''),
				);
			}

			//otherParms gets the query in get/post-responder-catchall.js including meta query elements, if any
			//eg, hxcPagedRecordCount, hxcPagedRecordOffset, hxcReturnMetaDataOnly

			if (
				helixSchema.criterion &&
				parameters.criterion &&
				parameters.criterion.data
			) {
				replaceObject.criterion = getCriterion(
					helixSchema,
					helixSchema.criterion,
				);
				replaceObject.criterion.dataString = makeApplescriptDataString({
					schema: helixSchema.criterion,
					otherParms,
					inData: parameters.criterion.data,
				});
			}

			if (
				helixSchema.response &&
				parameters.response &&
				parameters.response.data
			) {
				replaceObject.response = getresponse(helixSchema, helixSchema.response);
				replaceObject.response.dataString = makeApplescriptDataString(
					helixSchema.response,
					otherParms,
					parameters.response.data,
				);
			}

			const finalScript = qtools.templateReplace({
				template: script.toString(),
				replaceObject: replaceObject,
			});

			return finalScript;
		};
	

	//STATIC RETRIEVAL -----------------------------------------------------------------------

	const executeProcessActual =
		(
			getScript,
			compileScript,
			executeStaticTestRoute,
			remoteControlManagerGen,
			helixEngineGen,
			helixAccessParms,
		) =>
		(libraryScriptName, retrievalParms, callback) => {
			if (!retrievalParms.schema) {
				retrievalParms('Must have schema');
				return;
			}
			//this allows mapping of user friendly names to file names and processes
			//also complex tasks if needed, especially if other thing need killing

			//	const QUERYPARMS=retrievalParms.criterion

			const { otherParms } = retrievalParms;

			switch (libraryScriptName) {
				case 'kill':
				case 'quitHelixNoSave':
					new helixEngineGen({
						getScript,
						compileScript,
						helixAccessParms,
					}).execute('testQuitHelixNoSave', retrievalParms);
					break;
				case 'fromFile':
				case 'staticTest':
					executeStaticTestRoute(
						retrievalParms.schema,
						retrievalParms.callback,
					);
					break;
				case 'remoteControlManager':
					new remoteControlManagerGen({
						getScript,
						compileScript,
					}).execute(retrievalParms.schema.scriptName, retrievalParms);
					break;
				case 'THIS IS THE MAIN CASE FOR ACCESSING HELIX':
				case 'retrieveRecords':
				case 'saveOneWithProcess':
				case 'testOpenTestDb':
					const helixEngineInstance3 = new helixEngineGen({
						getScript,
						compileScript,
						helixAccessParms,
						otherParms,
					});

					const invalid = helixEngineInstance3.validateSchema(retrievalParms);
					if (invalid) {
						callback(new Error(invalid));
						return;
					}

					helixEngineInstance3.execute(libraryScriptName, retrievalParms); //executeActual
					break;
				default:
					retrievalParms.callback(
						`unknown libraryScriptName type '${libraryScriptName}' in helixConnector.js`,
					);
					break;
			}
		};
	

	//STATIC RETRIEVAL -----------------------------------------------------------------------

	const executeStaticTestRouteActual =
		(staticDataGen) => (helixSchema, callback) => {
			const executeStaticTest = (helixSchema, staticDataGen, callback) => {
				const buildResponse = (helixData, helixSchema, data) => {
					return helixData.arrayOfRecordsToArrayOfResponseObjects(
						helixSchema.fieldSequenceList,
						helixSchema.mapping,
						data,
					);
				};
				const staticData = new staticDataGen();

				const outData = staticData.get(
					helixSchema.staticTestData,
					self.helixAccessParms.staticDataDirectoryPath,
					helixSchema,
					self.helixAccessParms,
				);
				callback('', buildResponse(helixData, helixSchema, outData));
			};

			executeStaticTest(helixSchema, staticDataGen, callback);
		};
	

	//MAIN ENTRY ROUTINE =======================================================================

	const processActual = (executeProcess) => (control, parameters) => {
		const { callback } = parameters;

		const publicEndpoint = qtools.getSurePath(
			parameters,
			'schema.publicEndpoint',
			false,
		);

		if (!publicEndpoint) {
			const errorMessage = authenticationHandler.validateUserToken(
				this.apiAccessAuthParms,
			);
			if (typeof errorMessage == 'string') {
				callback(errorMessage);
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
			'helixAccess',
		);

		schemaType = qtools.getSurePath(parameters, 'schema.staticTestRequestFlag')
			? 'staticTest'
			: schemaType;

		control = qtools.getSurePath(parameters, 'schema.staticTestRequestFlag')
			? 'staticTest'
			: control;

		if (
			!['staticTest', 'staticTest', 'remoteControl', 'helixAccess'].includes(
				schemaType,
			)
		) {
			callback(new Error(`unknown schemaType '${schemaType}'`));
			return;
		}

		const localCallback = (err, result) => {
			callback(err, result);
		};
		executeProcess(control, parameters, localCallback);
	};

	//INITIALIZATION =======================================================================

	const getScript = getScriptActual(
		self.helixAccessParms.remoteControlDirectoryPath,
	);

	const compileScript = compileScriptActual(
		this.helixAccessParms,
		helixData.makeApplescriptDataString,
	);

	const executeStaticTestRoute = executeStaticTestRouteActual(staticDataGen);
	

	const executeProcess = executeProcessActual(
		getScript,
		compileScript,
		executeStaticTestRoute,
		remoteControlManagerGen,
		helixEngineGen,
		this.helixAccessParms,
	);

	this.generateAuthToken = (() => {
		const errorMessage = authenticationHandler.validateUserToken(
			this.apiAccessAuthParms,
			{ bootstrap },
		); //bootstrap is set to true by generate-token.js to allow creation of tokens from trusted IP addresses
		if (typeof errorMessage == 'string') {
			return (body, callback) => {
				callback(errorMessage);
			};
		}
		return authenticationHandler.generateAuthToken; //generateAuthToken() called from helixAjax
	})();

	this.checkUserPool = (callback) => {
		new helixEngineGen({
			getScript,
			compileScript,
			helixAccessParms: args.helixAccessParms,
		}).checkUserPool(callback);
	};
	

	this.process = processActual(executeProcess);

	this.close = () => {
		//releasePoolUser();
	};

	//DISCARD ====================================

	this.forceEvent = (eventName, outData) => {
		this.emit(eventName, {
			eventName: eventName,
			data: outData,
		});
	};

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;

