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


	//LOCAL FUNCTIONS ====================================



	//METHODS AND PROPERTIES ====================================



	//INITIALIZATION ====================================

var helixProjectPath=process.env.helixProjectPath;
var helixConfigPath=process.env.helixConfigPath;

if (!helixProjectPath){
	throw new Error("there must be an environment variable named 'helixProjectPath'");
}

if (!helixConfigPath){
	throw new Error("there must be an environment variable named 'helixConfigPath'");
}

// if (qtools.fs.existsSync(helixConfigPath)){
// 	throw new Error("the file referenced by 'helixConfigPath' already exists");
// }

var initPath=helixProjectPath+"/helixConnector/initializehxc";
var initLib=initPath+"/lib";

console.log("initLib="+initLib);


var configJs=qtools.fs.readFileSync(initLib+"/config.js");

qtools.writeSureFile(helixConfigPath, configJs);

var config=require(helixConfigPath);

config.validate();

	console.log(__dirname);


	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

new moduleFunction();




