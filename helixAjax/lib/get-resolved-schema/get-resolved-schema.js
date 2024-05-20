#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');
//console.dir(qt.help());

//START OF moduleFunction() ============================================================

const moduleFunction = function({ getSchema, helixParms, send500 }) {
	
	const resolve = ({ path, req, res }) => {
		const mapSeparationAliases = (separators = {}) => {
			const outObject = {};
			Object.keys(separators).forEach(name => {
				outObject[name] = separators[name]
					.replace(/TAB/g, '\t')
					.replace(/CR/g, '\r')
					.replace(/LF/g, '\n')
					.replace(/TICK/g, '`');
			});

			return outObject;
		};

		const pathParts = path.match(/\/([\w-.]+)/g);

		if (!pathParts) {
			send500(res, req, `Illegal path '${path}'`);
			return;
		}

		let viewName;


		const schemaNameSegmentIndex = pathParts.length > 1 ? 1 : 0;
		const schemaName = pathParts
			? pathParts[schemaNameSegmentIndex].replace(/^\//, '')
			: '';
		const viewType = pathParts.length > 1 ? pathParts[0].replace(/^\//, '') : 'prod';

		const schema = getSchema(helixParms, schemaName);
		
		if (!schema){
				send500(res, req, `No such schema '${schemaName}'`);
				return;
		}
		
		if (schema.schemaType == 'remoteControl') {
		} else if (schema.views) {
			if (Object.keys(schema.views).includes(viewType)) {
				viewName = schema.views[viewType];
			} else {
				send500(res, req, `Illegal path segment '${viewType}/${schemaName}'`);
				return;
			}
		} else {
			schema.staticTestRequestFlag = false;
			switch (viewType.toLowerCase()) { //backward compatability
				case 'dynamictest':
					viewName = schema.internalSchema?schema.view:schema.testViewName;
					break;

				case 'nopost':
					viewName = schema.internalSchema?schema.view:schema.noPostViewName;
					break;
				case 'statictest':
				case 'fromfile': 
					//fromFile and staticTest are synonyms since static-data was upgraded to try 'relation_view' for missing filename
					viewName = 'SPECIAL';
					schema.staticTestRequestFlag = true;
					break;
				case 'prod':
				case '':
					viewName = schema.view;
					break;
			}

			if (!viewName) {
				send500(
					res,
					req,
					`No view specified for path segment '${viewType}/${schemaName}'`
				);
				return;
			}
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
		} else {
			schema.view = viewName;
		}
		
		if (schema.staticTest && typeof schema.staticTestData == 'undefined') {
			send500(res, req, `Schema ${schemaName}' does not have staticTestData`);
			return;
		}

		schema.schemaType = schema.schemaType ? schema.schemaType : 'helixAccess'; //just for completeness, I made it the default when I was young and stupid

		if (qtools.isTrue(schema.debugData) && schema.schemaName) {
			qtools.logWarn(
				`debugData=true on schema ${schemaName}, writing files to /pathParts`
			);
			const filePath = `/tmp/pathParts/hxc_Get_RequestQuery_${new Date().getTime()}_${
				schema.schemaName
			}.txt`;
			qtools.logWarn(`WRITING get request query: ${filePath} (debugData=true)`);
			qtools.writeSureFile(
				filePath,
				JSON.stringify({
					...req.query,
					tqNote:
						'remember, leading ? is removed by get-responder-catchall.js before actual processing'
				})
			);
		}

		schema.separators = mapSeparationAliases(schema.separators);

		return schema;
	};
	
	return { resolve };
};

//END OF moduleFunction() ============================================================

module.exports = args => moduleFunction(args);

