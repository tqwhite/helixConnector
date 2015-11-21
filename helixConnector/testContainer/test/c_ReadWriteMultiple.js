var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

describe('Connector Write Multiple (' + moduleFileName + ')', function() {

	commonTest.standardInit(helixConnector, before, after, this);

	var helixSchema = {
		relation: 'simpleTest',
		view: 'simpleOne',
		fieldSequenceList: [
			'textFieldOne',
			'textFieldTwo'
		],
		mapping: {
			terminalId: function() {
				return 'saveOne.js';
			},
			refId: 'refId',
			createDateTime: 'helixDateTimeNow'
		}
	};

	var testRecordData = [{
			textFieldOne: 'dog',
			textFieldTwo: 'cat'
		}, {
			textFieldOne: 'ocean',
			textFieldTwo: 'lake'
		}];

	testDescription = "should write data with no errors"
	it(testDescription, function(done) {
		helixConnector.process('saveDirect', {
			authToken:commonTest.authToken,
			helixSchema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done, 'from test')
		});

	});

	testDescription = "should read matching data from Helix";
	it(testDescription, function(done) {
		var enhancedtestRecordData = testRecordData;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector.process('retrieveRecords', {
			authToken:commonTest.authToken,
			helixSchema: helixSchema,
			debug: false,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					done(err);
				}
				var first = isMatch(enhancedtestRecordData, result, commonTest.ignoreHelixId); //isMatch() ignores extra values in rightParm
				var second = isMatch(result, enhancedtestRecordData, commonTest.ignoreHelixId); //evaluate both directions means no extras

				if (first && second) {
					done()
				} else {
					done(new Error("Retrieved record does not match test record"));
				}
			}
		});

	});

});

