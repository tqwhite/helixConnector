var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;
var qtools = commonTest.qtools;

describe('Introduction (' + moduleFileName + ')', function() {

	commonTest.standardInit(before, after, this);

	testDescription = "should say Hello"
	it(testDescription, function(done) {
		done();

	});

});


