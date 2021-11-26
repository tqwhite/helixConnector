#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');

const passport = require('passport');

const mutateReqObject = require('../mutate-request-object');

//START OF moduleFunction() ============================================================

const moduleFunction = function({
	app,
	localConfig,
	askActiveDirectory
}) {
	const {
		isActive,
		verificationModuleName,
		useCredentialsForHelix,
		moduleName
	} = localConfig;

	const SimpleStrategy = require('../passport-simple').Strategy; //based on passport-local, revised by tqii to retrieve from headers

	passport.use(
		new SimpleStrategy(
			{
				usernameField: 'headers.externalu',
				passwordField: 'headers.externalp'
			},
			askActiveDirectory.verifyUser
		)
	);

	app.use((req, res, next) => {
		qtools.logMilestone(`starting external authorization.install()`);

		passport.authenticate('simple', { session: false }, function(
			err,
			user,
			info
		) {
			if (err) {
				if (err === 'invalid_grant') {
					err = `invalid_grant (problem with username, password, expired access, not allowed to use this resource, etc)`;
				}
				qtools.logError(
					`login failed: ${err.message ? err.message.toString() : err}`
				);
				res.status('401');
				res.send(`login failed: ${err.message ? err.message.toString() : err}`);
				return next(err.toString());
			}

			next('', user);
		})(req, res, next);
	});

	app.use(function(req, res, next) {
		qtools.logMilestone(`deferring user login to HXCLIENTLOGIN`);

		if (useCredentialsForHelix) {
			qtools.logMilestone(`retaining helix login credentials`);
			mutateReqObject(
				req,
				'headers.hxuser',
				req.qtGetSurePath('headers.externalu')
			);
			mutateReqObject(
				req,
				'headers.hxpassword',
				req.qtGetSurePath('headers.externalp')
			);
		} else {
			qtools.logMilestone(
				`prefer pool user for helix login; removing headers.hxuser and headers.hxpassword`
			);
		}

		qtools.logMilestone(`EXTERNAL AUTH COMPLETE ========================`);
		next();
	});
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
