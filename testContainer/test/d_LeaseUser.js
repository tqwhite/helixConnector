var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

describe('Lease Pool User', function() {

	this.timeout(15000);

	before(commonTest.startTestDatabase(helixConnector));
	after(commonTest.killHelix(helixConnector));


	var helixSchema = {
		relation: 'simpleTest',
		view: 'simpleOne',
		fieldSequenceList: [
			'leaseUserName'
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


	testDescription = "should return a pool user name"
	it(testDescription, function(done) {
		helixConnector.process('poolUserLease', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: function(err, result, misc) {
				if (err) {
					done(err);
				}
				if (typeof (result[0].leaseUserName) == 'string') {
					done()
				} else {
					done(new Error("leaseUserName was not found"));
				}
			}
		});

	});

});


