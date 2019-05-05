'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');
const helixDataGen = require('helixdata');
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

	const validateSchema = parameters => {
		const inDataIsOk = function(parameters) {
			const helixSchema = parameters.schema;
			let inData = parameters.inData;
			const fieldSequenceList = helixSchema.fieldSequenceList;

			if (typeof inData.length == 'undefined') {
				inData = [inData];
			}

			for (let i = 0, len = inData.length; i < len; i++) {
				const element = inData[i];
				var foundData = false;

				if (
					(!fieldSequenceList || fieldSequenceList.length === 0) &&
					qtools.count(element) !== 0
				) {
					qtools.logError(
						`The schema '${helixSchema.schemaName}'` +
							`does not allow input data (no fieldSequenceList and inData exists)`
					); //string concatenation is only so Prettier does a nicer job of line breaks
					return (
						`The schema '${helixSchema.schemaName}'` +
						`does not allow input data (no fieldSequenceList and inData exists)`
					); //string concatenation is only so Prettier does a nicer job of line breaks
				}

				if (
					fieldSequenceList &&
					fieldSequenceList.length !== 0 &&
					qtools.count(element) === 0 &&
					!helixSchema.emptyRecordsAllowed
				) {
					return 'Record data must be supplied for this schema (emptyRecordsAllowed)';
				}

				for (let j in element) {
					if (element[j] && element[j] !== '') {
						foundData = true;
					}
					if (fieldSequenceList.indexOf(j) < 0) {
						return 'There is no field named ' + j + ' in this schema';
					}
					//later, I can check data type here, too
				}

				if (!foundData && !helixSchema.emptyRecordsAllowed) {
					return 'Empty records (ones with fields that are all missing or empty) are not allowed for this schema';
				}
			}

			return;
		};
		const badDataMessage = inDataIsOk(parameters);
		if (badDataMessage) {
			return badDataMessage;
		}
	};
	

	const executeActual = args => (processName, parameters) => {
		
		const { processor, getScript, compileScript, helixData } = args;

		const helixSchema = qtools.clone(parameters.schema) || {};
		const scriptElement = getScript(processName);
		const osascript = require('osascript').eval;

		const tmp = parameters.schema ? parameters.schema.view : 'NO HELIX SCHEMA';
		qtools.logDetail(
			`helix access script: ${processName}/${tmp} ${new Date().toLocaleString()}`
		);

		if (scriptElement.err) {
			!parameters.callback || parameters.callback(scriptElement.err);
			return;
		}

		const finalScript = compileScript({
				scriptElement,
				processName,
				parameters,
				helixSchema
			}),
			callback = parameters.callback || function() {};

		if (helixSchema.debug == 'true') {
			console.log('finalScriptZZ=' + finalScript);
		}

		processor(
			finalScript,
			{
				type:
					scriptElement.language.toLowerCase() == 'javascript'
						? ''
						: scriptElement.language //turns out that osascript won't let you specify, JS is the default
			},
			function(err, data='') {
				data = data.replace(/([^\n])\n$/, '$1');
				err = err ? new Error(err) : err;
				if (!parameters.specialStringConversion) {
					data = helixData.helixStringToRecordList(helixSchema, data);
				} else {
					data = parameters.specialStringConversion(helixSchema, data);
				}

				callback(err, data);
			}
		);
	};
	
	//METHODS AND PROPERTIES ====================================
	
	//API ENDPOINTS ====================================
	
	const executeHelixOperation = function(processName, parameters) {};
	
	//INITIALIZATION ====================================

	const processor = (script, parms, callback) => {
		const localCallback = (err, result) => {
			callback(err, result);
		};

		const exec = require('child_process').exec;
		const osaScript = require('osascript').eval;

		const workingParms = qtools.clone(parms);
		workingParms.type = workingParms.type.toLowerCase();

		switch (workingParms.type) {
			case 'applescript':
				osaScript(script, parms, localCallback);
				break;
			case 'bash':
				qtools.die({ 'workingParms.typeA': workingParms.type });
				exec(script, localCallback);
				break;
			default: //osascript default is javascript
			case 'jax':
				workingParms.type = 'javascript';
				osaScript(script, parms, localCallback);
				break;
		}
	};
	
	const { getScript, compileScript } = args;
	this.execute = executeActual({
		processor,
		getScript,
		compileScript,
		helixData
	});
	
	this.validateSchema = validateSchema;
	
	
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

