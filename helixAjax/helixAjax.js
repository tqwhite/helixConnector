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

	// 	qtools.validateProperties({
	// 		subject: args || {},
	// 		targetScope: this, //will add listed items to targetScope
	// 		propList: [
	// 			{
	// 				name: 'placeholder',
	// 				optional: true
	// 			}
	// 		]
	// 	});

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
		helixConnectorGenerator = require(helixConnectorPath + 'helixConnector.js'),
		config = require(projectDir + '/config/qbook.js'),
		systemProfile = config.getSystemProfile();

	var helixParms = config.getHelixParms();



	var simpleCallback = function(err, result, misc) {

		qtools.dump({
			"err": err
		});
		qtools.dump({
			"result": result
		});

	};

	var startTestDatabase = function(helixConnector) {

		helixConnector.process('openTestDb', {
			helixSchema: {},
			otherParms: {
				testDataDir: projectDir + "/testData/",
				testCollectionFileName: "helixConnectTest06"
			},
			inData: {},
			callback: function(err, result, misc) {

				qtools.dump({
					"err startTestDatabase": err
				});
				qtools.dump({
					"result startTestDatabase": result
				});
				killHelix(helixConnector);
			},
			debug: false
		});

	};

	var killHelix = function(helixConnector) {
		helixConnector.process('kill', {
			helixSchema: {},
			otherParms: {},
			inData: {},
			debug: false,
			callback: function(err, result, misc) {

				qtools.dump({
					"err killHelix": err
				});
				qtools.dump({
					"result killHelix": result
				});

			}
		});
	};


	var retrieveRecords = function(helixConnector, schema, criterion, callback) {

		var retrievalParms = {
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
			helixSchema: schema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: callback
		});

	};

	var sendTestInputPage = function(req, res, next) {
		var testPage = require('./testInput.js');
		testPage = new testPage();
		res.send(testPage.html);
	};

	//METHODS AND PROPERTIES ====================================

	//INITIALIZATION ====================================

	//SET UP SERVER =======================================================

	var router = express.Router();
	var bodyParser = require('body-parser');

	app.use(function(req, res, next) {
		console.log('before');next();
	})
	app.use(bodyParser.urlencoded({
		extended: true
	}))

	app.use('/', router);
	// parse application/json 
	//app.use(bodyParser.json({type:'application/x-www-form-urlencoded'}))
	//app.use(bodyParser.raw())



	var config = {
		port: '9000'
	};

	//START SERVER AUTHENTICATION =======================================================

	//router.use(function(req, res, next) {});

	//START SERVER ROUTING FUNCTION =======================================================

	router.get(/.*/, function(req, res, next) {
		var tmp = req.path.match(/\/(\w+)/),
			schemaName = tmp ? tmp[1] : '',
			schema = helixParms.schemaMap[schemaName];
		var helixConnector = new helixConnectorGenerator({
			helixAccessParms: helixParms
		});

		if (schemaName == 'input') {
			sendTestInputPage(req, res, next);
			return;

		}

		if (!schema || schema.private) {
			res.status('404');
			res.send();
			return;
		}

		retrieveRecords(helixConnector, schema, req.query, function(err, result) {

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
		});

	});

	router.post(/.*/, function(req, res, next) {
		var tmp = req.path.match(/\/(\w+)/),
			schemaName = tmp ? tmp[1] : '',
			schema = helixParms.schemaMap[schemaName],
			outData;
		if (!schema || schema.private) {
			res.status('404');
			res.send();
			return;
		}
		var helixConnector = new helixConnectorGenerator({
			helixAccessParms: helixParms
		});

		if (qtools.toType(req.body) == 'array') {
			outData = req.body;
		} else if (qtools.toType(req.body) == 'object' && req.body != null) {
			outData = [req.body];
		} else {
			res.status(400).send('Validation error: submitted data must be an array or object');
			helixConnector.close();
			return;
		}

		saveRecords(helixConnector, schema, outData, function(err, result) {
			if (err) {
				res.status(400).send(err.toString());
				helixConnector.close();
				return;
			}
			result = result ? result : {};
			result.dataReceived = req.body;
			result.message = "wrote data to helix";
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
		});

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


