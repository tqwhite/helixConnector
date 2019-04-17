var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_0-9]+)\.js/, '$1')

var testDescription;
var qtools = commonTest.qtools;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies:commonTest.authGoodies
});

/*
/lib/getViewDetails.applescript does not produce any output even though it 
works correctly in script debugger. 
*/

describe.skip('View Details (' + moduleFileName + ')', function() {

//	commonTest.standardInit(helixConnector, before, after, this);

	var token;
	var userId = 'tq@justkidding.com';

	testDescription = "should generate a token"
	it(testDescription, function(done) {
		helixConnector.getViewDetails(userId, {relation:'_inertProcess', view:'upTest1_Enter_SevenFields', callback:function(err, result, misc) {
			done();
		}});

	});

});


