#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const qt = require('qtools-functional-library');
const fs = require('fs');
const path = require('path');

const sendToHelixGen = require('./lib/send-to-helix');
const retrieveFromHelixGen = require('./lib/retrieve-from-helix');

const asynchronousPipePlus = new require('qtools-asynchronous-pipe-plus')();
const pipeRunner = asynchronousPipePlus.pipeRunner;
const taskListPlus = asynchronousPipePlus.taskListPlus;

//START OF moduleFunction() ============================================================

const moduleFunction = function({
	router,
	app,
	helixConnectorPackage,
	hxClientSpecialAuthPath,
	localConfig,
	askActiveDirectory
}) {
	
	//GET ENDPOINT DEFINITIONS ============================================================

	const endpointDirPath = path.join(__dirname, 'assets/hxAccessEndpoints/');

	const schemas = {
		clearTempPassword: JSON.parse(
			fs
				.readFileSync(path.join(endpointDirPath, 'clearTempPassword.json'))
				.toString()
		).clearTempPassword,
		getPassword: JSON.parse(
			fs.readFileSync(path.join(endpointDirPath, 'getPassword.json')).toString()
		).getPassword,
		loginSimulator: JSON.parse(
			fs
				.readFileSync(path.join(endpointDirPath, 'loginSimulator.json'))
				.toString()
		).loginSimulator,
		setAuthorizedUserCriterion: JSON.parse(
			fs
				.readFileSync(
					path.join(endpointDirPath, 'setAuthorizedUserCriterion.json')
				)
				.toString()
		).setAuthorizedUserCriterion,
		setLoginResult: JSON.parse(
			fs
				.readFileSync(path.join(endpointDirPath, 'setLoginResult.json'))
				.toString()
		).setLoginResult,
		testCriterion: JSON.parse(
			fs
				.readFileSync(path.join(endpointDirPath, 'testCriterion.json'))
				.toString()
		).testCriterion,
		testSchema: JSON.parse(
			fs.readFileSync(path.join(endpointDirPath, 'testSchema.json')).toString()
		).testSchema
	};

	
	//GENERATE TASKLIST ============================================================
	
	const taskList = new taskListPlus();
	
// 	taskList.push((args, next) => {
// 		const schemaName = 'loginSimulator';
// 
// 		const localCallback = (err, result) => {
// 			args.results[schemaName] = result;
// 			next(err, args);
// 		};
// 
// 		const { schemas, sendToHelix, hxAuthUserName } = args;
// 		const schema = schemas[schemaName];
// 		//const postData = { user: hxAuthUserName, password: 'shairWord!0' };
// 		const postData = { user: hxAuthUserName, password: 'shairWord!0' };
// 		sendToHelix.process({ postData, schema, callback: localCallback });
// 	});
	
	taskList.push((args, next) => {
		const schemaName = 'setLoginResult';

		const localCallback = (err, result) => {
			args.results[schemaName] = result;
			next(err, args);
		};

		const { schemas, sendToHelix, hxAuthUserName, externalAuthResult } = args;
		const schema = schemas[schemaName];
		const postData = {
			user: hxAuthUserName,
			['i auth']: false,
			_statusMessage: 'processing through active directory'
		};
		sendToHelix.process({ postData, schema, callback: localCallback });
	});
	
	taskList.push((args, next) => {
		const schemaName = 'getPassword';

		const localCallback = (err, result) => {
			args.results[schemaName] = result;
			args.hxAuthPassword = result.qtGetSurePath('[0]._authPassword');
			next(err, args);
		};

		const { schemas, retrieveFromHelix, hxAuthUserName } = args;
		const schema = schemas[schemaName];
		retrieveFromHelix.process({
			criterionData: { user: hxAuthUserName },
			schema,
			callback: localCallback
		});
	});
	
	taskList.push((args, next) => {
		const schemaName = 'clearTempPassword';

		const localCallback = (err, result) => {
			args.results[schemaName] = result;
			next(err, args);
		};

		const { schemas, sendToHelix, hxAuthUserName } = args;
		const schema = schemas[schemaName];
		const postData = { user: hxAuthUserName };
		sendToHelix.process({ postData, schema, callback: localCallback });
	});
	
	taskList.push((args, next) => {
		const thisStepIs = 'askActiveDirectory';

		const localCallback = (err, result) => {
			if (!err) {
				args.externalAuthResult = {validLogin:true, message:'Valid Login'};
				args.results.externalAuthResult =
					result.qtGetSurePath('token_type') == 'Bearer';
			}
			else{
				args.externalAuthResult = {validLogin:false, message:'Login Failed'};
			}
			next('', args);
		};

		const { schemas, sendToHelix, hxAuthUserName, hxAuthPassword } = args;
		askActiveDirectory.verifyUser(
			hxAuthUserName,
			hxAuthPassword,
			localCallback
		);
	});
	
	taskList.push((args, next) => {
		const schemaName = 'setLoginResult';

		const localCallback = (err, result) => {
			args.results[schemaName] = result;
			next(err, args);
		};

		const { schemas, sendToHelix, hxAuthUserName, externalAuthResult } = args;
		const schema = schemas[schemaName];
		const postData = {
			user: hxAuthUserName,
			['i auth']: externalAuthResult.validLogin,
			_statusMessage: `${externalAuthResult.validLogin ? 'Valid Login' : 'Login Failed'}`
		};
		sendToHelix.process({ postData, schema, callback: localCallback });
	});
	
	//execution function ------------------------------------------------------------
	
	const executeActual = inData => (req, res, next) => {
		const { helixConnectorPackage, retrieveFromHelixGen } = inData;
		const { fabricateConnector } = helixConnectorPackage;

		const retrieveFromHelix = retrieveFromHelixGen({
			fabricateConnector,
			req,
			res
		});

		const sendToHelix = sendToHelixGen({ fabricateConnector, req, res });

		delete inData.retrieveFromHelixGen; //not used inside tasklist
		delete inData.fabricateConnector; //not used inside tasklist

		const hxAuthUserName = req.query.hxAuthUserName;

		const initialData = {
			...inData,
			req,
			res,
			retrieveFromHelix,
			sendToHelix,
			hxAuthUserName,
			results: {}
		};

		pipeRunner(taskList.getList(), initialData, (err, args) => {
			const { req, res, helixConnectorPackage, hxAuthUserName } = args;

			const { send500, sendResult, helixConnector } = helixConnectorPackage;

			if (err) {
				console.log(`hxClientAuth failed for ${hxAuthUserName}`);
				send500(res, req, err);
				return;
			}

			//sendResult(res, req, next, helixConnector)(JSON.stringify(args.getPassword));
			console.log(`hxClientAuth successful for ${hxAuthUserName}`);
			res.send(`hxClientAuth successful for ${hxAuthUserName}`);
			//res.send(args.results);
			//note to self: next() does not belong here because this is the end of the response chain.
		});
	};
	
	//ADD PROCESS TO THE ROUTE ============================================================
	

	router.get(new RegExp(hxClientSpecialAuthPath), (req, res, next) => {
		const execute = executeActual({
			helixConnectorPackage,
			schemas,
			retrieveFromHelixGen
		});
		execute(req, res, next);
	});
	
	qtools.logMilestone(
		`added endpoint hxClientSpecialAuthPath=${hxClientSpecialAuthPath} to route`
	);
	
	
};

//END OF moduleFunction() ============================================================

module.exports = args => new moduleFunction(args);
//module.exports = moduleFunction;
//module.exports = new moduleFunction();
//moduleFunction().workingFunction().qtDump();

