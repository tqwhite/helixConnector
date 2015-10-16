var commonTest=require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);



global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});

/* HAS BEEN CONVERTED TO MOCHA BUT DOESNT WORK */

describe('Connector Internal Data Manipulation', function() {
  	var testDescription;
	var testDate = new Date('2015', '5', '29', '8', '38', '39'); //I don't understand why I have to type '5' to get June in the date(), however, when I don't specify the date, as in new Date(), it works correctly.

	testDescription="should correctly reformat a JS time into Helix time stamp"
    it(testDescription, function () {
	assert.equal('06/29/15 08:38:39 AM', helixConnector.formatFunctions.helixDateTime(testDate));
    });

	testDescription="should correctly generate a Helix time stamp for now"
    it(testDescription, function () {
	assert.ok(helixConnector.formatFunctions.helixDateTimeNow().match(/^\d\d\/\d\d\/\d\d \d\d:\d\d:\d\d (A|P)M$/));
    });

	testDescription="should generate a refId of the correct length"
    it(testDescription, function () {
	assert.equal(36, helixConnector.formatFunctions.refId().length);
    });
});