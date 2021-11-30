'use strict';
var events = require('events'),
	util = require('util'),
	addBaseFunctions = require('./lib/qtoolsBase'),
	addLogFunctions = require('./lib/qtools-log'),
	nodeManipulation = require('./lib/nodeManipulation'),
	lodash = require('lodash'),
	addConfigFileProcessor = require('./lib/qtools-config-file-processor-dependent-version');

const dayjs = require('dayjs');

//START OF moduleFunction() ============================================================

var moduleFunction = function(employer, args={}) {
	events.EventEmitter.call(this);
	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};

	//INITIALIZE OBJECT ====================================

	addBaseFunctions(this);

	if (typeof employer == 'object') {
		this.employerFilePath = employer.filename ? employer.filename : '';

		var split = this.employerFilePath.split('/');

		if (split.length) {
			this.employerFilename = split[split.length - 1];
		} else {
			this.employerFilename = '';
		}
	}
	
	this._ = lodash;
	this.dayjs = dayjs; //https://www.npmjs.com/package/dayjs

	this.ping = function() {
		//remember, 'this' refers to employer object because of assignment in object. could be handy.
		return {
			employer: self.employerFilename,
			qtoolsFile: module.filename
		};
	};

	this.listNames = function() {
		for (var i in this) {
			console.log(i);
		}
		for (var i = 0, len = environmentChanges.docList.length; i < len; i++) {
			var element = environmentChanges.docList[i];
			console.log(element);
		}
	};

	self.extend(this, nodeManipulation);
	addLogFunctions(this);
	addConfigFileProcessor(this);
	
	if (args.updatePrototypes){
		require('./lib/qtFunctionalLib'); //an early effort, still here because qtools is deprecated and I do not want to debug it
		this.qt=require('qtools-functional-library'); //this is now a real supported module
	}
	
	const commandLineParser=require('qtools-parse-command-line'); //this is now a real supported module


	Object.assign(this, commandLineParser)






	//BUILD RETURN OBJECT ====================================

	this.forceEvent = forceEvent;
	
	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

