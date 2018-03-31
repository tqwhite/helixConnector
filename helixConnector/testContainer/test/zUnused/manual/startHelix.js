var helixConnector = require('../../helixConnector.js');
var config = require('../../../configs/qbook.js');
global.systemProfile = config.getSystemProfile();

var helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});


var helixConnector.process('startHelix',
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
