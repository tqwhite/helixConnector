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
		send500r
	} = args;
	
	

	var remoteControl = function(helixConnector, schema, query, callback) {
		var retrievalParms = {
			authToken: 'hello',
			schema,
			otherParms: query,
			debug: false,
			callback: callback
		};
		helixConnector.process('remoteControlManager', retrievalParms);
	};
	
	var retrieveRecords = function(
		helixConnector,
		schema,
		criterion,
		callback,
		req,
		res
	) {
		var retrievalParms = {
			authToken: 'hello',
			helixSchema: qtools.clone(schema),
			otherParms: {},
			debug: false,
			inData: {},
			callback: callback
		};

		if (schema.criterionSchemaName) {
			const criterionSchema = schemaResolver.resolve({
				path: `/${schema.criterionSchemaName}`,
				req,
				res
			});

			if (!criterionSchema) {
				callback(
					`BAD ENDPOINT CONSTRUCTION. Criterion endpoint: ${
						schema.criterionSchemaName
					} is not defined.`
				);
				return;
			}

			retrievalParms.helixSchema.criterion = criterionSchema;
			retrievalParms.criterion = {};
			retrievalParms.criterion.data = criterion;
		}

		helixConnector.process('retrieveRecords', retrievalParms);
	};

	//==================================================================================

	const responder = (req, res, next) => {
		const schema = schemaResolver.resolve({ path: req.path, req, res });

		if (!schema) {
			qtools.logError(`getResolvedSchema returns no schema for ${req.path}`);
			return; //the rule is that getResolvedSchema() sent an error response
		}

		//----------------------------------------------------------------------------------

		const testHxServerAliveSchema = schemaResolver.resolve({
			path: '/testHxServerAlive',
			req,
			res
		});

		testHxServerAliveSchema.schema = 'testHxServerAliveSchema';

		try {
			testHxServerAliveSchema.original = qtools.clone(testHxServerAliveSchema);
		} catch (err) {
			send500(
				res,
				req,
				`Schema '${schemaName}' CRASH CRASH CRASH Mysterious qtools.clone stack overflow soft error. HACK`
			);
			process.exit(1);
		}

		//----------------------------------------------------------------------------------

		const runRealSchema = (err, result = '') => {
			const helixRunning = result.databaseAlive; //a defined by interfaceLibrary/testHxServerAlive.applescript
			if (schema.schemaType == 'helixAccess' && (!helixRunning || err)) {
				sendResult(res, req, next, helixConnector)(
					err
						? err.toString()
						: `Helix is not running (--NOTE, often this is because there is a 'wants to control' security dialog on the Macintosh screen)'`
				);
				return;
			}

			if (helixConnector) {
				switch (schema.schemaType) {
					case 'remoteControl':
						remoteControl(
							helixConnector,
							schema,
							req.query,
							sendResult(res, req, next, helixConnector)
						);
						break;

					case 'helixAccess':
					default:
						retrieveRecords(
							helixConnector,
							schema,
							req.query,
							sendResult(res, req, next, helixConnector),
							req,
							res
						);
				}
			}
		};

		//----------------------------------------------------------------------------------

		const helixConnector = fabricateConnector(req, res, schema);

		//----------------------------------------------------------------------------------

		remoteControl(
			helixConnector,
			testHxServerAliveSchema,
			req.query,
			runRealSchema
		);
	};
	//===========================================================
	
	return { responder };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();
//moduleFunction().workingFunction().qtDump();

