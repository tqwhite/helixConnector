#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const jwtDecode = require('jwt-decode');
const axios = require('axios');
const querystring = require('querystring');

const qt = require('qtools-functional-library');

const passport = require('passport');

const mutateReqObject = require('./lib/mutate-request-object');

//console.dir(qt.help());

//START OF moduleFunction() ============================================================

const moduleFunction = function({
	app,
	router,
	newConfig,
	helixConnectorPackage,
	hxClientSpecialAuthPath
}) {
	
	const moduleName = __filename
		.replace(__dirname + '/', '')
		.replace(/.js$/, '');
		
		if (!newConfig[moduleName]){
			qtools.logMilestone('External authorization is not enabled (no external-authorization section in systemParameters.ini)');
			return {install:()=>{}};
		}
	
	const localConfig = newConfig[moduleName] ? newConfig[moduleName] : {};
	const {
		isActive,
		verificationModuleName,
		useCredentialsForHelix
	} = localConfig;

	
	const askActiveDirectoryGen = require(`./lib/${verificationModuleName}`); //so far it's always, ask-active-directory

	const askActiveDirectory = askActiveDirectoryGen(newConfig[moduleName]);
	
	const install = () => {
		if (!isActive) {
			qtools.logMilestone(
				`systemParameters/external-authorization.is_active==false`
			);
			return { install: () => {} };
		}

		require('./lib/add-hx-client-special-auth-alt1')({
			router,
			app,
			helixConnectorPackage,
			hxClientSpecialAuthPath,
			localConfig,
			askActiveDirectory
		}); //add endpoint to route
		
		require('./lib/add-hx-api-auth')({
			app,
			localConfig,
			askActiveDirectory
		}); //adds middleware (app.use()) to app
	};
	
	return { install };
};

//END OF moduleFunction() ============================================================

module.exports = args => moduleFunction(args);
//moduleFunction().workingFunction().qtDump();

