var helixConnector = require('../../helixConnector.js');
var config = require('../../../config/qbook.js');
global.systemProfile = config.getSystemProfile();

var helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});


var helixConnector.process('kill',
{
	callback: function(err, data) {

		console.dir({
			"err": err
		});
		console.dir({
			"data": data
		});

	}
}
);