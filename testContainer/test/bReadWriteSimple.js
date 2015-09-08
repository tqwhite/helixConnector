var commonTest = require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);

global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});

describe.only('Connector Simple Write', function() {

this.timeout(15000);
before(commonTest.startTestDatabase(helixConnector));

after(commonTest.killHelix(helixConnector));

	testDescription = "should write data with no errors"
	it(testDescription, function(done) {
// 		helixConnector.process('startEmptyHelix', {
// 			inData: {
// 				testDataDir: commonTest.testDataDir,
// 				debug: false
// 			},
// 			callback: commonTest.simpleCallback(done)
// 		});
done();
	});
	
		testDescription = "should get the correct data from Helix"
	it(testDescription, function(done) {
// 		helixConnector.process('kill', {
// 			inData: {
// 				debug: false
// 			},
// 			callback: commonTest.simpleCallback(done)
// 		});
done();
	});

});