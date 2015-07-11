
var assert = require("assert")

var helixConnector = require('../helixConnector.js');
var config = require('../../config/qbook.js');
global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});

//new Date(year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]]);		

describe('Formats', function() {
	describe('Helix Date', function() {
		var testDate = new Date(

		'2015',
		'5', //I don't understand why I have to type '5' to get June in the date()
		'29', //however, when I don't specify the date, as in new Date(), it works correctly.
		'8',
		'38',
		'39'

		);

		it('should be formatted 6/29/15 08:38:39 AM', function() {
			assert.equal('06/29/15 08:38:39 AM', helixConnector.formatFunctions.helixDateTime(testDate));
		});

		describe('RefId', function() {
			it('should be 36 characters long', function() {
				assert.equal(36, helixConnector.formatFunctions.refId().length);
			});
		});

		describe('Helix Date Stamp', function() {
			it('should match mm/dd/yy hh:mm:ss (A|P)M', function() {
				assert.ok(helixConnector.formatFunctions.helixDateTimeNow().match(/^\d\d\/\d\d\/\d\d \d\d:\d\d:\d\d (A|P)M$/));
			});
		});
	});
});
