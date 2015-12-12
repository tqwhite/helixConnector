(function() {

	var fs = require('fs');
	var qtools = require('qtools'),
		qtools = new qtools(module);

	var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

	var projectDir = qtools.realPath(process.env.helixProjectPath) + '/',
		codeDir = qtools.realPath(projectDir + "/helixConnector") + '/';

	var projectDir = qtools.realPath(process.env.helixProjectPath) + '/',
		helixConnectorPath=process.env.helixConnectorPath,
		helixConfigPath=process.env.helixConfigPath,
		helixConnector = require(helixConnectorPath + 'helixConnector.js'),
		config = require(helixConfigPath),
		systemProfile = config.getSystemProfile(),
		helixConnector = require(helixConnectorPath + 'helixConnector.js');

		global.systemProfile = systemProfile;

	var simpleCallback = function(done, label) {
		return function(err, result, misc) {
if (label){
console.log("label="+label);


qtools.dump({"err":err});
qtools.dump({"result":result});
}



			done(err)
		}
	};

	var authGoodies=config.getAdminPagesAccessData();

	var startTestDatabase = function(helixConnector) {
		return function(done) {
			helixConnector.process('openTestDb', {
				helixSchema: {
		'emptyRecordsAllowed':true
		},
				otherParms: {
					testDataDir: projectDir + "/testData/",
					testCollectionFileName: "helixConnectTest11"
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
				helixSchema: {
		'emptyRecordsAllowed':true
		},
				otherParms: {},
				inData: {},
				debug: false,
				callback: simpleCallback(done)
			});
		};
	};

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

		if ((typeof(leftParmValue) || leftParmValue === '') && (typeof(rightParmValue) || rightParmValue === '')) {
			return true;
		}
	}

	module.exports = {
		helixConnector: helixConnector,
		config: config,

		testDataDir: projectDir + "/testData/",
		simpleCallback: simpleCallback,
		testDbName: "helixConnectTest11",
		startTestDatabase: startTestDatabase,
		killHelix: killHelix,
		qtools: qtools,
		standardInit: standardInit,
		ignoreHelixId: ignoreHelixId,
		authGoodies:authGoodies
	};
})();

