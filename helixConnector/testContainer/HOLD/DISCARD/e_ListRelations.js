var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_0-9]+)\.js/, '$1')

var testDescription;

var helixSchema = {
	'emptyRecordsAllowed':true,
	relation: 'simpleTest',
	view: 'simpleOne',
	fieldSequenceList: [
		'relationName'
	],
	mapping: {
	}
};

describe('Examine helix configuration (' + moduleFileName + ')', function() {
	helixConnector = new commonTest.helixConnector({
		helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies:commonTest.authGoodies
	});

	commonTest.standardInit(helixConnector, before, after, this);

	testDescription = "should get some relation names";
	it(testDescription, function(done) {

		helixConnector.process('listRelations', {
			schema: helixSchema,
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

