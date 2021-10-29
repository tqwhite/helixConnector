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

//START OF moduleFunction() ============================================================

const moduleFunction = function({app, newConfig}) {

	const install=()=>{

console.log(`\n=-=============   INSIDE  ========================= [external-authorization.js.moduleFunction]\n`);


	app.use(function(req, res, next){
			qtools.logMilestone(`INSIDE: external authorization.install()`);
		next();
	});
	
	}
	


	return ({install});
};

//END OF moduleFunction() ============================================================

module.exports = args=>moduleFunction(args)
//moduleFunction().workingFunction().qtDump();

