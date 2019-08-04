#!/usr/local/bin/node
'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util');

var express = require('express');
var app = express();

const os = require('os');

const path = require('path');

const schemaMapAssemblerGen=require('./lib/schema-map-assembler');

const notifier = require('node-notifier'); //https://www.npmjs.com/package/node-notifier

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

	//LOCAL FUNCTIONS ====================================
	const reminder = (message, title='hxConnector Update') => {
		notifier.notify({
			title: title,
			message: message,
			sound: false, // Case Sensitive string for location of sound file, or use one of macOS' native sounds (see below)
			icon: 'Terminal Icon', // Absolute Path to Triggering Icon
			contentImage: void 0, // Absolute Path to Attached Image (Content Image)
			open: `http://localhost:${config.port}/manageConnector`, // URL to open on Click
			wait: false, // Wait for User Action against Notification or times out. Same as timeout = 5 seconds
			
			// New in latest version. See `example/macInput.js` for usage
			timeout: 5, // Takes precedence over wait if both are defined.
			closeLabel: void 0, // String. Label for cancel button
			actions: void 0, // String | Array<String>. Action label or list of labels in case of dropdown
			dropdownLabel: void 0, // String. Label to be used if multiple actions
			reply: false // Boolean. If notification should take input. Value passed as third argument in callback and event emitter.
		}, (err, result)=>{});
	};

	
	const lastRestartTime = new Date().toLocaleString();
	
	const addInternalEndpoints=(clientSchema)=>{
		//someday maybe implement the whole include function, for now, just get fileOne.json 
		const internalSchema = require("./internalEndpoints/fileOne.json");
		return Object.assign({}, internalSchema.schemaMap, clientSchema);
	
	}
	
	const getSchema = (helixParms, schemaName) => {
		let schema = helixParms.schemaMap[schemaName];
		if (typeof schema == 'string') {
			const libPath = path.join(helixParms.configDirPath, schema);
			const json = qtools.fs.readFileSync(libPath).toString();
			schema = JSON.parse(json);
		}
		return schema;
	};
	
	const generateEndpointList = helixParms => {
		const endpointList = [];
		for (var schemaName in helixParms.schemaMap) {
			var element = getSchema(helixParms, schemaName);
			const dyn = element.testViewName ? `dynamicTest/${schemaName}, ` : '';
			const stat = element.staticTestData ? `staticTest/${schemaName}` : '';
			endpointList.push(`${schemaName}, ${dyn}${stat}`);
		}
		return endpointList;
	};

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

	const hxConnectorUser = process.env.HXCONNECTORUSER || process.env.USER;
	
	const configDirPath = (configPath =
		process.env.helixProjectPath + 'configs/' + hxConnectorUser);

	var configPath = configDirPath + '/systemParameters.ini';

	if (!qtools.realPath(configPath)) {
		var message = 'configuration file ' + configPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	
	var helixConnectorPath = process.env.helixConnectorPath + 'helixConnector.js';
	if (!qtools.realPath(helixConnectorPath)) {
		var message =
			'helixConnectorPath file ' + helixConnectorPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	

	
	const newConfig = qtools.configFileProcessor.getConfig(configPath);
	
	const collectionName = qtools.getSurePath(newConfig, 'system.collection');
	const schemaMapName =
		qtools.getSurePath(newConfig, 'system.schemaMapName') || collectionName;

	const staticPageDispatchConfig = qtools.getSurePath(
		newConfig,
		'staticPageDispatch',
		{}
	);

	const schemaMapPath =
		process.env.helixProjectPath +
		'configs/' +
		hxConnectorUser +
		'/' +
		schemaMapName +
		'.json';
	const schemaMapAssembler=new schemaMapAssemblerGen();
	const schemaMap=schemaMapAssembler.getSchemaMap(schemaMapPath);

	const helixConnectorGenerator = require(helixConnectorPath);
	
	const helixParms = qtools.getSurePath(newConfig, 'system');
	
	helixParms.schemaMap = addInternalEndpoints(schemaMap.schemaMap);
	
	helixParms.configDirPath = configDirPath;

	global.applicationLoggingIdString = helixParms.instanceId;
	

	helixParms.schemaMap.generateToken = {
		emptyRecordsAllowed: true
	}; //my node object doesn't provide for static methods, which this should be
	
	
	var simpleCallback = function(err, result, misc) {
		qtools.dump({
			err: err
		});
		qtools.dump({
			result: result
		});
	};

	var remoteControl = function(helixConnector, schema, query, callback) {
		var retrievalParms = {
			authToken: 'hello',
			schema: qtools.clone(schema),
			otherParms: query,
			debug: false,
			callback: callback
		};
		helixConnector.process('remoteControlManager', retrievalParms);
	};
	var retrieveRecords = function(helixConnector, schema, criterion, callback) {
		var retrievalParms = {
			authToken: 'hello',
			helixSchema: qtools.clone(schema),
			otherParms: {},
			debug: false,
			inData: {},
			callback: callback
		};

		if (schema.criterionSchemaName) {
			var criterionSchema = helixParms.schemaMap[schema.criterionSchemaName];
			retrievalParms.helixSchema.criterion = criterionSchema;
			retrievalParms.criterion = {};
			retrievalParms.criterion.data = criterion;
		}

		helixConnector.process('retrieveRecords', retrievalParms);
	};

	var sendRcData = function(helixConnector, schema, testRecordData, callback) {
		callback('post/sendRcData() is not implemented for helixAjax.js');
		// helixConnector.process('saveOneWithProcess', {
		// 	authToken: 'hello',
		// 	helixSchema: schema,
		// 	otherParms: {},
		// 	debug: false,
		// 	inData: testRecordData,
		// 	callback: callback
		// });
	};

	var saveRecords = function(helixConnector, schema, testRecordData, callback) {
		if (schema.responseSchemaName) {
			var responseSchema = helixParms.schemaMap[schema.responseSchemaName];
			schema.response = responseSchema;
		}
		helixConnector.process('saveOneWithProcess', {
			authToken: 'hello',
			helixSchema: schema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: callback
		});
	};

	//METHODS AND PROPERTIES ====================================

	//INITIALIZATION ====================================

	//SET UP SERVER =======================================================

	var router = express.Router();
	var bodyParser = require('body-parser');

	// 	app.use(function(req, res, next) {
	// 		console.log('first');next();
	// 	});
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

	app.use('/', router);

	
	const port = staticPageDispatchConfig.port
		? staticPageDispatchConfig.port
		: '9000';
	var config = {
		port: port
	};
	
	//LOG CONFIGURATION =======================================================

	qtools.logMilestone('Starting hxAjax *************************');
	
	qtools.logMilestone(
		`$HXCONNECTORUSER=${
			hxConnectorUser ? hxConnectorUser : '(not specified, running as $USER)'
		}`
	);
	qtools.logMilestone(`**configPath=${configPath}`);
	qtools.logMilestone(`**schemaMapPath=${schemaMapPath}`);
	qtools.logMilestone(`helixAjaxPagesPath=${process.env.helixAjaxPagesPath}`);
	qtools.logMilestone(
		`remoteControlDirectoryPath=${helixParms.remoteControlDirectoryPath}`
	);
	qtools.logMilestone(
		`staticDataDirectoryPath=${helixParms.staticDataDirectoryPath}`
	);

	//STATIC PAGE DISPATCH =======================================================

	router.use((req, res, next) => {
		if (!['/hxConnectorCheck'].includes(req.path)){
			qtools.logMilestone(`req.path: ${req.path}`);
		}
		next();
	});
	
	var staticPageDispatch = require('staticpagedispatch');
	staticPageDispatch = new staticPageDispatch({
		router: router,
		filePathList: [process.env.helixAjaxPagesPath]
	});

	const endpointList = generateEndpointList(helixParms);
	qtools.logMilestone(`Endpoints:\n\t${endpointList.join('\n\t')}`);
	

	//START SERVER AUTHENTICATION =======================================================

	//router.use(function(req, res, next) {});
	
	//START SERVER ROUTING FUNCTION =======================================================

	var fabricateConnector = function(req, res, schema) {
		var headerAuth = req.headers ? req.headers.authorization : '';
		var bodyAuth = req.body ? req.body.authorization : '';

		var tmp = headerAuth ? headerAuth.split(' ') : [];
		if (tmp.length < 1) {
			tmp = bodyAuth ? bodyAuth.split(' ') : [];
			delete req.body.authorization;
		}

		/*
			tmp[2] (instanceId) was added 1/2018 to make it easier to identify which 
			system a token works for. It is option and purely for helping users and is a decoration.
		*/

		var authGoodies = {
			authToken: tmp[1] ? tmp[1] : '',
			userId: tmp[0] ? tmp[0] : ''
		};

		try {
			var helixConnector = new helixConnectorGenerator({
				helixAccessParms: helixParms,
				authGoodies: authGoodies
			});
		} catch (err) {
			qtools.logError(qtools.dump(err, true));
			res.status(400).send(err.toString());
			return;
		}

		if (!schema || schema.private) {
			res.status('404').send('Bad Request: No such schema');
			return;
		}

		return helixConnector;
	};
	
	var send500 = (res, req, message) => {
		qtools.logError(`500 error: ${req.path}=>${message}`);
		res.status(500).send(message);
	};
	
	var sendResult = function(res, req, next, helixConnector) {
		return function(err, result) {
			if (err) {
				send500(res, req, err.toString());
				helixConnector.close();
				return;
			}

			res.status('200');
			res.set({
				'content-type': 'application/json;charset=ISO-8859-1',
				messageid: qtools.newGuid(),
				messagetype: 'RESPONSE',
				// 			 navigationcount: '100',
				// 			 navigationpage: '1',
				// 			 navigationpagesize: '10',
				responsesource: 'helixConnector',
				connection: 'Close'
			});
			res.json(result);
			helixConnector.close();
		};
	};
	
	router.get(/hxConnectorCheck/, function(req, res, next) {
		res.status('200');
		res.send(
			`<div class='connectorStatus'>hxConnector on host <span style='color:green;'>${os.hostname()}:${port}</span><br/>last restart: <span style='color:green;'>${lastRestartTime}</span> <br/>status: <span style='color:green;'>active</span><br/>helix server status: <span style='color:gray;'>[check disabled]</span></div>`
		);
	});

	router.get(/.*/, function(req, res, next) {
		const tmp = req.path.match(/\/([\w-.]+)/g);
		let schemaName;

		if (['/staticTest', '/dynamicTest'].includes(tmp[0])) {
			schemaName = tmp ? tmp[1].replace(/^\//, '') : '';
		} else {
			schemaName = tmp ? tmp[0].replace(/^\//, '') : '';
		}
		
		const staticTest = tmp[0] == '/staticTest';
		const dynamicTest = tmp[0] == '/dynamicTest';

		const schema = getSchema(helixParms, schemaName);
	
		if (!schema) {
			send500(res, req, `Schema '${schemaName}' not defined`);
			return;
		}	
		schema.schemaName = schemaName; //I don't trust myself not to forget to include this when I define an endpoint


		if (dynamicTest) {
			const testViewName = schema.testViewName;

			if (!testViewName) {
				send500(
					res,
					req,
					`Schema '${schemaName}' does not have a testViewName property`
				);
				return;
			}
			schema.view = schema.testViewName;
		}

		schema.staticTestRequestFlag = staticTest;

		if (schema.staticTest && typeof schema.staticTestData == 'undefined') {
			send500(res, req, `Schema ${schemaName}' does not have staticTestData`);
			return;
		}

		schema.schemaType = schema.schemaType ? schema.schemaType : 'helixAccess'; //just for completeness, I made it the default when I was young and stupid

		var helixConnector = fabricateConnector(req, res, schema);
		if (helixConnector) {
			switch (schema.schemaType) {
				case 'remoteControl':
					remoteControl(
						helixConnector,
						schema,
						req.query,
						sendResult(res, req, next, helixConnector)
					);
					break;

				case 'helixAccess':
				default:
					retrieveRecords(
						helixConnector,
						schema,
						req.query,
						sendResult(res, req, next, helixConnector)
					);
			}
		}
	});

	router.post(/generateToken/, function(req, res, next) {
		var tmp = req.path.match(/\/(\w+)/),
			schemaName = tmp ? tmp[1] : '',
			schema = helixParms.schemaMap[schemaName];
		var userId = req.body.userId;

		const privilegedHosts = qtools.convertNumericObjectToArray(
			qtools.getSurePath(newConfig, 'system.privilegedHosts', [])
		);
		if (!privilegedHosts.includes(req.hostname)) {
			res.status('401').send('request not made from authorized host');
			return;
		}

		if (!userId) {
			res.status('400').send('userId must be specified');
			return;
		}

		var helixConnector = fabricateConnector(req, res, schema);
		helixConnector.generateAuthToken(userId, function(err, result) {
			res.status('200').send({
				userId: userId,
				authToken: result,
				instanceId: helixParms.instanceId
			});
		});
	});

	router.post(/.*/, function(req, res, next) {

		const tmp = req.path.match(/\/([\w-.]+)/g);
		let schemaName;

		if (['/staticTest', '/dynamicTest'].includes(tmp[0])) {
			schemaName = tmp ? tmp[1].replace(/^\//, '') : '';
		} else {
			schemaName = tmp ? tmp[0].replace(/^\//, '') : '';
		}

		const staticTest = tmp[0] == '/staticTest';
		const dynamicTest = tmp[0] == '/dynamicTest';

		const schema = getSchema(helixParms, schemaName);
		if (!schema) {
			res.status(500).send(`Schema '${schemaName}' not defined`);
			return;
		}
		schema.schemaName = schemaName;

		schema.schemaType = schema.schemaType ? schema.schemaType : 'helixAccess'; //just for completeness
		let outData;
		if (qtools.toType(req.body) == 'array') {
			outData = req.body;
		} else if (qtools.toType(req.body) == 'object' && req.body != null) {
			outData = [req.body];
		} else {
			res
				.status(400)
				.send('Validation error: submitted data must be an array or object');
			helixConnector.close();
			return;
		}
		var helixConnector = fabricateConnector(req, res, schema);
		if (helixConnector) {
			switch (schema.schemaType) {
				case 'remoteControl':
					sendRcData(
						helixConnector,
						schema,
						req.query,
						sendResult(res, req, next, helixConnector)
					);
					break;

				case 'helixAccess':
				default:
					saveRecords(
						helixConnector,
						schema,
						outData,
						sendResult(res, req, next, helixConnector)
					);
			}
		}
	});

	//START SERVER =======================================================

	app.listen(config.port);
	
	qtools.log(
		'\n\n\n\n'+new Date().toLocaleTimeString() + ': Magic happens on port ' + config.port
	);
	reminder(`Restart Complete`);
	
	
	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

new moduleFunction();

