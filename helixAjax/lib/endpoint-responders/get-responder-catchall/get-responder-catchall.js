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
	
	

	var remoteControl = function(helixConnector, schema, query, callback) {
		var retrievalParms = {
			authToken: 'hello',
			schema: qtools.clone(schema),
			otherParms: query,
			debug: false,
			callback: callback
		};
		helixConnector.process('remoteControlManager', retrievalParms);
	};
	
	var retrieveRecords = function(helixConnector, schema, criterion, callback) {
		var retrievalParms = {
			authToken: 'hello',
			helixSchema: qtools.clone(schema),
			otherParms: {},
			debug: false,
			inData: {},
			callback: callback
		};

		if (schema.criterionSchemaName) {
			var criterionSchema = helixParms.schemaMap[schema.criterionSchemaName];

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
	
	const responder = (req, res, next) => {
		const tmp = req.path.match(/\/([\w-.]+)/g);
		let schemaName;

		if (qtools.toType(tmp) != 'array') {
			qtools.logError(`Bad Path: ${req.path}`);
			send500(res, req, `Bad Path: ${req.path}`);
			return;
		}

		if (['/staticTest', '/dynamicTest', '/noPost'].includes(tmp[0])) {
			schemaName = tmp ? tmp[1].replace(/^\//, '') : '';
		} else {
			schemaName = tmp ? tmp[0].replace(/^\//, '') : '';
		}

		const staticTest = tmp[0] == '/staticTest';
		const dynamicTest = tmp[0] == '/dynamicTest';
		const noPost = tmp[0] == '/noPost';

		const schema = getSchema(helixParms, schemaName);

		const testHxServerAliveSchema = getSchema(helixParms, 'testHxServerAlive');
		testHxServerAliveSchema.schema = 'testHxServerAliveSchema';

		try {
			testHxServerAliveSchema.original = qtools.clone(testHxServerAliveSchema);
		} catch (err) {
			send500(res, req, `Schema '${schemaName}' CRASH CRASH CRASH`);
			process.exit(1);
		}

		if (!schema) {
			send500(res, req, `Schema '${schemaName}' not defined`);
			return;
		}

		schema.schemaName = schemaName; //I don't trust myself not to forget to include this when I define an endpoint

		if (!schema.original) {
			schema.original = qtools.clone(schema);
		}

		if (qtools.isTrue(schema.schemaType == 'remoteControl')) {
		} else if (dynamicTest) {
			const viewName = schema.testViewName;

			if (!viewName) {
				send500(
					res,
					req,
					`Schema '${schemaName}' does not have a testViewName property`
				);
				return;
			}
			schema.view = viewName;
		} else if (noPost) {
			const viewName = schema.noPostViewName;

			if (!viewName) {
				send500(
					res,
					req,
					`Schema '${schemaName}' does not have a noPostViewName property`
				);
				return;
			}
			schema.view = viewName;
		} else {
			let viewName = schema.original.view;

			if (!viewName) {
				send500(
					res,
					req,
					`Schema '${schemaName}' does not have a view property`
				);
				return;
			}
			schema.view = viewName;
		}

		schema.staticTestRequestFlag = staticTest;

		if (schema.staticTest && typeof schema.staticTestData == 'undefined') {
			send500(res, req, `Schema ${schemaName}' does not have staticTestData`);
			return;
		}

		schema.schemaType = schema.schemaType ? schema.schemaType : 'helixAccess'; //just for completeness, I made it the default when I was young and stupid

		if (qtools.isTrue(schema.debugData) && schema.schemaName) {
			qtools.logWarn(
				`debugData=true on schema ${schemaName}, writing files to /tmp`
			);
			const filePath = `/tmp/hxc_Get_RequestQuery_${new Date().getTime()}_${
				schema.schemaName
			}.txt`;
			qtools.logWarn(`WRITING get request query: ${filePath} (debugData=true)`);
			qtools.writeSureFile(filePath, JSON.stringify(req.query));
		}

		var helixConnector = fabricateConnector(req, res, schema);
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
							sendResult(res, req, next, helixConnector)
						);
				}
			}
		};

		remoteControl(
			helixConnector,
			testHxServerAliveSchema,
			req.query,
			runRealSchema
		);
		
	};

	return { responder };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();
//moduleFunction().workingFunction().qtDump();

