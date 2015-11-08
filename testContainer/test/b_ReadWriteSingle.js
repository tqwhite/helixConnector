var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName=module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	processIdentifier:'b_ReadWriteSingle'
});

describe('Connector Write Single ('+moduleFileName+')', function() {

	this.timeout(15000);

		before(commonTest.startTestDatabase(helixConnector));
		after(commonTest.killHelix(helixConnector));


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
	var testRecordData = {
		textFieldOne: 'orange',
		textFieldTwo: 'blue'
	}


	testDescription = "should write data with no errors"
	it(testDescription, function(done) {
		helixConnector.process('saveOne', {
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

	testDescription = "should read matching data from Helix";
	it(testDescription, function(done) {
		var enhancedtestRecordData = testRecordData;
		enhancedtestRecordData.helixId = 0; //this comes from Helix always, can't control value
		helixConnector.process('retrieveRecords', {
			helixSchema: helixSchema,
			debug: false,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					done(err);
				}

				var first = isMatch(enhancedtestRecordData, result[0], ignoreHelixId); //isMatch() ignores extra values in rightParm
				var second = isMatch(result[0], enhancedtestRecordData, ignoreHelixId); //evaluate both directions means no extras

				if (first && second) {
					done()
				} else {
					done(new Error("Retrieved record does not match test record"));
				}
			}
		});

	});

}
);


