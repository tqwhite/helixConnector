
var assert = require("assert")

var helixConnector=require('../helixConnector.js');
var config=require('../../config/qbook.js');

helixConnector=new helixConnector({helixAccessParms:config.getHelixParms()});
		
//new Date(year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]]);		

describe('Date', function() {
  describe('format()', function () {
  	var testDate=new Date(
      
      '2015',
      '5', //I don't understand why I have to type '5' to get June in the date()
      '29',
      '8',
      '38',
      '39'
      
      );

    it('should be formatted 6/29/15 08:38:39 AM', function () {
      assert.equal('06/29/15 08:38:39 AM', helixConnector.helixDateTime(testDate));
    });
  });
});