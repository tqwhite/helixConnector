(function() {
	var fs = require('fs');
	var qtools = require('qtools'),
		qtools = new qtools(module);   
	 
	if (!process.env.helixProjectPath) {
		var message = 'there must be an environment variable: helixProjectPath';
		qtools.logError(message);
		return message;
	}
	
	if (!process.env.USER && !process.env.HXCONNECTORUSER) {
		var message = 'there must be an environment variable: USER or HXCONNECTORUSER';
		qtools.logError(message);
		return message;
	}
	
	const hxConnectorUser=process.env.HXCONNECTORUSER || process.env.USER;
	
	var configPath =
		process.env.helixProjectPath +
		'configs/' +
		hxConnectorUser +
		'/systemParameters.ini';
	if (!qtools.realPath(configPath)) {
		var message = 'configuration file ' + configPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	var helixConnectorPath = process.env.helixConnectorPath + 'helixConnector.js';
	if (!qtools.realPath(helixConnectorPath)) {
		var message =
			'helixConnectorPath file ' + helixConnectorPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	
	
	const newConfig = qtools.configFileProcessor.getConfig(configPath);
	const collectionName = qtools.getSurePath(newConfig, 'system.collection');
	const schemaMapName=qtools.getSurePath(newConfig, 'system.schemaMapName') || collectionName;

	const schemaMapPath =
		process.env.helixProjectPath +
		'configs/' +
		hxConnectorUser + '/'+
		schemaMapName +
		'.json';
	if (!qtools.realPath(schemaMapPath)) {
		const message = 'system.collection.schemaMapPath: ' + schemaMapPath + ' is missing';
		qtools.logError(message);
		return message;
	}
	
	let schemaMap;
	const schemaMapJson = qtools.fs.readFileSync(schemaMapPath);
	try {
		schemaMap = JSON.parse(schemaMapJson);
	} catch (e) {
		console.log('failed to parse ' + schemaMap);
		throw 'schemaMap file failed to parse';
	}
	
	const helixConnectorGenerator = require(helixConnectorPath);
	const helixParms = qtools.getSurePath(newConfig, 'system');
	const authGoodies = qtools.getSurePath(newConfig, 'adminPagesAccessData');
	helixParms.schemaMap =
		schemaMap.schemaMap;        
	 var projectDir =
			qtools.realPath(process.env.helixProjectPath) + '/',
		codeDir = qtools.realPath(projectDir + '/helixConnector') + '/';

	var projectDir = qtools.realPath(process.env.helixProjectPath) + '/',
		helixConfigPath = process.env.helixConfigPath,
		config = require(helixConfigPath),
		systemProfile = config.getSystemProfile(); 
	 var simpleCallback = function(done, label) {
		return function(err, result, misc) {
			if (label) {
				console.log('label=' + label);

				qtools.dump({ err: err });
				qtools.dump({ result: result });
			} 
			 done(err);
		};
	};
	
	var startTestDatabase = function(helixConnector) {
		return function(done) {
			helixConnector.process('openTestDb', {
				helixSchema: {
					emptyRecordsAllowed: true
				},
				otherParms: {
					testDataDir: projectDir + '/testData/',
					testCollectionFileName: collectionName
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
					emptyRecordsAllowed: true
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
	};

	var ignoreHelixId = function(leftParmValue, rightParmValue, inx) {
		if (inx === 'helixId') {
			return true;
		}

		if (
			(typeof leftParmValue || leftParmValue === '') &&
			(typeof rightParmValue || rightParmValue === '')
		) {
			return true;
		}
	};

	module.exports = {
		helixConnector: helixConnectorGenerator,
		config: {
			getHelixParms: () => {
				return helixParms; //qbook.js had this accessor
			}
		},
		testDataDir: projectDir + '/testData/',
		simpleCallback: simpleCallback,
		testDbName: collectionName,
		startTestDatabase: startTestDatabase,
		killHelix: killHelix,
		qtools: qtools,
		standardInit: standardInit,
		ignoreHelixId: ignoreHelixId,
		authGoodies: authGoodies
	};
})();

