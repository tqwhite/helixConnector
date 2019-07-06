#!/usr/local/bin/node
'use strict';

// /Users/tqwhite/Documents/webdev/helixConnector/project/configs/tqwhite2/commandLine/curlGetViewSummary | /Users/tqwhite/Documents/webdev/helixConnector/project/code/helixConnector/hxcTools/lib/createEndpoint/createEndpoint.js

const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	var inString = ''; //this is special. it is initialized by the inbound stream

	const commonFunctions = require('./lib/mirrorParameterCommonFunctions.js');
	const convertName = commonFunctions.convertName;
	const getMappingElement = commonFunctions.getMappingElement;
	const createControlProperties = commonFunctions.createControlProperties;

	var writeStuff = function() {
		const viewSummary = JSON.parse(inString);
		commonFunctions.findErrorsAndDie(viewSummary);
		
		const primaryKey = commonFunctions.getPrimaryKey(viewSummary);
		const endpointName = commonFunctions.getEndpointName(viewSummary);
		const tableName = commonFunctions.getTableName(viewSummary);

		const fieldSequenceList = viewSummary.fieldData.map(item =>
			convertName(
				item.meta.customName ? item.meta.customName : item.meta.nativeName
			)
		);
		const mapping = viewSummary.fieldData.map(item =>
			getMappingElement(item.meta)
		);

		const definitionBlock = Object.assign(
			{},
			{
				fieldSequenceList,
				mapping,
				primaryKey: primaryKey,
				nativeRelationName: viewSummary.context.nativeRelationName,
				mysqlTableName:tableName
			},
			createControlProperties(viewSummary.context)
		);

		const outObject = {};
		outObject[endpointName] = definitionBlock;

		const outString = JSON.stringify(outObject)
			.replace(/^\{/, '')
			.replace(/\}$/, ',');

		process.stdout.write(`${outString}\n\n`);
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

