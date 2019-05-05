var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_0-9]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies:commonTest.authGoodies
});

var qtools = commonTest.qtools;

var keyDataValue = 'oregano';
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
var matchRecordData = [{
	textField01:keyDataValue,
	textField02:'cat',
	textField03:'lemur',
	numField01:'',
	dateField01:'',
	fixedPointField01:'',
	flagField01:'',
	recNum:'10'
	}, {
	textField01:keyDataValue,
	textField02:'garlic',
	textField03:'marjoram',
	numField01:'',
	dateField01:'',
	fixedPointField01:'',
	flagField01:'',
	recNum:'11'
	}];

var testRecordData = qtools.clone(matchRecordData);
testRecordData.push({
	textField01:'marjoram',
	textField02:'garlic',
	textField03:'marjoram',
	numField01:'',
	dateField01:'',
	fixedPointField01:'',
	flagField01:'',
	recNum:''
	}
);

describe('User Pool System (' + moduleFileName + ')', function() {

	commonTest.standardInit(helixConnector, before, after, this);

	var testDescription = "should write to _inertProcess/upTest1_Enter_SevenFields"
	it(testDescription, function(done) {

		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: '_inertProcess',
			view: 'upTest1_Enter_SevenFields',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};
		helixConnector.process('saveOneWithProcess', {
			schema: helixSchema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done)
		});

	});

	//SET CRITERION ==============================================

	var testDescription = "should set the criterion without errors"
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
		helixConnector.process('saveOne', {
			schema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {
				textField01: keyDataValue
			},
			callback: commonTest.simpleCallback(done)
		});

	});

	//GET RESULT AND COMPARE =====================================

	var referenceData = matchRecordData;
	
	testDescription = "should get matching data from corresponding table (upTest1/upTest1_RetrieveOnTextfield01)";
	it(testDescription, function(done) {

		var helixSchema = {
			'emptyRecordsAllowed':true,
			relation: 'upTest1',
			view: 'upTest1_RetrieveOnTextfield01',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};

		var enhancedtestRecordData = referenceData;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector.process('retrieveRecords', {
			schema: helixSchema,
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

