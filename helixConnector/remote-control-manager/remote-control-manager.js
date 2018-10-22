'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	qtools.validateProperties({
		subject: args || {},
		targetScope: this, //will add listed items to targetScope
		propList: [
			{
				name: 'getScript',
				optional: false
			},
			{
				name: 'compileScript',
				optional: false
			},
			{
				name: 'initCallback',
				optional: true
			}
		]
	});

	//LOCAL VARIABLES ====================================
	

	//LOCAL FUNCTIONS ====================================
	
	

	const executeActual = args => (processName, parameters) => {
		const { processor, getScript } = args;
		var helixSchema = qtools.clone(parameters.helixSchema) || {},
			scriptElement = getScript(parameters.schema.scriptName);

		const tmp = parameters.schema ? parameters.schema.scriptName : 'NO SCRIPT';
		qtools.logMilestone(
			`remote control script: ${processName}/${tmp} ${new Date().toLocaleString()}`
		);
		qtools.logMilestone(`========================================`);

		if (scriptElement.err) {
			!parameters.callback || parameters.callback(scriptElement.err);
			return;
		}

		if (!scriptElement.language) {
			!parameters.callback ||
				parameters.callback(`scriptElement has no language specification`);
			return;
		}

		var finalScript = compileScript(
				scriptElement,
				processName,
				parameters,
				helixSchema
			),
			callback = parameters.callback || function() {};

		if (parameters.debug) {
			console.log('finalScript=' + finalScript);
		}

		processor(
			finalScript,
			{
				type: scriptElement.language
			},
			callback
		);
	};
	
	//METHODS AND PROPERTIES ====================================
	
	//API ENDPOINTS ====================================
	
	
	//INITIALIZATION ====================================

	const { getScript, compileScript } = args;
	
	const processor = (script, parms, callback) => {
	const localCallback=(err, result)=>{
		callback(err, result);
	}
	
		const exec = require('child_process').exec;
		const osaScript = require('osascript').eval;

		const workingParms = qtools.clone(parms);
		workingParms.type = workingParms.type.toLowerCase();

		switch (workingParms.type) {
			case 'applescript':
				osaScript(script, parms, localCallback);
				break;
			case 'bash':
				exec(script, localCallback);
				break;
			case 'jax':
				workingParms.type = 'javascript';
				osaScript(script, parms, localCallback);
				break;
			default:
				localCallback(`scriptElement language (${parms.type}) is not supported`);
				break;
		}
	};
	
	this.execute = executeActual({ processor, getScript });
	
	
	!this.initCallback || this.initCallback();

	//ECOSYSTEM REQUIREMENTS ====================================
	
	const ping = (message = 'NO MESSAGE SUPPLIED') => {
		return `${qtools.ping().employer} got the ${message}`;
	};
	
	this.ping = ping;

	this.shutdown = (message, callback) => {
		console.log(`\nshutting down ${qtools.ping().employer}`);
		callback('', message);
	};

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

