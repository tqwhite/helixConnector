var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName=module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

var qtools = commonTest.qtools;

var keyDataValue = 'oregano';
var fieldSequenceList = [
	'textField01',
	'textField02',
	'textField03'
];

var matchRecordData = [{
		textField01: keyDataValue,
		textField02: 'cat',
		textField03: 'lemur'
	}, {
		textField01: keyDataValue,
		textField02: 'garlic',
		textField03: 'marjoram'
	}];

var testRecordData = qtools.clone(matchRecordData);
testRecordData.push([{
		textField01: 'marjoram',
		textField02: 'garlic',
		textField03: 'marjoram'
	}
]);

describe('User Pool System ('+moduleFileName+')', function() {

	this.timeout(15000);

	before(commonTest.startTestDatabase(helixConnector));
	after(commonTest.killHelix(helixConnector));

	var testDescription = "should write to _inertProcess/upTest1_Enter_AllFields"
	it(testDescription, function(done) {

		var helixSchema = {
			relation: '_inertProcess',
			view: 'upTest1_Enter_AllFields',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};
		helixConnector.process('saveDirect', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done, 'from test')
		});

	});

	//SET CRITERION ==============================================

	var testDescription = "should set the criterion without errors"
	it(testDescription, function(done) {
		var helixSchema = {
			relation: '_inertProcess',
			view: 'upTest1_setCriterion_MatchTextField01',
			fieldSequenceList: [
				'textField01'
			],
			mapping: {}
		};
		helixConnector.process('saveOne', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {
				textField01: keyDataValue
			},
			callback: commonTest.simpleCallback(done, 'from test')
		});

	});

	//GET RESULT AND COMPARE =====================================

	var referenceData = matchRecordData

	var ignoreHelixId = function(leftParmValue, rightParmValue, inx) {
		if (inx === 'helixId') {
			return true;
		}
	}

	testDescription = "should get matching data from corresponding table (upTest1/upTest1_RetrieveOnTextfield01)";
	it(testDescription, function(done) {

		var helixSchema = {
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
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					done(err);
				}

				var first = isMatch(enhancedtestRecordData, result, ignoreHelixId); //isMatch() ignores extra values in rightParm
				var second = isMatch(result, enhancedtestRecordData, ignoreHelixId); //evaluate both directions means no extras

				if (first && second) {
					done()
				} else {
					done(new Error("Retrieved record does not match test record"));
				}
			}
		});

	});

});

