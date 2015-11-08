var commonTest = require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);

global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});



describe.skip('start helix test database ('+moduleFileName+')', function() {
	this.timeout(15000);
	testDescription = "opening file: "+commonTest.testDbName
	it(testDescription, function(done) {
		helixConnector.process('openTestDb', {
			inData: {
				testDataDir: commonTest.testDataDir,
				testCollectionFileName:commonTest.testDbName,
				debug: false
			},
			callback: commonTest.simpleCallback(done)
		});
	});

});

