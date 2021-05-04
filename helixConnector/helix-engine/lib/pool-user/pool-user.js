'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');
const asynchronousPipePlus = new require('asynchronous-pipe-plus')();
const asynchronousPipe = asynchronousPipePlus.asynchronousPipe;

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	const { helixAccessParms, hxScriptRunner } = args;
	//LOCAL VARIABLES ====================================

	var initializeProperties = function() {
		self.helixRelationList = [];
		//self.openDatabaseFunctionNames = ['openTestDb'];
		//self.systemParms = {};
		self.leaseUserName = '';
	};

	//LOCAL FUNCTIONS ====================================

	var getRelationList = function(control, callback) {
		var relationFieldName = 'relationName';
		if (
			self.helixRelationList.length !== 0 ||
			qtools.in(control, self.openDatabaseFunctionNames)
		) {
			callback('', '');
			return;
		}

		var helixSchema = {
			internalSchema: true,
			schemaName: 'listRelations',
			relation: '',
			view: '',
			fieldSequenceList: [relationFieldName],
			mapping: {}
		};

		executeHelixOperation('listRelations', {
			helixSchema: helixSchema,
			debug: false,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					throw new Error('Helix not available or is broken.');
				}

				if (result.length < 1) {
					throw new Error(
						'Helix not available or is broken: No relations were retrieved'
					);
				} else {
					result.map(function(item) {
						self.helixRelationList.push(item[relationFieldName]);
					});
					callback(err, result);
				}
			}
		});
	};

	var initUserPoolIfNeeded = (args, callback) => {
		const { helixAccessParms, relationsList } = args;

		const helixRelationList = relationsList.map(item => item.nativeName);

		const requiredRelations = [
			helixAccessParms.userPoolLeaseRelation,
			helixAccessParms.userPoolLeaseView,
			helixAccessParms.userPoolReleaseRelation,
			helixAccessParms.userPoolReleaseView
		];
		var allPresent =
			helixAccessParms.userPoolLeaseRelation &&
			helixAccessParms.userPoolLeaseView &&
			helixAccessParms.userPoolReleaseRelation &&
			helixAccessParms.userPoolReleaseView
				? true
				: false;
		var anyPresent =
			helixAccessParms.userPoolLeaseRelation ||
			helixAccessParms.userPoolLeaseView ||
			helixAccessParms.userPoolReleaseRelation ||
			helixAccessParms.userPoolReleaseView
				? true
				: false;

		var missingTables = '';
		missingTables += !qtools.in(
			helixAccessParms.userPoolLeaseRelation,
			helixRelationList
		)
			? helixAccessParms.userPoolLeaseRelation + ' '
			: '';
		missingTables += !qtools.in(
			helixAccessParms.userPoolReleaseRelation,
			helixRelationList
		)
			? helixAccessParms.userPoolReleaseRelation + ' '
			: '';

		if (allPresent && missingTables) {
			callback(
				'One or more of the User Pool Lease relations is missing: ' +
					missingTables
			);
			return;
		}

		if (anyPresent && !allPresent) {
			callback(
				'One of the User Pool Lease parameters is missing (userPoolLeaseRelation, userPoolLeaseView, userPoolReleaseRelation, userPoolReleaseView)'
			);
			return;
		}

		if (allPresent && !this.leaseUserName) {
			callback('', 'passed initUserPool()');
			return;
		} else {
			callback(missingTables);
		}
	};

	//MAIN ROUTINE ====================================

	const taskListPlus = asynchronousPipePlus.taskListPlus;

	const getPoolUserObjectActual = localArgs => (inData, callback) => {
		const { helixAccessParms, hxScriptRunner } = localArgs;
		const { processName } = inData;
		const taskList = new taskListPlus();

		const leasePoolUserFieldName = 'leaseUserName';
		const leasePoolPasswordFieldName = 'leasePassword';

		taskList.push((args, next) => {
			const localCallback = (err, poolUserObject) => {
				if (err) {
					if (err.toString().match('item')) {
						callback(
							new Error(
								`Cannot get user pool session from Helix (${err.toString()}) in pool-user.js`
							)
						);
					} else {
						callback(new Error(err));
					}
					return;
				}

				args.poolUserObject = poolUserObject;
				next(err, args);
			};

			const helixSchema = {
				internalSchema: true,
				schemaName: 'poolUserLease',
				debug: false,
				returnsJson: true,
				relation: '',
				view: '',
				fieldSequenceList: [leasePoolUserFieldName, leasePoolPasswordFieldName],
				mapping: {}
			};

			hxScriptRunner('poolUserLease', {
				schema: helixSchema,
				callback: localCallback
			});
		});

		const initialData = typeof inData != 'undefined' ? inData : {};
		asynchronousPipe(taskList.getList(), initialData, (err, finalResult) => {
			//console.dir({ 'finalResult [asyncPipe Boilerplate.]': finalResult });
			callback(err, finalResult.poolUserObject);
		});
	};

	const releasePoolUserObjectActual = localArgs => (inData, callback) => {
		const { helixAccessParms, hxScriptRunner, poolUserObject } = localArgs;
		const { processName } = inData;
		const taskList = new taskListPlus();

		const leasePoolUserFieldName = 'leaseUserName';
		const leasePoolPasswordFieldName = 'leasePassword';

		taskList.push((args, next) => {
			const localCallback = (err, releaseStatus) => {
				if (err) {
					callback(
						new Error(
							`CANNOT RELEASE pool session from Helix (${err.toString()}) in pool-user.js/poolUserRelease`
						)
					);
				}
				args.releaseStatus = releaseStatus;
				next(err, args);
			};

			const helixSchema = {
				internalSchema: true,
				schemaName: 'poolUserRelease',
				debug: false,
				returnsJson: true,
				relation: '',
				view: '',
				mapping: {}
			};
			const delayReleasePoolUser = helixAccessParms.qtGetSurePath(
				'helixEngine.delayReleasePoolUser'
			);

			if (delayReleasePoolUser) {
				setTimeout(
					() =>
						hxScriptRunner('poolUserRelease', {
							schema: Object.assign(helixSchema, args.poolUserObject),
							callback: localCallback
						}),
					delayReleasePoolUser
				);
			} else {
				hxScriptRunner('poolUserRelease', {
					schema: Object.assign(helixSchema, args.poolUserObject),
					callback: localCallback
				});
			}
		});

		const initialData = typeof inData != 'undefined' ? inData : {};
		asynchronousPipe(taskList.getList(), initialData, (err, finalResult) => {
			//console.dir({ 'finalResult [asyncPipe Boilerplate.]': finalResult });
			callback(err, finalResult.poolUserObject);
		});
	};

	//API ENDPOINTS ====================================

	this.getPoolUserObject = getPoolUserObjectActual({
		helixAccessParms,
		hxScriptRunner
	});

	this.releasePoolUserObject = releasePoolUserObjectActual({
		helixAccessParms,
		hxScriptRunner
	});
	
	this.checkUserPool = callback => {
		const taskList = new taskListPlus();
		taskList.push((args, next) => {
			if (helixAccessParms.skipUserPoolEntirely) {
				args.processResult.push(
					'User Pool Disabled. skipUserPoolEntirely=true'
				);
				next('skipRestOfPipe', args);
			} else {
				next('', args);
			}
		});
		taskList.push((args, next) => {
			const localCallback = (err, relationsList) => {
				args.relationsList = relationsList;

				next(err, args);
			};

			const helixSchema = {
				internalSchema: true,
				schemaName: 'listRelations',
				debug: false,
				returnsJson: true,
				relation: '',
				view: '',
				fieldSequenceList: [],
				mapping: {}
			};
			hxScriptRunner('listRelations', {
				schema: helixSchema,
				callback: localCallback
			});
		});

		taskList.push((args, next) => {
			const localCallback = (err, relationCheckResult) => {
				if (err) {
					callback(new Error(err));
					return;
				}
				args.processResult.push('Pool User tables valid in Helix');
				next(err, args);
			};
			initUserPoolIfNeeded(
				{ helixAccessParms, relationsList: args.relationsList },
				localCallback
			);
		});

		const initialData = { processResult: [] };
		asynchronousPipe(taskList.getList(), initialData, (err, result) => {
			if (!err || err == 'skipRestOfPipe') {
				callback('', result.processResult);
			} else {
				callback(err);
			}
		});
	};

	//INITIALIZATION ====================================
	

	!this.initCallback || this.initCallback();

	//ECOSYSTEM REQUIREMENTS ====================================

	const ping = (message = 'NO MESSAGE SUPPLIED') => {
		return `${qtools.ping().employer} got the ${message}`;
	};

	this.ping = ping;

	this.shutdown = (message, callback) => {
		console.log(`\nshutting down ${qtools.ping().employer}`);
		callback('', message);
	};

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

