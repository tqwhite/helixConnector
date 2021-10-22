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

const moduleFunction = function(args={}) {

const showInfo=({helixParms, newConfig, suppressLogEndpointsAtStartup})=>{
	const generateEndpointDisplayList = helixParms => {
		const endpointList = [];
		for (var schemaName in helixParms.schemaMap) {
			var element = getSchema(helixParms, schemaName);
			if (!element) {
				qtools.logWarn(`MISSING SCHEMA FILE: No ${schemaMap} found`);
				continue;
			}

			const dyn = element.testViewName ? `, dynamicTest/${schemaName}, ` : '';
			const stat = element.staticTestData ? `, staticTest/${schemaName}` : '';
			const noPost = element.noPostViewName ? `, noPost/${schemaName}` : '';
			endpointList.push(`${schemaName}${dyn}${stat}${noPost}`);
		}
		return endpointList;
	};
	
	if (!qtools.getSurePath(newConfig, 'system.suppressLogEndpointsAtStartup')) {
		const endpointDisplayList = generateEndpointDisplayList(helixParms);
		qtools.logMilestone(
			`Endpoints:\n\t${endpointDisplayList.join(
				'\n\t'
			)}\n[endpoint listing from: hexlixAjax.js]`
		);
	} else {
		qtools.logMilestone(
			'TURN ON endpoint listing from helixAjax.js by setting system.suppressLogEndpointsAtStartup=false in config'
		);
	}
	}
	return ({showInfo});
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction();
//moduleFunction().workingFunction().qtDump();

