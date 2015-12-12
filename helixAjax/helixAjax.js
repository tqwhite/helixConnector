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

	var projectDir = qtools.realPath(process.env.helixProjectPath) + '/',
		helixConnectorPath = process.env.helixConnectorPath,
		helixConfigPath = process.env.helixConfigPath,
		helixAjaxPath = process.env.helixAjaxPath,
		helixConnectorGenerator = require(helixConnectorPath + 'helixConnector.js'),
		config = require(helixConfigPath),
		systemProfile = config.getSystemProfile();

	var helixParms = config.getHelixParms();
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
				authGoodies: authGoodies
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



