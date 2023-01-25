#!/usr/local/bin/node
'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util');

var express = require('express'); //powered by header removed below for snyk
var app = express();
const https = require('https');

const fs=require('fs');
const path = require('path');

const schemaMapAssemblerGen = require('./lib/schema-map-assembler');

const notifier = require('node-notifier'); //https://www.npmjs.com/package/node-notifier
const asynchronousPipePlus = new require('qtools-asynchronous-pipe-plus')();
const pipeRunner = asynchronousPipePlus.pipeRunner;
const taskListPlus = asynchronousPipePlus.taskListPlus;

const qt = require('qtools-functional-library');

const rateLimit = require('express-rate-limit'); //added becasue snyk worries about denial of service attacks

const mergeDeep = require('merge-deep');

const summarizeConfig = require('./lib/summarize-config');
const externalAuthorization = require('./lib/external-authorization');

const hxcVersion = require('./lib/version');
qtools.logMilestone('\nStarting hxAjax *************************');
console.error(`helixAjax startup beginning: ${new Date().toLocaleString()}`); //it's very helpful to have this annotation in the error log
qtools.logWarn('Freezing Object.prototype');
Object.freeze(Object.prototype); //must come after qtFunctionalLibrary which updates prototypes

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	events.EventEmitter.call(this);
	this.forceEvent = forceEvent;
	this.args = args;
	this.metaData = {};
	this.addMeta = function(name, data) {
		this.metaData[name] = data;
	};

	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};

	//VALIDATE ENVIRONMENT VARIABLE SETUP ====================================

	if (!process.env.helixProjectPath) {
		var message = 'there must be an environment variable: helixProjectPath';
		qtools.logError(message);
		return message;
	}

	if (!process.env.helixAjaxPagesPath) {
		var message = 'there must be an environment variable: helixAjaxPagesPath';
		qtools.logError(message);
		return message;
	}

	if (!process.env.USER && !process.env.HXCONNECTORUSER) {
		var message =
			'there must be an environment variable: USER or HXCONNECTORUSER';
		qtools.logError(message);
		return message;
	}

	//UTILITY FUNCTIONS ====================================

	const reminder = (message, title = 'hxConnector Update') => {
		notifier.notify(
			{
				title: title,
				message: message,
				sound: false, // Case Sensitive string for location of sound file, or use one of macOS' native sounds (see below)
				icon: 'Terminal Icon', // Absolute Path to Triggering Icon
				contentImage: void 0, // Absolute Path to Attached Image (Content Image)
				open: `http://localhost:${
					staticPageDispatchConfig.port
				}/manageConnector`, // URL to open on Click
				wait: false, // Wait for User Action against Notification or times out. Same as timeout = 5 seconds

				// New in latest version. See `example/macInput.js` for usage
				timeout: 5, // Takes precedence over wait if both are defined.
				closeLabel: void 0, // String. Label for cancel button
				actions: void 0, // String | Array<String>. Action label or list of labels in case of dropdown
				dropdownLabel: void 0, // String. Label to be used if multiple actions
				reply: false // Boolean. If notification should take input. Value passed as third argument in callback and event emitter.
			},
			(err, result) => {}
		);
	};

	const addInternalEndpoints = clientSchema => {
		//someday maybe implement the whole include function, for now, just get fileOne.json
		const fileOneSubPath='./internalEndpoints/fileOne.json';
		const fileOnePath=path.join(path.dirname(module.filename), fileOneSubPath);
		const internalSchema = require(fileOnePath);
		return Object.assign({}, internalSchema.schemaMap, clientSchema);
	};

	const getSchema = (helixParms, schemaName) => {
		let schema = helixParms.schemaMap[schemaName];
		if (typeof schema == 'string') {
			const libPath = path.join(helixParms.configDirPath, schema);
			let json;
			try {
				json = qtools.fs.readFileSync(libPath).toString();
				//snyk is wrong: libPath is the result of a lookup in a table. An invalid req.path will find no result and an error will be thrown.
			} catch (e) {
				qtools.logError(`ERROR: no such file: ${libPath}`);
				return;
			}
			schema = JSON.parse(json);
		}
		return schema;
	};

	//ENVIRONMENT AND CONFIG ====================================

	const hxConnectorUser = process.env.HXCONNECTORUSER || process.env.USER;

	const configDirPath = (configPath = path.join(
		process.env.helixProjectPath,
		'configs/',
		hxConnectorUser
	));

	var configPath = path.join(configDirPath, '/systemParameters.ini');

	const configOverridePath = path.join(
		configDirPath,
		'/systemParametersOverride.ini'
	);

	if (!qtools.realPath(configPath)) {
		var message = 'configuration file ' + configPath + ' is missing';
		qtools.logError(message);
		return message;
	}

	qtools.logMilestone(`configuration file found: ${configPath}`);

	var helixConnectorPath = process.env.helixConnectorPath + 'helixConnector.js';
	if (!qtools.realPath(helixConnectorPath)) {
		var message =
			'helixConnectorPath file ' + helixConnectorPath + ' is missing';
		qtools.logError(message);
		return message;
	}

	const tmpConfig = qtools.configFileProcessor.getConfig(configPath);
	let newConfig = tmpConfig;
	qtools.putSurePath(newConfig, 'system.hxConnectorUser', hxConnectorUser);

	if (qtools.realPath(configOverridePath)) {
		const overrideConfig = qtools.configFileProcessor.getConfig(
			configOverridePath
		);
		qtools.logMilestone(
			`ALERT: OVERRIDE config file found: ${configOverridePath}`
		);
		newConfig = mergeDeep(newConfig, overrideConfig);
	}

	const bootTime = new Date().toLocaleString();

	//ORGANIZE SCHEMA MAP ============================================================

	const collectionName = qtools.getSurePath(newConfig, 'system.collection');
	const schemaMapName =
		qtools.getSurePath(newConfig, 'system.schemaMapName') || collectionName;

	const staticPageDispatchConfig = qtools.getSurePath(
		newConfig,
		'staticPageDispatch',
		{}
	);

	let schemaMapPath;
	const schemaMapDirectoryPath = qtools.getSurePath(
		newConfig,
		'system.schemaMapDirectoryPath'
	);
	if (schemaMapDirectoryPath) {
		schemaMapPath = path.join(schemaMapDirectoryPath, `${schemaMapName}.json`);
	} else {
		schemaMapPath = path.join(
			process.env.helixProjectPath,
			'configs',
			hxConnectorUser,
			`${schemaMapName}.json`
		);
	}

	const schemaMapAssembler = new schemaMapAssemblerGen();
	const schemaMap = schemaMapAssembler.getSchemaMap(schemaMapPath);

	//ORGANIZE HELIXPARMS ============================================================

	const helixParms = qtools.getSurePath(newConfig, 'system');
	const adminPagesAccessData = qtools.getSurePath(
		newConfig,
		'adminPagesAccessData'
	);

	global.applicationLoggingIdString = helixParms.instanceId;

	helixParms.schemaMap = addInternalEndpoints(schemaMap.schemaMap);

	helixParms.configDirPath = configDirPath;

	//SET UP SERVER =======================================================

	var router = express.Router();
	var bodyParser = require('body-parser');

	app.use(express.json({ limit: '4gb' }));
	app.use(function(req, res, next) {
		
		// console.log(`\n=-=============   req.path  ========================= [helixAjaxActual.js.[ anonymous ]]\n`);
		//
		//
		// console.log(`req.path=${req.path}`);
		//
		// console.log(`\n=-=============   req.path  ========================= [helixAjaxActual.js.[ anonymous ]]\n`);
		//
		//
		//
		// 		if (req.path.match(/.*hxc___000__000_200_01___noDbTable.*/)){
		// 			qtools.logError(`hxc___000__000_200_01___noDbTable AppleEvent timed out`);
		// 			res.status(500).send('AppleEvent timed out');
		// 			return;
		// 		}
		console.log(
			`hxC REQUEST URL: ${req.protocol}://${req.hostname}/${req.url} (${
				req.method
			}) ${new Date().toLocaleString()}`
		);
		next();
	});

	app.use(function(req, res, next) {
		res.removeHeader('X-Powered-By'); //snyk hates this header.
		next();
	});

	// 	app.use(
	// 		rateLimit({
	// 			windowMs: 1 * 60 * 1000, // 15 minutes
	// 			max: 60, // limit each IP to 350 requests per windowMs (mirror processes use this amount),
	// 			message:
	// 				'one per second, take it or leave it. this is not a public server'
	// 		})
	// 	); //snyk worries about denial of service attacks.

	app.use(
		bodyParser.json({
			extended: true
		})
	);

	app.use(function(err, req, res, next) {
		//bodyParser.json produces a syntax error when it gets badly formed json
		//this catches the error

		if (err) {
			qtools.logError(`JSON.parse() error: ${err.toString()}`);
			res.status(400).send(err.toString());
			return;
		}
		next();
	});

	app.use(
		bodyParser.urlencoded({
			extended: true
		})
	);

	//STATIC PAGE DISPATCH =======================================================

	var staticPageDispatch = require('./lib/static-page-dispatch');
	staticPageDispatch = new staticPageDispatch({
		router: router,
		filePathList: [process.env.helixAjaxPagesPath],
		suppressLogEndpointsAtStartup: qtools.getSurePath(
			newConfig,
			'system.suppressLogEndpointsAtStartup'
		),
		helixParms,
		adminPagesAccessData
	});

	const generateEndpointList = require('./lib/messaging-functions/show-endpoint-info').showInfo(
		{
			helixParms,
			newConfig,
			getSchema,
			suppressLogEndpointsAtStartup: qtools.getSurePath(
				newConfig,
				'system.suppressLogEndpointsAtStartup'
			)
		}
	);

	//START CONNECTOR ============================================================

	const helixConnectorGenerator = require(helixConnectorPath);

	const verifyRelationHasPoolUsersInstalled = helixParms => (args, next) => {
		const localCallback = (err, result) => {
			if (!args.processResult) {
				args.processResult = [];
			}
			args.processResult.push(result);
			next(err, args);
		};
		if (false) {
			qtools.logMilestone('Initiating startup check for: Pool User Tables');
			var localSpecialHxConnector = new helixConnectorGenerator({
				helixAccessParms: helixParms
			});
			localSpecialHxConnector.checkUserPool(localCallback);
		} else {
			qtools.logMilestone('SKIPPING startup check for: Pool User Tables');
			localCallback();
		}
	}; //this was useful back in the day when we didn't know which db had what. Now they all work and this takes tooo long.

	const fabricateConnector = function(req, res, schema, bootstrap) {
		const headerAuth = req.headers ? req.headers.authorization : '';

		const tmp = headerAuth ? headerAuth.split(' ') : [];

		const apiAccessAuthParms = {
			authToken: tmp[1] ? tmp[1] : '',
			userId: tmp[0] ? tmp[0] : ''
		};

		const helixUserAuth = {
			hxUser: req.headers ? req.headers.hxuser : '',
			hxPassword: req.headers ? req.headers.hxpassword : ''
		};

		try {
			var helixConnector = new helixConnectorGenerator({
				helixAccessParms: helixParms,
				apiAccessAuthParms,
				helixUserAuth,
				req,
				bootstrap
			});
		} catch (err) {
			qtools.logError(qtools.dump(err, true));
			res.status(400).send(err.toString());
			return;
		}

		//I have lately decided that it is incorrect to have this function detect a missing schema error
		//and do not want future code to do that so I added this hack.
		//If schema is exactly equal to false, it is interpreted to override this behavior.
		//For existing code, this should not change behavior at all. tqii, 11/24/21
		if (schema !== false && (!schema || schema.private)) {
			res.status('404').send('Bad Request: No such schema');
			return;
		}

		return helixConnector;
	};

	const verifySystemForStartup = (taskList, callback) => {
		const initialData = typeof inData != 'undefined' ? inData : {};
		qtools.logMilestone('Executing system startup validation checks');
		pipeRunner(taskList, initialData, (err, finalResult) => {
			callback(err, finalResult);
		});
	};

	//HTTP OUTPUT FUNCTIONS =======================================================

	const send500 = (res, req, message) => {
		qtools.logWarn(`500 error: ${req.path}=>${message}`);
		res.status(500).send(escape(message));
	};

	const send200 = (res, req, result) => {
		res.status('200');
		res.set({
			'content-type': 'application/json;charset=ISO-8859-1',
			messageid: qtools.newGuid(),
			messagetype: 'RESPONSE',
			responsesource: 'helixConnector',
			connection: 'Close'
		});

		res.json(result);
	};

	const sendResult = function(res, req, next, helixConnector) {
		return function(err, result) {
			if (err) {
				send500(res, req, err.toString());
				helixConnector.close();
				return;
			}
			send200(res, req, result);
			helixConnector.close();
		};
	};

	//START SERVER ROUTING =======================================================

	const utilityEnpoints = require('./lib/endpoint-responders/utility-endpoints');
	const getResponder = require('./lib/endpoint-responders/get-responder-catchall');
	const postResponder = require('./lib/endpoint-responders/post-responder-catchall');
	const generateTokenResponder = require('./lib/endpoint-responders/generate-token');

	const schemaResolver = require('./lib/get-resolved-schema')({
		getSchema,
		helixParms,
		send500
	});
	
	const hxClientSpecialAuthPath = 'hxClientAuth';
	externalAuthorization({
		app,
		router,
		newConfig,
		hxClientSpecialAuthPath,
		helixConnectorPackage: {
			fabricateConnector,
			sendResult,
			send500
		}
	}).install(); //must precede app.use('/', router);
	
	router.get(
		/ping/,
		utilityEnpoints.ping({ staticPageDispatchConfig, hxcVersion, bootTime })
	);
	router.get(
		/hxConnectorCheck/,
		utilityEnpoints.hxConnectorCheck({ staticPageDispatchConfig })
	);
	router.get(
		/hxDetails/,
		utilityEnpoints.hxDetails({ summarizeConfig, newConfig })
	);
	router.post(
		/generateToken/,
		new generateTokenResponder({
			getSchema,
			helixParms,
			fabricateConnector,
			sendResult,
			send500,
			newConfig
		}).responder
	);

	//these need to appear after all the other endpoints

	// 	router.get(/\/([^\w-.]+)/g, (req, res) =>
	// 		send500(res, req, `Bad Path: ${req.path}`)
	// 	);
	// 	router.post(/\/([^\w-.]+)/g, (req, res) =>
	// 		send500(res, req, `Bad Path: ${req.path}`)
	// 	);
	router.get(
		/.*/,
		new getResponder({
			schemaResolver,
			getSchema,
			helixParms,
			fabricateConnector,
			sendResult,
			send500
		}).responder
	);
	router.post(
		/.*/,
		new postResponder({
			schemaResolver,
			fabricateConnector,
			sendResult,
			send500
		}).responder
	);

	//STARTUP FUNCTIONR =======================================================
	
	app.use('/', router);

	staticPageDispatchConfig.port = staticPageDispatchConfig.port
		? staticPageDispatchConfig.port
		: '9000';

	const startServer = (err, result) => {
		if (err) {
			if (typeof err.join == 'function') {
				qtools.logError(`FATAL ERROR: ${err.join('\n')}`);
			} else {
				qtools.logError(`FATAL ERROR: ${err}`);
			}
		} else {
			if (
				result &&
				result.processResult &&
				typeof result.processResult.join == 'function'
			) {
				qtools.logMilestone(
					`listener startup complete: ${result.processResult.join('\n')}`
				);
			} else if (result && result.processResult) {
				qtools.logMilestone(
					`listener startup finished: ${result.processResult.toString()}`
				);
			}

			let sslAnnotation = '';
			if (
				staticPageDispatchConfig.certDirPath &&
				!staticPageDispatchConfig.sslSuppressOverride
			) {
				https
					.createServer(
						{
							key: qtools.fs
								.readFileSync(`${staticPageDispatchConfig.certDirPath}/key.pem`)
								.toString(),
							cert: qtools.fs
								.readFileSync(
									`${staticPageDispatchConfig.certDirPath}/cert.pem`
								)
								.toString(),
							passphrase: qtools.fs
								.readFileSync(
									`${staticPageDispatchConfig.certDirPath}/passphrase.txt`
								)
								.toString()
						},
						app
					)
					.listen(staticPageDispatchConfig.sslPort);
				sslAnnotation = ` and ssl on port ${staticPageDispatchConfig.sslPort}`;
			}

			app.listen(staticPageDispatchConfig.port);

			const startupConfigurationOutput = require('./lib/messaging-functions/startup-configuration-output').sendOutput(
				{
					newConfig,
					reminder,
					schemaMapPath,
					hxcVersion,
					staticPageDispatchConfig,
					sslAnnotation,
					helixParms,
					summarizeConfig
				}
			);
		}
	};

	//START SERVER =======================================================

	verifySystemForStartup(
		[verifyRelationHasPoolUsersInstalled(helixParms)],
		startServer
	);

	//END OF LIFE CODE =======================================================


	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

new moduleFunction();

