var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');
var qtools = commonTest.qtools;

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_0-9]+)\.js/, '$1')

var testDescription;

var fieldSequenceList = [
	'textField01',
	'textField02',
	'textField03',
	'dateField01',
	'numField01',
	'fixedPointField01',
	'flagField01',
	'recNum'
];

var helixConnector1 = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies:commonTest.authGoodies
});

var helixConnector2 = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies:commonTest.authGoodies
});

describe('Multiple Pool Users (' + moduleFileName + ')', function() {

	commonTest.standardInit(helixConnector, before, after, this);

	var keyDataValue1 = 'hat';
	var keyDataValue2 = 'transistor';
	var dataRecs2 = [{
			textField01: keyDataValue2,
			textField02: 'capacitor',
			textField03: 'resistor'
		}, {
			textField01: keyDataValue2,
			textField02: 'garlic',
			textField03: 'marjoram'
		}

	];
	var dataRecs1 = [{
			textField01: keyDataValue1,
			textField02: 'necktie',
			textField03: 'shoe'
		}, {
			textField01: keyDataValue1,
			textField02: 'chimpanzee',
			textField03: 'lemur'
		}];

	var testData = [].concat(dataRecs1, dataRecs2);

	testDescription = "should write to test data with no errors"
	it(testDescription, function(done) {

		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: '_inertProcess',
			view: 'upTest1_Enter_SevenFields',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};
		helixConnector1.process('saveDirect', {
			helixSchema: helixSchema,
			debug: false,
			inData: testData,
			callback: commonTest.simpleCallback(done)
		});

	});

	//SET CRITERION ==============================================

	var testDescription = "set the criterion for first user without errors"
	it(testDescription, function(done) {
		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: '_inertProcess',
			view: 'upTest1_setCriterion_MatchTextField01',
			fieldSequenceList: [
				'textField01'
			],
			mapping: {}
		};
		helixConnector1.process('saveOne', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {
				textField01: keyDataValue1
			},
			callback: commonTest.simpleCallback(done)
		});

	});

	//SET CRITERION ==============================================

	var testDescription = "set the criterion for second user without errors"
	it(testDescription, function(done) {
		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: '_inertProcess',
			view: 'upTest1_setCriterion_MatchTextField01',
			fieldSequenceList: [
				'textField01'
			],
			mapping: {}
		};
		helixConnector2.process('saveOne', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {
				textField01: keyDataValue2
			},
			callback: commonTest.simpleCallback(done)
		});

	});

	//GET RESULT AND COMPARE =====================================

	testDescription = "get correct data according to the criterion for user number one ";
	it(testDescription, function(done) {
		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: 'upTest1',
			view: 'upTest1_RetrieveOnTextfield01',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};

		var enhancedtestRecordData = dataRecs1;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector1.process('retrieveRecords', {
			helixSchema: helixSchema,
			otherParms: {},
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

	//GET RESULT AND COMPARE =====================================

	testDescription = "get correct data according to the criterion for user number two ";
	it(testDescription, function(done) {

		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: 'upTest1',
			view: 'upTest1_RetrieveOnTextfield01',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};

		var enhancedtestRecordData = dataRecs2;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector2.process('retrieveRecords', {
			helixSchema: helixSchema,
			otherParms: {},
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

