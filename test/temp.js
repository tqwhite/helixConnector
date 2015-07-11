
var assert = require("assert");

global.systemProfile = {};
global.systemProfile.exposeTests = true;

var helixConnector = require('/Users/tqwhite/Documents/webdev/helixConnector/project/helixConnector/helixConnector.js');

helixConnector = new helixConnector({
	helixAccessParms: {

		applicationName: 'Helix RADE',
		collection: 'testDbOne',
		user: 'mainUserOne',
		password: ''
	}
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


var runTest=function(done){
helixConnector.save(helixSchema, {
	scanCode: '9999',
	quantity: 99,
	type: 'a'
}, function(err, data) {

done(err)


});
}

describe.skip('User', function() {
  describe('#save()', function() {
    it('should save without error', runTest);
  });
});

