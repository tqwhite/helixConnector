#!/usr/local/bin/node
'use strict';


// /Users/tqwhite/Documents/webdev/helixConnector/project/configs/tqwhite2/commandLine/curlGetViewSummary | /Users/tqwhite/Documents/webdev/helixConnector/project/code/helixConnector/hxcTools/lib/createEndpoint/createEndpoint.js


const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {


var inString = '';

var writeStuff = function() {
	if (!inString){
		process.exit(0);
	}
	var outString = inString.replace(/,\s*$/, '').replace(/^/, '{\n').replace(/$/, '\n}\n')
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


