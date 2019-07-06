#!/usr/local/bin/node

// /Users/tqwhite/Documents/webdev/helixConnector/project/configs/tqwhite2/commandLine/curlGetViewSummary | /Users/tqwhite/Documents/webdev/helixConnector/project/code/helixConnector/hxcTools/lib/createPhpSchema/createPhpSchema.js
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	var inString = ''; //this is special. it is initialized by the inbound stream
	
	const commonFunctions = require('./lib/mirrorParameterCommonFunctions.js');
	
	commonFunctions.setEndpointName(process.env.currentEndpoint);
	
	const convertName = commonFunctions.convertName;
	const getMappingElement = commonFunctions.getMappingElement;
	const createControlProperties = commonFunctions.createControlProperties;

	const containerTemplate = qtools.fs
		.readFileSync(
			'/Users/tqwhite/Documents/webdev/helixConnector/project/code/helixConnector/hxcTools/lib/createMirrorParameterSet/templates/container.txt'
		)
		.toString();
	const fieldListTemplate = qtools.fs
		.readFileSync(
			'/Users/tqwhite/Documents/webdev/helixConnector/project/code/helixConnector/hxcTools/lib/createMirrorParameterSet/templates/fieldList.txt'
		)
		.toString();

	var writeStuff = function() {
		const viewSummary = JSON.parse(inString);
		commonFunctions.findErrorsAndDie(viewSummary);
		
		const primaryKey = commonFunctions.getPrimaryKey(viewSummary);
		const endpointName = commonFunctions.getEndpointName(viewSummary);
		const tableName = commonFunctions.getTableName(viewSummary);

		const fieldList = viewSummary.fieldData
			.map(item => {
				const name = item.meta.customName || item.meta.nativeName;

				const newFieldName = convertName(name);

				const fieldListItem = {
					helixName: newFieldName,
					mysqlName: newFieldName,
					type: getMappingElement(item.meta),
					primaryKey:
						item.meta.nativeName == primaryKey ||
						item.meta.customName == primaryKey,
					autoIncrement: false
				};

				return qtools.templateReplace({
					template: fieldListTemplate,
					replaceObject: fieldListItem
				});
			})
			.join(',\n')
			.replace(/,\n$/, '\n');


		let domain;
		if ('not' == 'external') {
			domain = '70.151.72.162';
		} else {
			domain = '192.168.0.50';
		}

		const containerStuff = {
			flushAndLoad: false,
			relation: viewSummary.context.customRelationName,
			view: viewSummary.context.viewNameUsed,
			hxConnectorEndpointName: `${endpointName}`,
			databaseName: 'mirrorHelix',
			tableName: tableName,
			nativeRelationName: viewSummary.context.nativeRelationName,
			fieldList: fieldList
		}; //remember, stuff added here doesn't get to the output file until it's added to the template

		const outString = qtools.templateReplace({
			template: containerTemplate,
			replaceObject: containerStuff
		});

		process.stdout.write(outString);
	};

	//the rest ========================================================

	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(data) {
		inString += data;
	});
	process.stdin.on('end', writeStuff);

	return this;
};

//END OF moduleFunction() ============================================================

//module.exports = moduleFunction;
module.exports = new moduleFunction();

