'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util'),
	moment = require('moment');

console.dir({"qtools.ping()":qtools.ping()});


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


	var helixDateTime = function(inDate) {
		//helix example: '6/29/15  8:38:39 AM'
		var outString = moment(inDate).format("MM/DD/YY hh:mm:ss A");
		return outString;

	}

	var formatFunctions = {
		refId: function() {
			return qtools.newGuid();
		},

		helixDateTimeNow: function() {
			return helixDateTime(new Date());
		},

		helixDateTime: function(inDate) {
			return helixDateTime(inDate);
		}
	}

	var helixDateTimeFormat = function() {

		//date time is like this: 6/29/15  8:38:39 AM

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

	var compileScript = function() {}

	var executeHelixOperation = function(processName, queryParms, inData, callback) {
		
		queryParms=queryParms || {};
		inData=inData || {};
		callback=callback || function(){};
		
		var replaceObject = qtools.extend(inData, self.helixAccessParms),
			scriptElement = getScript(processName),
			script=scriptElement.script;

		replaceObject = qtools.extend(inData, queryParms);

		replaceObject.dataString = makeDataString(queryParms.fieldSequenceList, queryParms.mapping, inData);

		var finalScript = qtools.templateReplace({
			template: script.toString(),
			replaceObject: replaceObject
		});


console.log("finalScript="+finalScript);


		osascript(finalScript, {
			type: (scriptElement.language.toLowerCase()=='javascript')?'':scriptElement.language //turns out that osascript won't let you specify, JS is the default
		}, function(err, data) {
			callback(err, data);
		});

	}

	var makeDataString = function(schema, mapping, inData) {

		schema=schema || [];
		
		var outString = '',
			finalFunction;

		for (var i = 0, len = schema.length; i < len; i++) {
			var element = schema[i],
				mappingEntry = mapping[element],
				finalFunction;

			if (typeof (mappingEntry) == 'function') {
				finalFunction = mappingEntry;
			} else if (typeof (mappingEntry) == 'string') {
				if (typeof (formatFunctions[mappingEntry]) == 'function') {
					finalFunction = formatFunctions[mappingEntry];
				} else {
					finalFunction = function() {
						return mappingEntry;
					}
				}
			} else {
				finalFunction = function(a) {
					return a
				};
			}

			var result = finalFunction(inData[element]);
			outString += result + '\t';
		}
		outString = outString.replace(/\t$/, '');
		return outString;
	};

	//METHODS AND PROPERTIES ====================================

	this.save = function(queryParms, inData, callback) {

		executeHelixOperation('save', queryParms, inData, callback);

	}


	//DISPATCH ====================================


	var getScript = function(functionName) {
		var scriptList = {
			save: {
				path: './lib/saveOne.applescript',
				language: 'AppleScript'
			},
			kill: {
				path: './lib/quitHelixNoSave.applescript',
				language: 'AppleScript'
			},
			startDb: {
				path: './lib/openTestDb.jax',
				language: 'Javascript'
			}
		}
		
		var scriptElement = scriptList[functionName];
		
		if (!scriptElement){
			
				var path='./lib/'+functionName+'.applescript';
				var scriptElement = {
				path: './lib/'+functionName+'.applescript',
				language: 'AppleScript'
			}
			
		}
	
		scriptElement.script = qtools.fs.readFileSync(scriptElement.path).toString();

		return scriptElement;

	}

	this.process = function(control, parameters) {

		//executeHelixOperation = function(processName, queryParms, inData, callback)
		switch (control) {
			case 'save':
				executeHelixOperation('save', parameters.queryParms, parameters.inData, parameters.callback);
				break;
			case 'startDb':
				executeHelixOperation('startDb', parameters.queryParms, parameters.inData, parameters.callback);
				break;
			default:
				executeHelixOperation(control, parameters.queryParms, parameters.inData, parameters.callback);
			break;

		}

	}

	var startDatabase = function(queryParms, inData, callback) {}

	//TEST ACCESS ====================================

	if (global.systemProfile.exposeTests) {
		this.formatFunctions = formatFunctions;
		this.makeDataString = makeDataString;
	}

	//INITIALIZATION ====================================

	var osascript = require('osascript').eval;

	//soon: add check for helix, perhaps start helix

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;













