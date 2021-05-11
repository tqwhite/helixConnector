var commonTest=require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);

/*

Changed configuration strategy to use .ini.
got rid of all this getSystemProfile() nonsense
this directory of unused stuff wasn't worth converting
since it's unused.

If it is ever needed, realize that it's going to be hard.

tqii, 3/30/18


**/





global.systemProfile = config.getSystemProfile();

var helixConnector = new helixConnector({
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