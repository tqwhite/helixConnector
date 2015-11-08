var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

var qtools = commonTest.qtools;

var setCriterion = function(viewName, criterion) {

	return function(done) {
		var helixSchema = {
			relation: '_inertProcess',
			view: viewName,
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
				textField01: criterion
			},
			callback: commonTest.simpleCallback(done, 'from test')
		});

	};
};

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
testRecordData.push({
	textField01: 'marjoram',
	textField02: 'garlic',
	textField03: 'marjoram'
}
);

describe('Retrieve with single pass criterion (' + moduleFileName + ')', function() {

	this.timeout(15000);

	before(commonTest.startTestDatabase(helixConnector));
	after(commonTest.killHelix(helixConnector));

	var testDescription = "should write to _inertProcess/upTest1_Enter_AllFields"
	it(testDescription, function(done) {

		var savingSchema = {
			relation: '_inertProcess',
			view: 'upTest1_Enter_AllFields',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};
		helixConnector.process('saveDirect', {
			helixSchema: savingSchema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done, 'from test')
		});

	});

	//GET RESULT AND COMPARE =====================================


	var ignoreHelixId = function(leftParmValue, rightParmValue, inx) {
		if (inx === 'helixId') {
			return true;
		}
	}

	testDescription = "should retrieve all of the data sent";
	it(testDescription, function(done) {
		var referenceData = testRecordData

		var retrievalSchema = {
			relation: 'upTest1',
			view: 'upTest1_RetrieveAll',
			fieldSequenceList: fieldSequenceList,
			mapping: {}
		};

		var enhancedtestRecordData = referenceData;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector.process('retrieveRecords', {
			helixSchema: retrievalSchema,
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


	testDescription = "should get only data restricted by the criterion";
	it(testDescription, function(done) {
		var referenceData = matchRecordData

		var criterionFieldSequenceList = ['textField01'];
		var criterion = {
			textField01: keyDataValue
		};

		var retrievalSchema = {
			relation: 'upTest1',
			view: 'upTest1_RetrieveOnTextfield01',
			fieldSequenceList: fieldSequenceList,
			mapping: {},
			criterion: {
				relation: '_inertProcess',
				view: 'upTest1_setCriterion_MatchTextField01',
				fieldSequenceList: criterionFieldSequenceList
			}
		};

		var enhancedtestRecordData = referenceData;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector.process('retrieveRecords', {
			helixSchema: retrievalSchema,
			otherParms: {},
			debug: false,
			inData: {},
			criterion: {
				data: criterion
			},
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



