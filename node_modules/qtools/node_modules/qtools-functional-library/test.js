#!/usr/local/bin/node
'use strict';

const qt = require('./qtools-functional-library.js');

//console.dir(qt.help());
const verbose=process.argv.filter(item=>item.match(/verbose/i))[0]?true:false
const logErrors=process.argv.filter(item=>item.match(/logErrors/i))[0]?true:false
const listTests=process.argv.filter(item=>item.match(/listTests/i))[0]?true:false

const methodList=process.argv
	.qtClone() //create a deep copy so changes can't leak back to the source
	.filter(item=>item.match(/^--methodList/)) //['--methodList=qtClone,qtToString,qtPop']
	.qtGetSurePath('[0]', '') //'--methodList=qtClone,qtToString,qtPop'
	.split('=') //['--methodList', 'qtClone,qtToString,qtPop']
	.qtGetSurePath('[1]', '') //'qtClone,qtToString,qtPop'
	.split(',') //['qtClone', 'qtToString', 'qtPop']
	.filter(item=>item.length>0) //eliminates the empty if default


const result=qt.test({logErrors, verbose, methodList, listTests});
console.log(result?"PASSED ALL TESTS":"");

const showAdditionalInfo=(verbose, result)=>{
console.log(`result=${result}`);

if (!verbose && result){
	return;
}
console.log(`

Additional Usage:
npm logTest; #node --trace-uncaught test.js -listTests -logErrors --methodList=qtLog
npm test; #node test.js -verbose -logErrors
npm quiet; #node test.js -listTests -logErrors

# -logErrors shows the message from any failing tests

or find .../qtools-functional-library/test.js and execute, eg,
    cd .../qtools-functional-library/test.js;
    node test.js --methodList=qtMapProperties
    `)
    
    }
showAdditionalInfo(verbose, result)

process.exit(result?0:1);