#!/usr/bin/env node
'use strict';
// const qtoolsGen = require('qtools');
// const qtools = new qtoolsGen(module, { updatePrototypes: true });

console.error(`HELLO FROM: ${__filename}`);

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

const moduleFunction = function({router, hxClientSpecialAuthPath}) {
		router.get(new RegExp(hxClientSpecialAuthPath), (req, res, next) => {
			res.send('hello from addHelixClientSpecialAuth');
		});
	};

//END OF moduleFunction() ============================================================

module.exports = args=>new moduleFunction(args)
//module.exports = moduleFunction;
//module.exports = new moduleFunction();
//moduleFunction().workingFunction().qtDump();

