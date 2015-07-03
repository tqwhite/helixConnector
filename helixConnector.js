'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util'),
	dateFormat=require('node-dateformat');

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



	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};


	//LOCAL FUNCTIONS ====================================
	
	var helixDateTime=function(inDate){
		//helix example: '6/29/15  8:38:39 AM'
		//var outString = dateFormat(inDate, "dddd, mmmm dS, yyyy, h:MM:ss TT");;
		var outString = dateFormat(inDate, "mm/dd/yy h:MM:ss TT");;
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

	var executeSave = function(queryParms, inData, callback) {
		var replaceObject = qtools.extend(inData, self.helixAccessParms);
		replaceObject = qtools.extend(inData, queryParms);

		replaceObject.dataString = makeDataString(queryParms.fieldSequenceList, queryParms.mapping, inData);

		var finalScript = qtools.templateReplace({
			template: script.toString(),
			replaceObject: replaceObject
		});
console.dir({"finalScript":finalScript});


		osascript(finalScript, {
			type: 'AppleScript'
		}, function(err, data) {
			callback(err, data);
		});

	}
	
	/*
		Test multiple scanner instances
		Move schema out of config, into dataInterface
		Add validate schema function to helixInterface
		figure out how they should install install node 
		write installation script
		add script containing port numbers to startup all instances
	
	*/

	var makeDataString = function(schema, mapping, inData) {
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

		executeSave(queryParms, inData, callback);

	}

	//INITIALIZATION ====================================

	var script = qtools.fs.readFileSync(process.env.SCANNER_BASE_PATH+'/system/node_modules/helixConnector/lib/saveOne.applescript');
	// console.log("script="+script);

	var osascript = require('osascript').eval;

	//soon: add check for helix, perhaps start helix

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;











