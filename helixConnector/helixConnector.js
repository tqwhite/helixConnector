'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util'),
	helixData = require('helixdata'),
	helixData = new helixData();

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	events.EventEmitter.call(this);
	this.forceEvent = forceEvent;
	this.args = args;
	this.metaData = {};
	this.addMeta = function(name, data) {
		this.metaData[name] = data;
	}

	var argsErrorList = qtools.validateProperties({
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
				name:'noValidationNeeded',
				optional:true
			}
		]
	}, true); //this is a server component, don't die on error

	if (argsErrorList) {
		throw (new Error(argsErrorList));
	}
	
	this.noValidationNeeded=this.noValidationNeeded?this.noValidationNeeded:false;
	this.authGoodies=this.authGoodies?this.authGoodies:{};

	this.systemProfile = this.systemProfile || {};
	this.immutableHelixAccessParms = qtools.clone(this.helixAccessParms);

	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};

	//LOCAL FUNCTIONS ====================================

	var initializeProperties = function() {
		self.leasePoolUserFieldName = 'leaseUserName';
		self.leasePoolPasswordFieldName = 'leasePasswordEncrypted'
		self.helixRelationList = [];
		self.openDatabaseFunctionNames = ['openTestDb'];
		self.systemParms = {};
		self.userPoolOk = '';
		self.leaseUserName = '';
		self.authorized = false;

		self.helixAccessParms = qtools.clone(self.immutableHelixAccessParms);
	}

	var resetConnector = function() {
		initializeProperties();
		cancelExitPoolUser();
	};

	var getRelationList = function(control, callback) {
		var relationFieldName = 'relationName';
		if (self.helixRelationList.length !== 0 || qtools.in(control, self.openDatabaseFunctionNames)) {
			callback('', '');
			return;
		}

		var helixSchema = {
			relation: '',
			view: '',
			fieldSequenceList: [
				relationFieldName
			],
			mapping: {
			}
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
					callback(new Error("Helix not available or is broken: No relations were retrieved"))
				} else {
					result.map(function(item) {
						self.helixRelationList.push(item[relationFieldName]);
					});
					callback(err, result);
				}
			}
		});
	}
	
	

	self.getViewDetails = function(control, parameters) {
		var callback=parameters.callback?parameters.callback:function(err, result){
			qtools.dump({"err":err});
			qtools.dump({"result":result});
		}
		
		var relationFieldName = 'relationName';
		if (self.helixRelationList.length !== 0 || qtools.in(control, self.openDatabaseFunctionNames)) {
			callback('', '');
			return;
		}

		var helixSchema = {
			relation: parameters.relation,
			view: parameters.view,
			fieldSequenceList: [],
			mapping: {
			}
		};
		
		var viewDetailsConversion=function(helixFieldSequenceList, helixMapping, data){
			var outObj={weirdString:data};
			throw new Error("getViewDetails() does not produce decent results. It is not yet implemented corrrectly.");
			return outObj;
		}

		executeHelixOperation('getViewDetails', {
			specialStringConversion:viewDetailsConversion,
			helixSchema: helixSchema,
			debug: true,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					callback(err, result);
					return;
				}
				if (result.length < 1) {
					callback(new Error("Helix not available or is broken: "+parameters.relation+"/"+parameters.view+" does not exist or is broken."))
				} else {
// 					result.map(function(item) {
// 						self.helixRelationList.push(item[relationFieldName]);
// 					});
					callback(err, result);
				}
			}
		});
	}

	var switchToPoolUser = function(user, password) {
		self.systemParms.user = user;
		self.systemParms.password = password;
	}

	var initUserPoolIfNeeded = function(control, callback) {
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

		var allPresent = (
			self.helixAccessParms.userPoolLeaseRelation &&
			self.helixAccessParms.userPoolLeaseView &&
			self.helixAccessParms.userPoolReleaseRelation &&
			self.helixAccessParms.userPoolReleaseView
			) ? true : false;
		var anyPresent = (
			self.helixAccessParms.userPoolLeaseRelation ||
			self.helixAccessParms.userPoolLeaseView ||
			self.helixAccessParms.userPoolReleaseRelation ||
			self.helixAccessParms.userPoolReleaseView
			) ? true : false;

		var missingTables = '';
		missingTables += !qtools.in(self.helixAccessParms.userPoolLeaseRelation, self.helixRelationList) ? self.helixAccessParms.userPoolLeaseRelation + " " : '';
		missingTables += !qtools.in(self.helixAccessParms.userPoolReleaseRelation, self.helixRelationList) ? self.helixAccessParms.userPoolReleaseRelation + " " : '';

		if (allPresent && missingTables) {
			callback(new Error("One or more of the User Pool Lease relations is missing: " + missingTables));
			return;
		}

		if (anyPresent && !allPresent) {
			callback(new Error("One of the User Pool Lease parameters is missing (userPoolLeaseRelation, userPoolLeaseView, userPoolReleaseRelation, userPoolReleaseView)"));
			return;
		}

		if (allPresent && self.userPoolOk && !self.leaseUserName) {
			getPoolUser(function(err, result) {
				
				if (!result[0]){
					callback(new Error("Did not receive a Pool User from Helix"));
				}
			
				self.leaseUserName = result[0][self.leasePoolUserFieldName];

				switchToPoolUser(result[0][self.leasePoolUserFieldName], decryptLeasePassword(result[0][self.leasePoolPasswordFieldName]))

				initExitPoolUser();
				callback();
			});
			return;

		}

		callback();
		return;

	};

	var getPoolUser = function(callback) {
		var localCallback = function(err, result) {
			callback(err, result);
		}
		var helixSchema = {
			relation: '',
			view: '',
			fieldSequenceList: [
				self.leasePoolUserFieldName,
				self.leasePoolPasswordFieldName
			],
			mapping: {}
		};
		executeHelixOperation('poolUserLease', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {},
			callback: localCallback
		});
	};

	var decryptLeasePassword = function(leasePasswordEncrypted) {
		var userPoolPasswordDecryptionKey = self.helixAccessParms.userPoolPasswordDecryptionKey;
		var userPoolPassword = /*decrypt*/ leasePasswordEncrypted;
		return leasePasswordEncrypted;
	}

	var releasePoolUser = function(callback) {
		callback = callback ? callback : function() {};
		var localCallback = function(err, result) {
			//note: tests kill Helix before they close so this is not triggered, it works if Helix stays up
			callback(err, result);
		}
		var helixSchema = {
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

	var exitEventHandler = function() {
		releasePoolUser();
	};

	var initExitPoolUser = function() {
		//process.stdin.resume();//so the program will not close instantly
		//do something when app is closing
		process.on('exit', exitEventHandler);

		//catches ctrl+c event
		//process.on('SIGINT', exitHandler.bind(null, {exit:true}));

		//catches uncaught exceptions
		//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

	}

	var cancelExitPoolUser = function() {
		process.removeListener('exit', exitEventHandler);

	}

	var demoJs = function() {
		var osa = require('osa');
		var test = function() {
			app = Application('Helix RADE');
			path = Path('/Users/tqwhite/Documents/webdev/lenny/panagon/toyHelix');
			app.open(path);
		}
		osa(test);
	}
	//demoJs();

	var compileScript = function(scriptElement, processName, parameters, helixSchema) {

		var inData = qtools.clone(parameters.inData) || {};
		var otherParms = parameters.otherParms || {};
		var systemParms = self.systemParms;

		var replaceObject = qtools.extend({}, self.helixAccessParms, helixSchema, otherParms, systemParms, {
				processName: processName,
				leaseUserName: self.leaseUserName
			}),
			script = scriptElement.script;

		replaceObject.dataString = helixData.makeApplescriptDataString(helixSchema.fieldSequenceList, helixSchema.mapping, otherParms, inData);

		if (helixSchema.criterion && parameters.criterion && parameters.criterion.data) {
			replaceObject.criterion.dataString = helixData.makeApplescriptDataString(helixSchema.criterion.fieldSequenceList, helixSchema.mapping, otherParms, parameters.criterion.data);
		}

		var finalScript = qtools.templateReplace({
			template: script.toString(),
			replaceObject: replaceObject
		});

		return finalScript;
	}

	var executeHelixOperation = function(processName, parameters) {

		var helixSchema = qtools.clone(parameters.helixSchema) || {},
			scriptElement = getScript(processName),
			finalScript = compileScript(scriptElement, processName, parameters, helixSchema),
			callback = parameters.callback || function() {};

		if (parameters.debug) {
			console.log("finalScript=" + finalScript);
		}

		osascript(finalScript, {
			type: (scriptElement.language.toLowerCase() == 'javascript') ? '' : scriptElement.language //turns out that osascript won't let you specify, JS is the default
		}, function(err, data) {
			if (!parameters.specialStringConversion){
			data = helixData.helixStringToRecordList(helixSchema.fieldSequenceList, helixSchema.mapping, data);
			}
			else{
			data = parameters.specialStringConversion(helixSchema.fieldSequenceList, helixSchema.mapping, data);
			}
			
			callback(err, data, {
				user: self.systemParms.user
			});
		});
	}

	//METHODS AND PROPERTIES ====================================

	var jwt = require('jsonwebtoken');

	self.generateAuthToken = function(userId, callback) {
		var token = jwt.sign({
			userId: userId,
			instanceId: self.immutableHelixAccessParms.instanceId
		}, self.immutableHelixAccessParms.authKey);
		callback ('', token);
	}

	self.validateUserId = function(userId, token, callback) {

		if (self.noValidationNeeded || self.authorized) {
			callback('', true);
			return;
		}

		try {
			var decoded = jwt.verify(token, self.immutableHelixAccessParms.authKey);
		} catch (e) {
			callback (e);
			return;
		}
		if (decoded.instanceId != self.immutableHelixAccessParms.instanceId) {
			callback(new Error('instanceId does not match'));
			return;
		}
		if (decoded.userId != userId) {
			callback(new Error('userId does not match'));
			return;
		}
		self.authorized = true;
		callback('', true);

	}


	self.cancelValidation = function() {
		self.authorized = false;
	}
	//DISPATCH ====================================

	var inDataIsOk = function(parameters) {
		var helixSchema = parameters.helixSchema,
			inData = parameters.inData,
			fieldSequenceList = helixSchema.fieldSequenceList;

		if (typeof (inData.length) == 'undefined') {
			inData = [inData];
		}

		for (var i = 0, len = inData.length; i < len; i++) {
			var element = inData[i];
			var foundData = false;

			if ((!fieldSequenceList || fieldSequenceList.length === 0) && qtools.count(element) !== 0) {
				return "This schema does not allow input data";
			}

			if ((fieldSequenceList && fieldSequenceList.length !== 0) && qtools.count(element) === 0 && !helixSchema.emptyRecordsAllowed) {
				return "Record data must be supplied for this schema";
			}

			for (var j in element) {
				if (element[j] && element[j] !== '') {
					foundData = true;
				}
				if (fieldSequenceList.indexOf(j) < 0) {
					return "There is no field named " + j + " in this schema";
				}
				//later, I can check data type here, too
			}

			if (!foundData && !helixSchema.emptyRecordsAllowed) {
				return "Empty records (ones with fields that are all missing or empty) are not allowed for this schema";
			}
		}

		return;

	}

	var getScriptPathParameters = function(functionName) {

		var libDir = __dirname + '/lib/';

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
		}

		var scriptElement = scriptNameMap[functionName];

		if (!scriptElement) {

			var path = libDir + functionName + '.applescript';

			if (qtools.realPath(path)) {
				var language = 'AppleScript';
			} else {
				var path = libDir + functionName + '.jax';
				var language = 'Javascript';
			}

			var scriptElement = {
				path: path,
				language: language
			}

		}

		return scriptElement;
	}

	var getScript = function(functionName) {
		var scriptElement = getScriptPathParameters(functionName);

		scriptElement.script = qtools.fs.readFileSync(scriptElement.path).toString();

		return scriptElement;

	}

	var prepareProcess = function(control, parameters) {

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

		var badDataMessage = inDataIsOk(parameters);
		if (badDataMessage) {
			parameters.callback(badDataMessage);
			return;
		}

		//this allows mapping of user friendly names to file names
		switch (control) {
			case 'kill':
			case 'quitHelixNoSave':
				executeHelixOperation('quitHelixNoSave', parameters);
				resetConnector();
				break;
			default:
				executeHelixOperation(control, parameters);
				break;

		}

	}

	this.process = function(control, parameters) {
		var runProcess = function() {
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
				})
			});
		};

		self.validateUserId(self.authGoodies.userId, self.authGoodies.authToken, function(err, result) {
			if (err) {
				parameters.callback(err);
			} else {
				runProcess();
			}
		});
	}

	this.close = function() {
		releasePoolUser(resetConnector);
	}

	//INITIALIZATION ====================================

	var osascript = require('osascript').eval;

	initializeProperties();

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;
