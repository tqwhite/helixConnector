#!/usr/bin/env node
'use strict';

const qt = require('qtools-functional-library');

const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const jwt = require('jsonwebtoken');

//START OF moduleFunction() ============================================================

const moduleFunction = function(args = {}) {
	const { authKey, instanceId, req, suppressTokenSecurityFeatures=false } = args;
	const {ip:requestingIpAddress}=req;
	
	const generateAuthTokenActual = ({ authKey, instanceId }) => (
		{ userId, allowedRequestIpAddress, accessExpirationDate },
		callback
	) => {
		const token = jwt.sign(
			{
				userId,
				allowedRequestIpAddress,
				accessExpirationDate,
				instanceId: instanceId
			},
			authKey
		);
		callback('', token);
	};
	
	const validateUserTokenActual = ({ authKey, instanceId }) => apiAccessAuthParms => {
		const { userId, authToken } = apiAccessAuthParms;


		let decoded;
		try {
			decoded = jwt.verify(authToken, authKey);
		} catch (e) {
			return e.toString();
		}
		

		if (!suppressTokenSecurityFeatures && !decoded.allowedRequestIpAddress && !decoded.accessExpirationDate) {
			qtools.logMilestone(`invalid token missing both allowedRequestIpAddress  and accessExpirationDate for ${userId} (Q52620214137441374680)`);
			return 'authentication error Q52620214137441374680';
		}

		
		if (decoded.instanceId != instanceId) {
			qtools.logMilestone(`failed authentication requesting instanceId ${decoded.instanceId} does not match ${instanceId} for ${userId} (Q52620214124041240786)`);
			return 'authentication error Q52620214124041240786';
		}
		
		if (decoded.userId != userId) {
			qtools.logMilestone(`failed authentication token userId ${decoded.userId} does not match supplied ${userId} for ${userId} (Q52620214125341253487)`);
			return 'authentication error Q52620214125341253487';
		}
		
		if (decoded.allowedRequestIpAddress && !(decoded.allowedRequestIpAddress.match(requestingIpAddress) || requestingIpAddress.match(decoded.allowedRequestIpAddress)) ) {
			qtools.logMilestone(`failed authentication token allowedRequestIpAddress ${decoded.allowedRequestIpAddress} does not match supplied ${requestingIpAddress} for ${userId} (Q52620214154641546595)`);
			return 'authentication error Q52620214154641546595';
		}
		
		const today=new Date();
		const expirationDate=decoded.accessExpirationDate?(new Date(decoded.accessExpirationDate)):new Date();
		if (decoded.accessExpirationDate && expirationDate < today) {
			qtools.logMilestone(`failed authentication requesting accessExpirationDate ${decoded.accessExpirationDate} is expired, before ${today.toLocaleDateString()} for ${userId} (Q52620214291542915814)`);
			return 'authentication error Q52620214291542915814';
		}
		
		const secretString=`${decoded.userId.substr(0,3)}...${decoded.userId.substr(decoded.userId.length-1, decoded.userId.length)}`;
		qtools.logMilestone(`succesful auth for: ${secretString}, ${decoded.allowedRequestIpAddress}, ${decoded.accessExpirationDate}, ${decoded.instanceId}`);
		return decoded;
	};



const validateUserToken=validateUserTokenActual({ authKey, instanceId });
const generateAuthToken=generateAuthTokenActual({ authKey, instanceId })

return {generateAuthTokenActual, validateUserTokenActual, validateUserToken, generateAuthToken}

};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;

