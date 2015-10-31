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

	qtools.validateProperties({
		subject: args || {},
		targetScope: this, //will add listed items to targetScope
		propList: [
			{
				name: 'helixAccessParms',
				optional: false
			}
		]
	});

	this.systemProfile = this.systemProfile || {};


	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};


	//LOCAL FUNCTIONS ====================================
	
// 	var isUserPoolSituation=function(){
// 	qtools.validateProperties({
// 		subject: args || {},
// 		targetScope: this, //will add listed items to targetScope
// 		propList: [
// 			{
// 				name: 'helixAccessParms',
// 				optional: false
// 			}
// 		]
// 	});
// 			userPoolLeaseRelation:'_userPoolGlobal',
// 			userPoolLeaseView:'leasePoolUser',
// 			userPoolReleaseRelation:'_inertProcess',
// 			userPoolReleaseView:'releasePoolUser'
// 	}

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

		var replaceObject = qtools.extend({}, self.helixAccessParms, helixSchema, otherParms),
			script = scriptElement.script;

		replaceObject.dataString = helixData.makeApplescriptDataString(helixSchema.fieldSequenceList, helixSchema.mapping, otherParms, inData);

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

		if (self.parameters.debug) {
			console.log("finalScript=" + finalScript);
		}

		osascript(finalScript, {
			type: (scriptElement.language.toLowerCase() == 'javascript') ? '' : scriptElement.language //turns out that osascript won't let you specify, JS is the default
		}, function(err, data) {
			data = helixData.helixStringToRecordList(helixSchema.fieldSequenceList, helixSchema.mapping, data);
			callback(err, data, {
				finalScript: finalScript
			});
		});
	}

	//METHODS AND PROPERTIES ====================================


	//DISPATCH ====================================
	
	var getScriptPathParameters=function(functionName){
	
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
		var scriptElement=getScriptPathParameters(functionName);

		scriptElement.script = qtools.fs.readFileSync(scriptElement.path).toString();

		return scriptElement;

	}

	this.process = function(control, parameters) {
		self.parameters = parameters;

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
					name: 'debug',
					optional: true
				}
			]
		});


		//this allows mapping of user friendly names to file names
		switch (control) {
			case 'xxx':
				executeHelixOperation('yyy', parameters);
				break;
			default:
				executeHelixOperation(control, parameters);
				break;

		}

	}






	//process.stdin.resume();//so the program will not close instantly
	//do something when app is closing
	process.on('exit', function() {
		console.log('on exit function: set this thing to check for a userPool lease and cancel it');
	}.bind(this));

	//catches ctrl+c event
	//process.on('SIGINT', exitHandler.bind(null, {exit:true}));

	//catches uncaught exceptions
	//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));




	//INITIALIZATION ====================================

	var osascript = require('osascript').eval;

	//soon: add check for helix, perhaps start helix

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

















