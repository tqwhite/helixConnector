#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library'); 
 //START OF moduleFunction() ============================================================

const moduleFunction = function(args = {}) {
	const {
		getSchema,
		helixParms,
		fabricateConnector,
		sendResult,
		send500
	} = args;
	

	var sendRcData = function(helixConnector, schema, testRecordData, callback) {
		callback('POST/sendRcData() is not implemented for helixAjax.js');
	};
	

	var saveRecords = function(helixConnector, schema, testRecordData, callback) {
		if (schema.responseSchemaName) {
			var responseSchema = helixParms.schemaMap[schema.responseSchemaName];
			schema.response = responseSchema;
		}

		/* NEXT
		
		Figure out how to get req.body to here and pass it through to verify 
		
		
		*/

		helixConnector.process('saveOneWithProcess', {
			authToken: 'hello',
			helixSchema: schema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: callback
		});
	};
	
	const responder = (req, res, next) => {
		const tmp = req.path.match(/\/([\w-.]+)/g);
		let schemaName;

		if (['/staticTest', '/dynamicTest'].includes(tmp[0])) {
			schemaName = tmp ? tmp[1].replace(/^\//, '') : '';
		} else {
			schemaName = tmp ? tmp[0].replace(/^\//, '') : '';
		}

		const staticTest = tmp[0] == '/staticTest';
		const dynamicTest = tmp[0] == '/dynamicTest';

		const schema = getSchema(helixParms, schemaName);
		if (!schema) {
			send500(res, req, `Schema '${escape(schemaName)}' not defined`);
			return;
		}
		schema.schemaName = schemaName;

		schema.schemaType = schema.schemaType ? schema.schemaType : 'helixAccess'; //just for completeness
		let outData;
		if (qtools.toType(req.body) == 'array') {
			outData = req.body;
		} else if (qtools.toType(req.body) == 'object' && req.body != null) {
			outData = [req.body];
		} else {
			res
				.status(400)
				.send('Validation error: submitted data must be an array or object');
			helixConnector.close();
			return;
		}

		if (qtools.isTrue(schema.debugData) && schema.schemaName) {
			qtools.logWarn(
				`debugData=true on schema ${schemaName}, writing files to /tmp`
			);
			const filePath = `/tmp/hxc_Post_RequestBody_${new Date().getTime()}_${
				schema.schemaName
			}.txt`;
			qtools.logWarn(`WRITING post request body: ${filePath} (debugData=true)`);
			qtools.writeSureFile(filePath, JSON.stringify(req.body));
		}

		var helixConnector = fabricateConnector(req, res, schema);
		if (helixConnector) {
			switch (schema.schemaType) {
				case 'remoteControl':
					sendRcData(
						helixConnector,
						schema,
						req.query,
						sendResult(res, req, next, helixConnector)
					);
					break;

				case 'helixAccess':
				default:
					saveRecords(
						helixConnector,
						schema,
						outData,
						sendResult(res, req, next, helixConnector)
					);
			}
		}
	};

	return { responder };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();
//moduleFunction().workingFunction().qtDump();

