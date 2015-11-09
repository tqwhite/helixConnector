var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

describe('Lease Pool User base function (' + moduleFileName + ')', function() {

	commonTest.standardInit(helixConnector, before, after, this);

	var helixSchema = {
		relation: '',
		view: '',
		fieldSequenceList: [
			'leaseUserName'
		],
		mapping: {}
	};

	testDescription = "should return a pool user name"
	it(testDescription, function(done) {
		helixConnector.process('poolUserLease', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {},
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

