(function() {

	var fs = require('fs');
	var qtools = require('qtools'),
		qtools = new qtools(module);



	var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

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
			// 		if (err) {
			// 			console.log("\n======= FAILED SCRIPT =======\n\n");
			// 			qtools.dump({"err":err});
			// 			qtools.dump({"misc":misc});
			// 			console.log("\n======= FAILED SCRIPT =======\n\n");
			// 		}
			done(err)
		}
	};

	var startTestDatabase = function(helixConnector) {
		return function(done) {
			helixConnector.process('openTestDb', {
				helixSchema: {},
				otherParms: {
					testDataDir: projectDir + "/testData/",
					testCollectionFileName: "helixConnectTest06"
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
				helixSchema: {},
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


	//refactored common utility functions =====================

	var standardInit = function(helixConnector, before, after, scope) {
		scope.timeout(15000);
		before(startTestDatabase(helixConnector));
		after(killHelix(helixConnector));
	}

	var ignoreHelixId = function(leftParmValue, rightParmValue, inx) {

		if (inx === 'helixId') {
			return true;
		}

		if (leftParmValue === '' && rightParmValue === '') {
			return true;
		}
	}

	module.exports = {
		helixConnector: helixConnector,
		config: config,

		testDataDir: projectDir + "/testData/",
		simpleCallback: simpleCallback,
		testDbName: "helixConnectTest06",
		startTestDatabase: startTestDatabase,
		killHelix: killHelix,
		qtools: qtools,
		standardInit: standardInit,
		ignoreHelixId: ignoreHelixId
	};
})();





