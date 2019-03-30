var commonTest = require('../commonTest.js');
var assert = require('assert');
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(
	/^\/.*\/([a-zA-Z_0-9]+)\.js/,
	'$1'
);

var testDescription;
var qtools = commonTest.qtools;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies: commonTest.authGoodies
});

describe('Auth Token function (' + moduleFileName + ')', function() {
	commonTest.standardInit(helixConnector, before, after, this);

	var token;
	var userId = 'tq@justkidding.com';

	testDescription = 'should generate a token';
	it(testDescription, function(done) {
		helixConnector.generateAuthToken(userId, function(err, result, misc) {
			token = result;
			done();
		});
	});

	testDescription = 'should validate the token';
	it(testDescription, function(done) {

		const validation = helixConnector.validateUserTokenUnitTestEndpoint({
			userId,
			authToken: token
		});
		if (typeof validation == 'string') {
			done(new Error(validation));
		} else {
			done();
		}
	});

	testDescription = 'should reject the bad token';
	it(testDescription, function(done) {

		const validation = helixConnector.validateUserTokenUnitTestEndpoint({
			userId,
			authToken: token + 'x'
		});

		if (validation.toString().match(/invalid signature/)) {
			done();
		} else {
			done(validation);
		}
	});

	testDescription = 'should reject the bad userId';
	it(testDescription, function(done) {

		const validation = helixConnector.validateUserTokenUnitTestEndpoint({
			userId: userId + 'x',
			authToken: token
		});

		if (validation.toString().match(/userId does not match/)) {
			done();
		} else {
			done(validation);
		}
	});

	testDescription = 'should reject token from a different instance';
	it(testDescription, function(done) {
		var differentInstanceUserId = userId;
		var differentInstanceToken =
			'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0cUBqdXN0a2lkZGluZy5jb20iLCJpbnN0YW5jZUlkIjoicWJvb2tUZXN0U2VydmVyeHgiLCJpYXQiOjE0NDgwODMwNTN9.LSq3033mjIMS1MRfRaWm-X2sOLpNedYHAAMC9v54Vr8';

		const validation = helixConnector.validateUserTokenUnitTestEndpoint({
			differentInstanceUserId,
			authToken: differentInstanceToken
		});

		if (validation.toString().match(/instanceId does not match/)) {
			done();
		} else {
			done(validation);
		}
	});
});

