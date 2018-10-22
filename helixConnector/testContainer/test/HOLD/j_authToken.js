var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_0-9]+)\.js/, '$1')

var testDescription;
var qtools = commonTest.qtools;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies:commonTest.authGoodies
});

describe('Auth Token function (' + moduleFileName + ')', function() {

	commonTest.standardInit(helixConnector, before, after, this);

	var token;
	var userId = 'tq@justkidding.com';

	testDescription = "should generate a token"
	it(testDescription, function(done) {
		helixConnector.generateAuthToken(userId, function(err, result, misc) {
			token = result;
			done();
		});

	});

	testDescription = "should validate the token"
	it(testDescription, function(done) {
		helixConnector.cancelValidation();
		helixConnector.validateUserId(userId, token, function(err, result, misc) {
			if (result) {
				done();
			} else {
				done(err);
			}
		});

	});

	testDescription = "should reject the bad token"
	it(testDescription, function(done) {
		helixConnector.cancelValidation();
		helixConnector.validateUserId(userId, token + 'x', function(err, result, misc) {
			if (err.toString().match(/invalid signature/)) {
				done();
			} else {
				done(err);
			}
		});

	});

	testDescription = "should reject the bad userId"
	it(testDescription, function(done) {
		helixConnector.cancelValidation();
		helixConnector.validateUserId(userId + 'x', token, function(err, result, misc) {
			if (err.toString().match(/userId does not match/)) {
				done();
			} else {
				done(err);
			}
		});

	});

	testDescription = "should reject token from a different instance"
	it(testDescription, function(done) {
		var differentInstanceUserId=userId;
		var differentInstanceToken='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0cUBqdXN0a2lkZGluZy5jb20iLCJpbnN0YW5jZUlkIjoicWJvb2tUZXN0U2VydmVyeHgiLCJpYXQiOjE0NDgwODMwNTN9.LSq3033mjIMS1MRfRaWm-X2sOLpNedYHAAMC9v54Vr8';
		helixConnector.cancelValidation();
		helixConnector.validateUserId(differentInstanceUserId, differentInstanceToken, function(err, result, misc) {

			if (err.toString().match(/instanceId does not match/)) {
				done();
			} else {
				done(err);
			}
		});

	});

});


