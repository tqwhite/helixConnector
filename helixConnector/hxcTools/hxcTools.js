#!/usr/local/bin/node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

//START OF moduleFunction() ============================================================

var moduleFunction = function() {

console.log(`
============================================
hxcTools

============================================
`);


// var inString = '';
// 
// 
// var writeStuff = function() {
// 	var outString = '';
// 
// 	outString = inString.toUpperCase();
// 
// 	process.stdout.write(outString);
// };
// 
// //the rest ========================================================
// 
// process.stdin.resume();
// process.stdin.setEncoding('utf8');
// process.stdin.on('data', function(data) {
// 	inString += data;
// });
// process.stdin.on('end', writeStuff);

	return this;
};

//END OF moduleFunction() ============================================================

//module.exports = moduleFunction;
module.exports = new moduleFunction();

