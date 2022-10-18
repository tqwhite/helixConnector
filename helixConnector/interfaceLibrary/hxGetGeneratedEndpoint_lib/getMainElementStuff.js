'use strict';

const moduleName = __filename
	.replace(__dirname + '/', '')
	.replace(/.js$/, '');  //this just seems to come in handy a lot
 const qt = require('qtools-functional-library');

const commandLineParser = require('qtools-parse-command-line');
const commandLineParameters = commandLineParser.getParameters();

//START OF moduleFunction() ============================================================

const moduleFunction = function({ log }) {
log(`\n=-=============   log  ========================= [getMainElementStuff.js.moduleFunction]\n`);

const relationName=commandLineParameters.qtGetSurePath('values.relationName', []).qtPop('none')


	log(`\nENTERINGAAA ${moduleName} relationNameXX=${relationName}\n`);
log(`	qwe	e`);
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;

