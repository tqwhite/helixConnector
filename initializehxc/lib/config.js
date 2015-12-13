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


var generalFieldSequence = [
	'textField01',
	'textField02',
	'textField03',
	'dateField01',
	'numField01',
	'fixedPointField01',
	'flagField01',
	'recNum'
];

var generalMapping={
			flagField01:'helixBoolean',
			dateField01:'helixDateTime'
};
var schemaMap = {
	upTest1_Enter_SevenFields: {
		'emptyRecordsAllowed':false,
		'private':false,
		relation: '_inertProcess',
		view: 'upTest1_Enter_SevenFields',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping
	},
	upTest1_RetrieveAll: {
		'emptyRecordsAllowed':true, //necessary if you want to retrieve from this view
		'private':false,
		relation: 'upTest1',
		view: 'upTest1_RetrieveAll',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping
	},
	upTest1_RetrieveOnTextfield01: {
		'emptyRecordsAllowed':true, //necessary if you want to retrieve from this view
		'private':false,
		relation: 'upTest1',
		view: 'upTest1_RetrieveOnTextfield01',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping,
		criterionSchemaName: 'upTest1_setCriterion_MatchTextField01'
	},
	upTest1_setCriterion_MatchTextField01: {
		'private':true,
		relation: '_inertProcess',
		view: 'upTest1_setCriterion_MatchTextField01',
		fieldSequenceList: [
			'textField01'
		],
		mapping: generalMapping,
		retrievalSchemaName: 'upTest1_RetrieveOnTextfield01'
	},
	upTest1_RetrieveOnRecNum: {
		'emptyRecordsAllowed':true,
		relation: 'upTest1',
		view: 'upTest1_RetrieveOnRecNum',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping,
		criterionSchemaName: 'upTest1_setCriterion_MatchRecNum'
	},
	upTest1_setCriterion_MatchRecNum: {
		'private':true,
		relation: '_inertProcess',
		view: 'upTest1_setCriterion_MatchRecNum',
		fieldSequenceList: [
			'recNum'
		],
		mapping: generalMapping,
		retrievalSchemaName: 'upTest1_RetrieveOnRecNum'
	}
};


//GENERIC DATABASE SPECIFICATIONS ====================================
var specificationFileName='specifications.json';
var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+\.js)/, '$1')
var moduleFilePath=module.filename.replace(new RegExp(moduleFileName), '');
var specificationFilePath=moduleFilePath+specificationFileName;



var instanceName=process.env.USER+'/'+moduleFileName.replace(/\..+$/, '');

var specsJson=qtools.fs.readFileSync(specificationFilePath);
try{
var specs=JSON.parse(specsJson);
}
catch(e){
console.log(`failed to parse ${specificationFilePath}`);
throw("specifications file failed to parse");
}
var operationalParameters=specs.operationalParameters;
operationalParameters.instanceId=instanceName;



	var adminPagesAccessData = specs.adminPagesAccessData;
	
	this.getAdminPagesAccessData=function(){
		return adminPagesAccessData;
	}

	this.getHelixParms = function() {
	
		var oParms=qtools.clone(operationalParameters);
		oParms.schemaMap=qtools.clone(schemaMap);
		
		return oParms;
	}
	
	this.getSystemProfile=function(){
		return {
			exposeTests:true
		}
	}

	//INITIALIZATION ====================================

this.validate=function(){

qtools.dump({"specs2":specs});


}


	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = new moduleFunction();








