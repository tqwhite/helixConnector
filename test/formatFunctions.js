var test = require('tape');

var helixConnector = require('../helixConnector.js');
var config = require('../../config/qbook.js');
global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});

test('connector formatFunctions', function(t) {
	var testDescription;
	t.plan();

	var testDate = new Date('2015', '5', '29', '8', '38', '39'); //I don't understand why I have to type '5' to get June in the date(), however, when I don't specify the date, as in new Date(), it works correctly.
	testDescription="conversion to Helix date"
	t.equal('06/29/15 08:38:39 AM', helixConnector.formatFunctions.helixDateTime(testDate), testDescription);
	
	testDescription="date stamp Helix format";
	t.ok(helixConnector.formatFunctions.helixDateTimeNow().match(/^\d\d\/\d\d\/\d\d \d\d:\d\d:\d\d (A|P)M$/), testDescription);

	testDescription="refId length";
	t.equal(36, helixConnector.formatFunctions.refId().length, testDescription);

	t.end();
});

