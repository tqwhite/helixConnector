var helixConnector = require('../../helixConnector.js');
var config = require('../../../config/qbook.js');
global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});


helixConnector.process('kill',
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
