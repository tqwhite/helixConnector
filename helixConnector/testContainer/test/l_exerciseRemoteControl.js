var commonTest = require('../commonTest.js');
var assert = require('assert');
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1');

var testDescription,
	qtools = commonTest.qtools;
var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	processIdentifier: 'l_exerciseRemoteControl',
	authGoodies: commonTest.authGoodies
});
describe('Exercise Remote Control (' + moduleFileName + ')', function() {
	commonTest.nonHelixInit(helixConnector, before, after, this);

	//new test ====================================================

	testDescription =
		'do some good APPLESCRIPT from INTERNAL TEST Directory (lib)';
	it(testDescription, function(done) {
		var helixSchema = {
			schemaType: 'remoteControl',
			scriptName: 'remoteControlInternalTest1',
			arguments: {
				hello: 'goodbye I do not think this gets carried through yet',
				orange: 'black'
			}
		};
		var testRecordData = {
			testReturnString: 'orange'
		};

		helixConnector.process('remoteControlManager', {
			schema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: function(err, result, misc) {
				if (result.trim() != `${testRecordData.testReturnString}INTERNAL`) {
					err = new Error(
						'return value does not match the value that was sent'
					);
				}
				done(err);
			}
		});
	});

	//new test ====================================================

	testDescription = 'do some good APPLESCRIPT from USER Directory';
	it(testDescription, function(done) {
		var helixSchema = {
			schemaType: 'remoteControl',
			scriptName: 'remoteControlUserTest1',
			arguments: {
				hello: 'goodbye I do not think this gets carried through yet',
				orange: 'black'
			}
		};
		var testRecordData = {
			testReturnString: 'orange'
		};
		helixConnector.process('remoteControlManager', {
			schema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: function(err, result, misc) {
				if (
					result.trim() !=
					`?testReturnString=\'${
						testRecordData.testReturnString
					}' (via remoteControlTest1.applescript)`
				) {
					err = new Error(
						'return value does not match the value that was sent (the most common problem is TQ changed the return from some library script)'
					);
				}
				done(err);
			}
		});
	});

	//new test ====================================================

	testDescription = 'do some good BASH from INTERNAL TEST Directory';
	it(testDescription, function(done) {
		var helixSchema = {
			schemaType: 'remoteControl',
			scriptName: 'remoteControlInternalTest2',
			arguments: {
				hello: 'goodbye I do not think this gets carried through yet',
				orange: 'black'
			}
		};
		var testRecordData = {
			testReturnString: 'orange'
		};
		helixConnector.process('remoteControlManager', {
			schema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: function(err, result, misc) {
				if (
					result.trim() != `${testRecordData.testReturnString}_INTERNAL_BASH`
				) {
					err = new Error(
						'return value does not match the value that was sent'
					);
				}
				done(err);
			}
		});
	});

	//new test ====================================================

	testDescription = 'do some good BASH from USER TEST Directory';
	it(testDescription, function(done) {
		var helixSchema = {
			schemaType: 'remoteControl',
			scriptName: 'remoteControlUserTest2',
			arguments: {
				hello: 'goodbye I do not think this gets carried through yet',
				orange: 'black'
			}
		};
		var testRecordData = {
			testReturnString: 'orange'
		};
		helixConnector.process('remoteControlManager', {
			schema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: function(err, result, misc) {
				if (result.trim() != `${testRecordData.testReturnString}USER`) {
					err = new Error(
						'return value does not match the value that was sent'
					);
				}
				done(err);
			}
		});
	});

	//new test ====================================================

	testDescription = 'force error because of a bad schema type';
	it(testDescription, function(done) {
		const badSchemaType = 'bad schema name';
		var helixSchema = {
			schemaType: badSchemaType,
			scriptName: 'remoteControlUserTest2',
			arguments: {
				hello: 'goodbye I do not think this gets carried through yet',
				orange: 'black'
			}
		};
		var testRecordData = {
			testReturnString: 'orange'
		};
		helixConnector.process('remoteControlManager', {
			schema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: function(err, result, misc) {
				if (
					err.toString().trim() != `Error: unknown schemaType 'bad schema name'`
				) {
					err = new Error(`got wrong error '${err}'`);
					done(err);
					return;
				}

				done();
			}
		});
	});

	//new test ====================================================
});

