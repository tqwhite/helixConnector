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

	var authGoodies={
		userId:'tq@justkidding.com',
		authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0cUBqdXN0a2lkZGluZy5jb20iLCJpbnN0YW5jZUlkIjoicWJvb2siLCJpYXQiOjE0NDgwODM4Mjl9.UiGrx-3E1k67B7e9QyRlIKVTmhyqzb5jc0_b3b_lJYU'
	};

	var startTestDatabase = function(helixConnector) {
		return function(done) {
			helixConnector.process('openTestDb', {
				helixSchema: {
		'emptyRecordsAllowed':true
		},
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
		ignoreHelixId: ignoreHelixId,
		authGoodies:authGoodies
	};
})();

