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
	
	commonFunctions.setEndpointName(process.env.currentEndpoint);
	
	commonFunctions.setEndpointName(process.env.currentEndpoint);
	
	commonFunctions.setShowErrors(true);
	
	const convertName = commonFunctions.convertName;
	const getMappingElement = commonFunctions.getMappingElement;
	const createControlProperties = commonFunctions.createControlProperties;

	var writeStuff = function() {
		const viewSummary = JSON.parse(inString);
		commonFunctions.findErrorsAndDie(viewSummary);
		
		const primaryKey = commonFunctions.getPrimaryKey(viewSummary);
		const endpointName = commonFunctions.getEndpointName(viewSummary);
		const tableName = commonFunctions.getTableName(viewSummary);
		const phpSchemaName=endpointName; //just so I remember what's what.
		
		process.stdout
			.write(`
For ${commonFunctions.getNativeRelationName(viewSummary)}:
grabData('dynamicTest/${endpointName}', 'listing', {});
hx-to-mysql-cli.php -createTable ${phpSchemaName} >> ~/Desktop/createTableStatements.sql
hx-to-mysql-cli.php -debugEndpoint -echoAlso ${phpSchemaName}
select count(*) from ${tableName};

`);
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

