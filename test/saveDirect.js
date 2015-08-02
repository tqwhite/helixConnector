var test = require('tape');

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




test('Helix saveDirect()', function(t) {
	var testDescription;
	t.plan();
	
		var testResult = helixConnector.makeDataString(helixSchema.fieldSequenceList, helixSchema.mapping, {
		scanCode: '9999',
		quantity: 99,
		type: 'a'
	});
	
var helixTestPath='/Users/tqwhite/Documents/webdev/helixConnector/project/testData/testDbOne';
	testDescription="makeDataString() tabbed Helix send format"
	t.ok(testResult.match(/^\d\d\/\d\d\/\d\d \d\d:\d\d:\d\d (A|P)M\t\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/), testDescription);
	
	testDescription="process('save') has no error"
	t.ok(function(done) {
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
	}, testDescription);

	t.end();
});

