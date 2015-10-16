'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util'),
	moment = require('moment');

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

	var executeHelixOperation = function(processName, parameters) {

		var helixSchema = qtools.clone(parameters.helixSchema) || {};
		var inData = qtools.clone(parameters.inData) || {};
		var otherParms = parameters.otherParms || {};
		var callback = parameters.callback || function() {};

		var replaceObject = qtools.extend({}, self.helixAccessParms, helixSchema, otherParms),
			scriptElement = getScript(processName),
			script = scriptElement.script;

		replaceObject.dataString = makeDataString(helixSchema.fieldSequenceList, helixSchema.mapping, otherParms, inData);

		var finalScript = qtools.templateReplace({
			template: script.toString(),
			replaceObject: replaceObject
		});

		if (self.parameters.debug) {
			console.log("finalScript=" + finalScript);
		}

		osascript(finalScript, {
			type: (scriptElement.language.toLowerCase() == 'javascript') ? '' : scriptElement.language //turns out that osascript won't let you specify, JS is the default
		}, function(err, data) {

			data = helixStringToRecordList(helixSchema.fieldSequenceList, helixSchema.mapping, data);
			callback(err, data, {
				finalScript: finalScript
			});
		});
	}

	var makeDataString = function(schema, mapping, otherParms, inData) {
		var recordSeparator=', ';
		switch (qtools.toType(inData)) {

			case 'array':
				var outString = '';
				for (var i = 0, len = inData.length; i < len; i++) {
					var element = inData[i];
					var replaceObject = qtools.extend(element, otherParms);
					outString += '"' + stringifyObject(schema, mapping, replaceObject)+ '"' + recordSeparator;
				}
				return outString.replace(new RegExp(recordSeparator+'$'), '');
				break;

			case 'object':
				var replaceObject = qtools.extend(inData, otherParms);
				outString=stringifyObject(schema, mapping, replaceObject);

				return outString;
				
				break;
			default:
				throw 'inData is not a valid type for conversion to a helix record, ie, object or array';
				break;
		}
	};

	var stringifyObject = function(schema, mapping, inData) {

		schema = schema || [];

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
			outString += result + String.fromCharCode(9);
		}
		outString = outString.replace(new RegExp(String.fromCharCode(9) + '$'), '');
		return outString;
	};

	var helixStringToRecordList = function(schema, mapping, resultData) {
		if (!resultData) {
			return resultData;
		}

		resultData = resultData.replace(/\n$/, '');
		var inSchema = [].concat(['helixId'], schema),
			resultDataArray = resultData.split(/record id:/);

		if (!resultDataArray[0]) {
			resultDataArray = resultDataArray.slice(1);
		}

		var outArray = [];
		for (var i = 0, len = resultDataArray.length; i < len; i++) {
			var elementList = resultDataArray[i].replace(/helix record:/, '').replace(/, $/, '').split(/, /),
				newElementObject = {};
			for (var j = 0, len2 = inSchema.length; j < len2; j++) {
				newElementObject[inSchema[j]] = elementList[j]
			}
			outArray.push(newElementObject);
		}



		return outArray;
	}

	//METHODS AND PROPERTIES ====================================

	// 	this.save = function(queryParms, inData, callback) {
	// 
	// 		executeHelixOperation('save', queryParms, inData, callback);
	// 
	// 	}


	//DISPATCH ====================================

	var getScript = function(functionName) {
		var libDir = __dirname + '/lib/';

		var scriptList = {
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

		var scriptElement = scriptList[functionName];

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


		scriptElement.script = qtools.fs.readFileSync(scriptElement.path).toString();

		return scriptElement;

	}

	this.process = function(control, parameters) {
		self.parameters = parameters;

		//executeHelixOperation = function(processName, queryParms, inData, callback)
		switch (control) {
			case 'save':
				executeHelixOperation('save', parameters);
				break;
			case 'startDb':
				executeHelixOperation('startDb', parameters);
				break;
			default:
				executeHelixOperation(control, parameters);
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
















