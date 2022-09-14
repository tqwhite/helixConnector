#!/usr/local/bin/node
'use strict';

const qt = require('qtFunctionalLib');

//console.dir(qt.help());


const result=qt.test({logErrors:false});
console.log(result?"PASSED ALL TESTS":"");

process.exit(result?0:1);