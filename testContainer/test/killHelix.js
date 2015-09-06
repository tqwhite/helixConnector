var commonTest=require('../commonTest.js');
var assert = require("assert");

var helixConnector = require(commonTest.helixConnectorPath);
var config = require(commonTest.configPath);

global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});



describe('killFile', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});