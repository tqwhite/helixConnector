'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util');

var express = require('express');
var app = express();

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	events.EventEmitter.call(this);
	this.forceEvent = forceEvent;
	this.args = args;
	this.metaData = {};
	this.addMeta = function(name, data) {
		this.metaData[name] = data;
	}

	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};

	//LOCAL FUNCTIONS ====================================
	
	if (!process.env.helixProjectPath) {
		var message = 'there must be an environment variable: helixProjectPath';
		qtools.logError(message);
		return message;
	}
	if (!process.env.USER) {
		var message = 'there must be an environment variable: USER';
		qtools.logError(message);
		return message;
	}
	var configPath =
		process.env.helixProjectPath +
		'configs/instanceSpecific/ini/' +
		process.env.USER +
		'.ini';
	if (!qtools.realPath(configPath)) {
		var message = 'configuration file ' + configPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	var helixConnectorPath =
		process.env.helixConnectorPath  + 'helixConnector.js';
	if (!qtools.realPath(helixConnectorPath)) {
		var message = 'helixConnectorPath file ' + helixConnectorPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	
	
	const newConfig = qtools.configFileProcessor.getConfig(configPath);
	const collectionName=qtools.getSurePath(newConfig, 'system.collection');
	const schemaMapName=qtools.getSurePath(newConfig, 'system.schemaMapName') || collectionName;

	const schemaMapPath =
		process.env.helixProjectPath +
		'configs/schemaMaps/'+
		schemaMapName+'.json';
	if (!qtools.realPath(schemaMapPath)) {
		const message = 'system.collection.schemaMapPath: ' + schemaMapPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	
	let schemaMap;
	const schemaMapJson = qtools.fs.readFileSync(schemaMapPath);
	try {
		schemaMap = JSON.parse(schemaMapJson);
	} catch (e) {
		console.log("failed to parse " + schemaMap);
		throw ("schemaMap file failed to parse");
	}


	const helixConnectorGenerator = require(helixConnectorPath);
	const helixParms = qtools.getSurePath(newConfig, 'system');
	helixParms.schemaMap=schemaMap.schemaMap;
	
		global.applicationLoggingIdString =
			helixParms.instanceId;
	const logParms = qtools.clone(helixParms);
	logParms.password='****';
	qtools.logMilestone("Starting hxAjax *************************");
	qtools.dump(logParms);
	qtools.logMilestone("**************************************************");


	helixParms.schemaMap.generateToken = {
		emptyRecordsAllowed: true
	}; //my node object doesn't provide for static methods, which this should be

	var simpleCallback = function(err, result, misc) {

		qtools.dump({
			"err": err
		});
		qtools.dump({
			"result": result
		});

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

	var saveRecords = function(helixConnector, schema, testRecordData, callback) {

		helixConnector.process('saveDirect', {
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

	app.use(bodyParser.json({
		extended: true
	}))
	app.use(function(err, req, res, next) {
		//bodyParser.json produces a syntax error when it gets badly formed json
		//this catches the error
		if (err) {
			res.status(400).send(err.toString());
			return;
		}
		next();

	});
	app.use(bodyParser.urlencoded({
		extended: true
	}))

	app.use('/', router);

	var config = {
		port: '9000'
	};

	//START SERVER AUTHENTICATION =======================================================

	//router.use(function(req, res, next) {});

	//STATIC PAGE DISPATCH =======================================================

	var staticPageDispatch = require('staticpagedispatch');
	staticPageDispatch = new staticPageDispatch({
		router: router,
		filePathList: [qtools.realPath('.') + '/samplePages']
	});

	//START SERVER ROUTING FUNCTION =======================================================

	var fabricateConnector = function(req, res, schema) {
		var headerAuth = req.headers ? req.headers.authorization : '';
		var bodyAuth = req.body ? req.body.authorization : '';

		var tmp = headerAuth ? headerAuth.split(' ') : [];
		if (tmp.length < 1) {
			tmp = bodyAuth ? bodyAuth.split(' ') : [];
			delete req.body.authorization;
		}


		var authGoodies = {
			authToken: tmp[1] ? tmp[1] : '',
			userId: tmp[0] ? tmp[0] : ''
		};

		try {
			var helixConnector = new helixConnectorGenerator({
				helixAccessParms: helixParms,
				authGoodies: authGoodies,
				noValidationNeeded:helixParms.noValidationNeeded
			});
		} catch (err) {
			res.status(400).send(err.toString());
			return;
		}

		if (!schema || schema.private) {
			res.status('404').send('Bad Request: No such schema');
			return;
		}

		return helixConnector;
	};
	var sendResult = function(res, req, next, helixConnector) {
		return function(err, result) {

			if (err) {
				res.status(400).send(err.toString());
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
		}
	};

	router.get(/hxConnectorCheck/, function(req, res, next) {

			res.status('200');
			res.send("<div style='font-size:24pt;padding:150px;'>hxConnector status: <span style='color:green;'>active</span><br/>helix server status: <span style='color:gray;'>[check disabled]</span></div>");

	});

	router.get(/.*/, function(req, res, next) {
		var tmp = req.path.match(/\/(\w+)/),
			schemaName = tmp ? tmp[1] : '',
			schema = helixParms.schemaMap[schemaName];

		var helixConnector = fabricateConnector(req, res, schema);
		if (helixConnector) {
			retrieveRecords(helixConnector, schema, req.query, sendResult(res, req, next, helixConnector));
		}

	});

	router.post(/generateToken/, function(req, res, next) {
		var tmp = req.path.match(/\/(\w+)/),
			schemaName = tmp ? tmp[1] : '',
			schema = helixParms.schemaMap[schemaName];
		var userId = req.body.userId;

		if (!userId) {
			res.status('400').send("userId must be specified");
			return;
		}

		var helixConnector = fabricateConnector(req, res, schema);
		helixConnector.generateAuthToken(userId, function(err, result) {
			res.set('200').send({
				userId: userId,
				authToken: result
			});

		});
	});


	router.post(/.*/, function(req, res, next) {
		var tmp = req.path.match(/\/(\w+)/),
			schemaName = tmp ? tmp[1] : '',
			schema = helixParms.schemaMap[schemaName],
			outData;

		if (qtools.toType(req.body) == 'array') {
			outData = req.body;
		} else if (qtools.toType(req.body) == 'object' && req.body != null) {
			outData = [req.body];
		} else {
			res.status(400).send('Validation error: submitted data must be an array or object');
			helixConnector.close();
			return;
		}

		var helixConnector = fabricateConnector(req, res, schema);
		if (helixConnector) {
			saveRecords(helixConnector, schema, outData, sendResult(res, req, next, helixConnector));
		}

	});

	//START SERVER =======================================================

	app.listen(config.port);

	qtools.message('Magic happens on port ' + config.port);

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

new moduleFunction();



