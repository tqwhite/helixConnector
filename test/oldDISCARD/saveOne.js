
var assert = require("assert")

var helixConnector = require('../helixConnector.js');
var config = require('../../config/qbook.js');
global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});

var helixSchema = {
	relation: 'mainTest',
	view: 'viewOne',
	fieldSequenceList: [
		// 					'scanCode',
		// 					'quantity',
		// 					'type',
		'createDateTime',
		//					'terminalId',
		'refId'
	],
	mapping: {
		terminalId: function() {
			return 'saveOne.js';
		},
		refId: 'refId',
		createDateTime: 'helixDateTimeNow'
	}
};



describe('helixConnector.process(save)', function() {
	var testResult = helixConnector.makeDataString(helixSchema.fieldSequenceList, helixSchema.mapping, {
		scanCode: '9999',
		quantity: 99,
		type: 'a'
	});
	
var helixTestPath='/Users/tqwhite/Documents/webdev/helixConnector/project/testData/testDbOne';
	
	
	it('makeDataString() should match format', function() {
		assert.ok(testResult.match(/^\d\d\/\d\d\/\d\d \d\d:\d\d:\d\d (A|P)M\t\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/));
	});
	
	it('process(save) produces no error', function(done) {
		helixConnector.process('save',
		{

			queryParms: helixSchema,
			inData: {
				scanCode: '9999',
				quantity: 99,
				type: 'a'
			},
			callback: function(err, data) {
				done(err);
			}
		}
		);
	});
});


describe('LEGACY helixConnector.save()', function() {
	it('should save without error', function(done) {
		helixConnector.save(helixSchema, {
			scanCode: '9999',
			quantity: 99,
			type: 'a'
		}, function(err, data) {
			done(err);
		});
	});
});



