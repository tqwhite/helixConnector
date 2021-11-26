#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const jwtDecode = require('jwt-decode');
const axios = require('axios');
const querystring = require('querystring');

const mutateReqObject = require('./mutate-request-object');

const qt = require('qtools-functional-library');
//console.dir(qt.help());

//START OF moduleFunction() ============================================================

const moduleFunction = function(args = {}) {

	const moduleName = __filename
		.replace(__dirname + '/', '')
		.replace(/.js$/, '');
	
	const localConfig = args[moduleName];

	const {
		TENANT_ID,
		CLIENT_ID,
		CLIENT_SECRET,
		AAD_ENDPOINT,
		GRAPH_ENDPOINT,
		accountGroupSuffix
	} = localConfig;

	const verifyUser = (username, password, callback) => {
		username=`${username}${accountGroupSuffix}`;
		qtools.logMilestone(`attempt askActiveDirectory.verifyUser: ${username}`);
		const url = `${AAD_ENDPOINT}/${TENANT_ID}//oauth2/v2.0/token`;
		const workingUser = {
			client_id: CLIENT_ID,
			scope: 'openid profile offline_access',
			username,
			password,
			grant_type: 'password',
			client_secret: CLIENT_SECRET
		};
		axios
			.post(url, querystring.stringify(workingUser), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
			.then(function(adResponse) {
				

				const accessToken = adResponse.data.access_token;
				const tmp = jwtDecode(accessToken);
				qtools.logMilestone(`AD LOGIN SUCCESS:       ${tmp.unique_name}      `);
				return callback('', adResponse.data);
			})
			.catch(function(error) {
				const message=error.qtGetSurePath('response.data.error_description', 'active directory authentication error').replace(/\r?\n|\r/g, '; '); //stupid microsoft line endings
				qtools.logMilestone(`AD LOGIN FAIL: ${workingUser.username} ${message}`);
				return callback(message);
			});
	};

	return { verifyUser };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//moduleFunction().workingFunction().qtDump();

