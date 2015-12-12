(function() {

	var fs = require('fs');
	var qtools = require('qtools'),
		qtools = new qtools(module);

	var request = require('request');

	var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

	var projectDir = qtools.realPath(process.env.helixProjectPath) + '/',
		codeDir = qtools.realPath(projectDir + "/helixConnector") + '/';

	var projectDir = qtools.realPath(process.env.helixProjectPath) + '/',
		helixConnectorPath = process.env.helixConnectorPath,
		helixConfigPath = process.env.helixConfigPath,
		helixConnector = require(helixConnectorPath + 'helixConnector.js'),
		config = require(helixConfigPath),
		systemProfile = config.getSystemProfile();

	global.systemProfile = systemProfile;

	var simpleCallback = function(done, evaluator) {
	
		if (typeof(evaluator)=='string'){
			var acceptableErrorStringFragment=evaluator;
			evaluator=function(){return;}
		}
	
		return function(error, response, body) {
			var outMessage;
			if (response && response.statusCode && response.statusCode != '200') {
			
				if (acceptableErrorStringFragment && body.toString().match(new RegExp(acceptableErrorStringFragment))){
					done();
					return;
				}
			
				outMessage = response.statusCode;
				if (body) {
					outMessage += " - " + body.toString();
				}
				done(new Error(outMessage));
				return;
			} if (acceptableErrorStringFragment &&response.statusCode && response.statusCode == '200') {
				done(new Error("An error ('"+acceptableErrorStringFragment+"') was called for but the request was successful ('200 Success' was received)"));
				return;
			}
			else {
			if (evaluator){
				done(evaluator(body));
				}
				else{
					done();
				}
			}

		}
	};

	var authGoodies = config.getAdminPagesAccessData();

	var helixConnector = new helixConnector({
		helixAccessParms: config.getHelixParms(),
		processIdentifier: 'helixAjax commonTest',
		authGoodies: authGoodies
	});

	var startTestDatabase = function(helixConnector) {
		return function(done) {
			helixConnector.process('openTestDb', {
				helixSchema: {'emptyRecordsAllowed':true},
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
				helixSchema: {'emptyRecordsAllowed':true},
				otherParms: {},
				inData: {},
				debug: false,
				callback: simpleCallback(done)
			});
		};
	};

	//refactored common utility functions =====================

	var standardInit = function(before, after, scope) {
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

		simpleCallback: simpleCallback,
		qtools: qtools,
		standardInit: standardInit,
		ignoreHelixId: ignoreHelixId,
		authGoodies: authGoodies,
		request: request,
		ajaxUri: 'http://localhost:9000/'
	};
})();


