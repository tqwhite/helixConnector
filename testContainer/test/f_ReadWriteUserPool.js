var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

	var testRecordData = [{
			textField01: 'dog',
			textField02: 'cat',
			textField03: 'lemur'
		}, {
			textField01: 'oregano',
			textField02: 'garlic',
			textField03: 'marjoram'
		}];

describe('User Pool System', function() {

	this.timeout(15000);

before(commonTest.startTestDatabase(helixConnector));
after(commonTest.killHelix(helixConnector));



	testDescription = "should write to _inertProcess/upTest1_Enter_AllFields"
	it(testDescription, function(done) {
	
	
	var helixSchema = {
		relation: '_inertProcess',
		view: 'upTest1_Enter_AllFields',
		fieldSequenceList: [
			'textField01',
			'textField02',
			'textField03'
		],
		mapping: {}
	};
		helixConnector.process('saveDirect', {
			helixSchema: helixSchema,
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done, 'from test')
		});


	});

	var ignoreHelixId = function(leftParmValue, rightParmValue, inx) {
		if (inx === 'helixId') {
			return true;
		}
	}

	testDescription = "should get matching data from corresponding table (upTest1/upTest1_Retrieve_ThreeFields_ForUser)";
	it(testDescription, function(done) {
	
	var helixSchema = {
		relation: 'upTest1',
		view: 'upTest1_Retrieve_ThreeFields_ForUser',
		fieldSequenceList: [
			'textField01',
			'textField02',
			'textField03'
		],
		mapping: {}
	};


		var enhancedtestRecordData = testRecordData;
		enhancedtestRecordData.map(function(item) {
			item.helixId = 0; //this comes from Helix always, can't control value
		});

		helixConnector.process('retrieveRecords', {
			helixSchema: helixSchema,
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



