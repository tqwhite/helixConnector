'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util');

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



	//DATABASE SPECIFIC SPECIFICATIONS ====================================


	//GENERIC DATABASE SPECIFICATIONS ====================================
	var specificationFileName = 'specifications.json';
	var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+\.js)/, '$1')
	var moduleFilePath = module.filename.replace(new RegExp(moduleFileName), '');
	var specificationFilePath = moduleFilePath + specificationFileName;



	var instanceName = (process.env.HXCONNECTORUSER || process.env.USER) + '/' + moduleFileName.replace(/\..+$/, '');

	var specsJson = qtools.fs.readFileSync(specificationFilePath);
	try {
		var specs = JSON.parse(specsJson);
	} catch (e) {
		console.log("failed to parse " + specificationFilePath);
		throw ("specifications file failed to parse");
	}
	var operationalParameters = specs.operationalParameters;
	operationalParameters.instanceId = instanceName;


	var schemaMap = specs.schemaMap;

	var adminPagesAccessData = specs.adminPagesAccessData;

	this.getAdminPagesAccessData = function() {
		return adminPagesAccessData;
	}

	this.getHelixParms = function() {

		var oParms = qtools.clone(operationalParameters);
		oParms.schemaMap = qtools.clone(schemaMap);

		return oParms;
	}

	this.getSystemProfile = function() {
		return {
			exposeTests: true
		}
	}

	//INITIALIZATION ====================================

	this.validate = function() {

		//console.log(JSON.stringify(schemaMap));


	}
this.AAA='config.js';

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = new moduleFunction();











