#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

//npm i qtools-functional-library
//npm i qtools-config-file-processor
//npm i qtools-parse-command-line

// const path=require('path');
// const fs=require('fs');

// const configFileProcessor = require('qtools-config-file-processor');
//const config = configFileProcessor.getConfig('systemConfig.ini', __dirname)[__filename.replace(__dirname+'/', '').replace(/.js$/, '')];

// const commandLineParser = require('qtools-parse-command-line');
// const commandLineParameters = commandLineParser.getParameters();

const qt = require('qtools-functional-library');
//console.dir(qt.help());

console.error(`HELLO FROM: ${__filename}`);

//START OF moduleFunction() ============================================================

const moduleFunction = function({ getSchema, helixParms }) {
	
	const resolve = ({path, req, res}) => {
		
		const pathParts = path.match(/\/([\w-.]+)/g);

		let schemaName;

		if (['/staticTest', '/dynamicTest', '/noPost'].includes(pathParts[0])) {
			schemaName = pathParts ? pathParts[1].replace(/^\//, '') : '';
		} else {
			schemaName = pathParts ? pathParts[0].replace(/^\//, '') : '';
		}

		const staticTest = pathParts[0] == '/staticTest';
		const dynamicTest = pathParts[0] == '/dynamicTest';
		const noPost = pathParts[0] == '/noPost';
		const schema = getSchema(helixParms, schemaName);

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
				`debugData=true on schema ${schemaName}, writing files to /pathParts`
			);
			const filePath = `/pathParts/hxc_Get_RequestQuery_${new Date().getTime()}_${
				schema.schemaName
			}.txt`;
			qtools.logWarn(`WRITING get request query: ${filePath} (debugData=true)`);
			qtools.writeSureFile(filePath, JSON.stringify(req.query));
		}

		return schema;
	};
	
	return { resolve };
};

//END OF moduleFunction() ============================================================


module.exports = args=>moduleFunction(args)

