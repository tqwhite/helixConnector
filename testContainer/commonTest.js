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
			otherParms: {
				testDataDir: projectDir + "/testData/",
				testCollectionFileName: "helixConnectTest02"
			},
			callback: simpleCallback(done),
			debug: false
		});
	};
};

var killHelix = function(helixConnector) {
	return function(done) {
		helixConnector.process('kill', {
			inData: {
				debug: false
			},
			callback: simpleCallback(done)
		});
	};
};

module.exports = {
	helixConnectorPath: codeDir + 'helixConnector.js',
	configPath: codeDir + '/../config/qbook.js',
	testDataDir: projectDir + "/testData/",
	simpleCallback: simpleCallback,
	testDbName: "helixConnectTest02",
	startTestDatabase: startTestDatabase,
	killHelix: killHelix
};


