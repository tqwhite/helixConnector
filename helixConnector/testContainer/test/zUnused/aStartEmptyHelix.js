var commonTest = require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);

global.systemProfile = config.getSystemProfile();

var helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});



describe.skip('Helix installation ('+moduleFileName+')', function() {
this.timeout(5000);
	testDescription = "should start with no errors"
	it(testDescription, function(done) {
		helixConnector.process('startEmptyHelix', {
			inData: {
				testDataDir: commonTest.testDataDir,
				debug: false
			},
			callback: commonTest.simpleCallback(done)
		});
	});
	
		testDescription = "should quit with no errors"
	it(testDescription, function(done) {
		helixConnector.process('kill', {
			inData: {
				debug: false
			},
			callback: commonTest.simpleCallback(done)
		});
	});

});

