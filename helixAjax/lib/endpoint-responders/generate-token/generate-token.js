#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');
//START OF moduleFunction() ============================================================

const moduleFunction = function(args = {}) {
	const {
		getSchema,
		helixParms,
		fabricateConnector,
		sendResult,
		send500,
		newConfig
	} = args;
	
	
	
	const responder = (req, res, next) => {
		


		var userId = req.body.userId;

		const privilegedHosts = qtools.convertNumericObjectToArray(
			qtools.getSurePath(newConfig, 'system.privilegedHosts', [])
		);
				if (!privilegedHosts.includes(req.ip)) {
					qtools.logWarn(`generateTokenRequest made from unauthorized '${req.ip}'`);
					res.status('401').send(`request made from unauthorized host '${req.ip}'`);
					return;
				}

		if (!userId) {
			res.status('400').send('userId must be specified');
			return;
		}  
		 var helixConnector = fabricateConnector(
			req,
			res,
			{
				emptyRecordsAllowed: true,
				note:"this is a placeholder; token generator ignores this but the process on the way needs to know that an empty payload (emptyRecordsAllowed) is valid"
			},
			true //bootstrap parameter relaxes security to 1) decodable token (perhaps expired) and 2) from a truted (by systemParameters.ini/privilegedHosts)
		);  

		 helixConnector.generateAuthToken(req.body, function(
			err,
			result
		) {
			if (err) {
				res.status('401').send({
					message: err
				});
			} else {
				res.status('200').send({
					userId: userId,
					authToken: result,
					instanceId: helixParms.instanceId
				});
			}
		});
	};

	return { responder };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();
//moduleFunction().workingFunction().qtDump();

