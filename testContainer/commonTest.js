var fs = require('fs');


var realpath = function(filePath) {
	var result;
	try {
		result = fs.realpathSync(filePath);
	} catch (e) {
		//e.Error is "ENOENT, no such file or directory"
		result = "NO_SUCH_PATH_" + filePath;
		throw result;
	}
	return result;

}


var projectDir = realpath(process.env.helixConnectorProjectPath) + '/',
	codeDir = realpath(projectDir + "/helixConnector") + '/';

var simpleCallback = function(done) {
	return function(err, result, misc) {
		if (err) {
			console.log("\n======= FAILED SCRIPT\n\n" + misc.finalScript + "\n\n=======\n\n");
		}
		done(err)
	}
};

var startTestDatabase = function(helixConnector) {
	return function(done) {
		helixConnector.process('openTestDb', {
			helixSchema:{},
			otherParms: {
				testDataDir: projectDir + "/testData/",
				testCollectionFileName: "helixConnectTest02"
			},
			inData: {},
			callback: simpleCallback(done),
			debug: false
		});
	};
};

var killHelix = function(helixConnector) {
	return function(done) {
		helixConnector.process('kill', {
			helixSchema:{},
			otherParms: {},
			inData: {},
			debug: false,
			callback: simpleCallback(done)
		});
	};
};


var helixConnector = require(codeDir + 'helixConnector.js');
var config = require(codeDir + '/../config/qbook.js');
global.systemProfile = config.getSystemProfile();

module.exports = {
helixConnector:helixConnector,
config:config,
	
	testDataDir: projectDir + "/testData/",
	simpleCallback: simpleCallback,
	testDbName: "helixConnectTest02",
	startTestDatabase: startTestDatabase,
	killHelix: killHelix
};


