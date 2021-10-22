#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');
//START OF moduleFunction() ============================================================

const moduleFunction = function(args = {}) {
	const {
		schemaResolver,
		fabricateConnector,
		sendResult,
		send500
	} = args;
	

	var sendRcData = function(helixConnector, schema, testRecordData, callback) {
		callback('POST/sendRcData() is not implemented for helixAjax.js');
	};
	

	var saveRecords = function(helixConnector, schema, testRecordData, callback, req, res) {
		if (schema.responseSchemaName) {
			var responseSchema = schemaResolver.resolve({ path: `/${schema.responseSchemaName}`, req, res });
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
		
		const schema = schemaResolver.resolve({ path: req.path, req, res });

		let outData = qtools.toType(req.body) == 'array' ? req.body : [req.body];

		if (qtools.toType(req.body) != 'array') {
			res
				.status(400)
				.send('Validation error: submitted data must be an array or object');
			helixConnector.close(); //I do not think this has meaning anymore (now that heliport is gone)
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
						sendResult(res, req, next, helixConnector), req, res
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

