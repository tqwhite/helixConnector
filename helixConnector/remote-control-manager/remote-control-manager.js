'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');
const helixDataGen = require('../lib/helix-data');
const helixData = new helixDataGen();

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
	
	

	const executeActual = args => (libraryScriptName, parameters) => {




		const {schema:hxSchema}=parameters;
		
		const { processor, getScript, compileScript } = args;
		const helixSchema = Object.assign(
			{},
			hxSchema,
			parameters.otherParms
		);
		
		const scriptElement = getScript(libraryScriptName);

		const tmp = hxSchema ? hxSchema.scriptName : 'NO SCRIPT';
		qtools.logDetail(
			`remote control script: ${libraryScriptName}/${tmp} ${new Date().toLocaleString()}`
		);


		if (scriptElement.err) {
			!parameters.callback || parameters.callback(scriptElement.err);
			return;
		}


		if (!scriptElement.language) {
			!parameters.callback ||
				parameters.callback(`scriptElement has no language specification`);
			return;
		}


		var finalScript = compileScript({
			scriptElement,
			libraryScriptName,
			parameters: hxSchema,
			helixSchema
		});
		const callback = parameters.callback || function() {};

		if (helixSchema.debug === 'true' || helixSchema.debug === true) {
			console.log(
				'finalScript=\n\n' +
					finalScript +
					'\n\n=================(remoteControlManager.js)\n'
			);
		}

		const localCallback = (err, result) => {
			if (helixSchema.conversion) {
				const conversionFunction =
					helixData.remoteControlConversionList[
						helixSchema.conversion.functionName
					];
					
				if (!conversionFunction) {
					callback(
						`Conversion function '${
							helixSchema.conversion.functionName
						}' is missing`
					);
					return;
				}
				conversionFunction(helixSchema.conversion, result, callback);
			} else {
				callback(err, result);
			}
		};

		processor(
			finalScript,
			{
				type: scriptElement.language
			},
			localCallback
		);
	};
	
	//METHODS AND PROPERTIES ====================================
	
	//API ENDPOINTS ====================================
	
	
	//INITIALIZATION ====================================

	
	const processor = (script, parms, callback) => {
		const localCallback = (err, result) => {
			callback(err, result);
		};

		const bash = require('child_process').exec;
		const osaScript = require('osascript').eval;

		const workingParms = qtools.clone(parms);
		workingParms.type = workingParms.type.toLowerCase();

		switch (workingParms.type) {
			case 'applescript':
				osaScript(script, parms, localCallback);
				break;
			case 'bash':
				bash(script, localCallback);
				break;
			case 'jax':
				workingParms.type = 'javascript';
				osaScript(script, parms, localCallback);
				break;
			default:
				localCallback(
					`scriptElement language (${parms.type}) is not supported`
				);
				break;
		}
	};
	
	const { getScript, compileScript } = args; //getScript is helixConnector.getScriptPathParameters()

	this.execute = executeActual({ processor, getScript, compileScript });
	
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

