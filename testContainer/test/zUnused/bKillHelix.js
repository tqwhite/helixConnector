var commonTest=require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);

global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});



describe.skip('Quit Helix ('+moduleFileName+')', function() {

	testDescription = "quit with no errors"
	it(testDescription, function(done) {
		helixConnector.process('kill', {
			inData: {
				debug: false
			},
			callback: commonTest.simpleCallback(done)
		});
	});

});