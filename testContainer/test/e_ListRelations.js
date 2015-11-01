var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var helixSchema = {
	relation: 'simpleTest',
	view: 'simpleOne',
	fieldSequenceList: [
		'relationName'
	],
	mapping: {
	}
};

describe('Examine helix configuration', function() {
	helixConnector = new commonTest.helixConnector({
		helixAccessParms: commonTest.config.getHelixParms()
	});

	this.timeout(15000);

	before(commonTest.startTestDatabase(helixConnector));
	after(commonTest.killHelix(helixConnector));

	testDescription = "get some relation names";
	it(testDescription, function(done) {

		helixConnector.process('listRelations', {
			helixSchema: helixSchema,
			debug: false,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					done(err);
				}

				if (result.length < 1) {
					done(new Error("No relations were retrieved from database"));
				} else {
					done();
				}
			}
		});

	});

});



