

				// specialStringConversion appears to be a deadend relic.
				// I leave it here so I don't forget if I ever change my mind
				// if (!parameters.specialStringConversion) {
				// 	return helixData.helixStringToRecordList(helixSchema, data);
				// } else {
				// 	return parameters.specialStringConversion(helixSchema, data);
				// }

	const getRelationList = function(control, callback) {
		const relationFieldName = 'relationName';

		const skipGetHelixRelations = true; //see comment below re: helixRelationList
		if (
			skipGetHelixRelations ||
			self.helixRelationList.length !== 0 ||
			qtools.in(control, self.openDatabaseFunctionNames)
		) {
			callback('', '');
			return;
		}

		const helixSchema = {
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
					callback(err, result);
					return;
				}

				if (result.length < 1) {
					callback(
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
	
	
	
	
	
	

	self.getViewDetailsXXX = function(control, parameters) {
		qtools.die('I think this is never used: self.getViewDetails');
		const callback = parameters.callback
			? parameters.callback
			: function(err, result) {
					qtools.dump({ err: err });
					qtools.dump({ result: result });
				};

		const relationFieldName = 'relationName';

		const forceSkipHelixRelationLookup = true; //see note below

		if (
			forceSkipHelixRelationLookup ||
			self.helixRelationList.length !== 0 ||
			qtools.in(control, self.openDatabaseFunctionNames)
		) {
			callback('', '');
			return;
		}

		const helixSchema = {
			relation: parameters.relation,
			view: parameters.view,
			fieldSequenceList: [],
			mapping: {}
		};

		const viewDetailsConversion = function(
			helixFieldSequenceList,
			helixMapping,
			data
		) {
			const outObj = { weirdString: data };
			throw new Error(
				'getViewDetails() does not produce decent results. It is not yet implemented corrrectly.'
			);
			return outObj;
		};

		executeHelixOperation('getViewDetails', {
			specialStringConversion: viewDetailsConversion,
			helixSchema: helixSchema,
			debug: true,
			inData: {},
			callback: function(err, result, misc) {
				if (err) {
					callback(err, result);
					return;
				}
				if (result.length < 1) {
					callback(
						'Helix not available or is broken: ' +
							parameters.relation +
							'/' +
							parameters.view +
							' does not exist or is broken.'
					);
				} else {
					// 					result.map(function(item) {
					// 						self.helixRelationList.push(item[relationFieldName]);
					// 					});
					callback(err, result);
				}
			}
		});
	};
	
	
	
	
	//POOL USER STUFF ==============================================
	
	self.leasePoolUserFieldName = 'leaseUserName';
	self.leasePoolPasswordFieldName = 'leasePasswordEncrypted';
	self.helixRelationList = [];
	self.openDatabaseFunctionNames = ['openTestDb'];
	self.userPoolOk = '';
	

	const switchToPoolUser = function(user, password) {
		self.systemParms.user = user;
		self.systemParms.password = password;
	};

	const initUserPoolIfNeeded = function(control, callback) {	
		const getPoolUser = function(callback) {
			const localCallback = function(err, result) {
				if (result && result[0]) {
					self.hasPoolUser = true;
				}
				callback(err, result);
			};
			const helixSchema = {
				relation: '',
				view: '',
				fieldSequenceList: [
					self.leasePoolUserFieldName,
					self.leasePoolPasswordFieldName
				],
				mapping: {},
				separators: {
					field: ', '
				}
			};
			executeHelixOperation('poolUserLease', {
				helixSchema: helixSchema,
				otherParms: {},
				debug: false,
				inData: {},
				callback: localCallback
			});
		};
		const decryptLeasePassword = function(leasePasswordEncrypted) {
			const userPoolPasswordDecryptionKey =
				self.helixAccessParms.userPoolPasswordDecryptionKey;
			const userPoolPassword = /*decrypt*/ leasePasswordEncrypted;
			return leasePasswordEncrypted;
		};
		switch (control) {
			case 'openTestDb':
				callback();
				return false;
				break;
			case 'kill':
			case 'quitHelixNoSave':
				self.userPoolOk = false;
				break;
			default:
				self.userPoolOk = true;
				break;
		}

		const allPresent =
			self.helixAccessParms.userPoolLeaseRelation &&
			self.helixAccessParms.userPoolLeaseView &&
			self.helixAccessParms.userPoolReleaseRelation &&
			self.helixAccessParms.userPoolReleaseView
				? true
				: false;
		const anyPresent =
			self.helixAccessParms.userPoolLeaseRelation ||
			self.helixAccessParms.userPoolLeaseView ||
			self.helixAccessParms.userPoolReleaseRelation ||
			self.helixAccessParms.userPoolReleaseView
				? true
				: false;

		const missingTables = '';
		/*
		Turns out that Helix takes FOREVER to return the list of relations if it's very long.
		TODO: I need to refactor this to 1) not retrieve the list, 2) decide if detecting
		missing relations is an important error category, 3) implement a different way
		of detecting that Helix is not up and running. Presently, this is not detected.

		missingTables += !qtools.in(self.helixAccessParms.userPoolLeaseRelation, self.helixRelationList) ? self.helixAccessParms.userPoolLeaseRelation + " " : '';
		missingTables += !qtools.in(self.helixAccessParms.userPoolReleaseRelation, self.helixRelationList) ? self.helixAccessParms.userPoolReleaseRelation + " " : '';
*/

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
		if (allPresent && self.userPoolOk && !self.leaseUserName) {
			getPoolUser(function(err, result) {
				if (!result || !result[0]) {
					qtools.logError('Did not receive a Pool User from Helix');
					callback('Did not receive a Pool User from Helix');
					return;
				}

				self.leaseUserName = result[0][self.leasePoolUserFieldName];

				switchToPoolUser(
					result[0][self.leasePoolUserFieldName],
					decryptLeasePassword(result[0][self.leasePoolPasswordFieldName])
				);

				initExitPoolUser();
				callback();
			});
			return;
		}

		callback();
		return;
	};
	
	
	const releasePoolUser = function(callback) {
		callback = callback ? callback : function() {};

		if (!self.hasPoolUser) {
			callback();
			return;
		}

		const localCallback = function(err, result) {
			//note: tests kill Helix before they close so this is not triggered, it works if Helix stays up
			callback(err, result);
		};
		const helixSchema = {
			relation: '',
			view: '',
			fieldSequenceList: [],
			mapping: {}
		};
		executeHelixOperation('poolUserRelease', {
			helixSchema: helixSchema,
			otherParms: {},
			debug: false,
			inData: {},
			callback: localCallback
		});
	};
	
	

	const initExitPoolUser = function() {
		//process.stdin.resume();//so the program will not close instantly
		//do something when app is closing
		process.on('exit', exitEventHandler);

		//catches ctrl+c event
		//process.on('SIGINT', exitHandler.bind(null, {exit:true}));

		//catches uncaught exceptions
		//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
	};
	
	

			// 			getRelationList(control, function(err, result) {
			// 				if (err) {
			// 					parameters.callback(err);
			// 					return;
			// 				}
			// 				initUserPoolIfNeeded(control, function(err) {
			// 					if (err) {
			// 						parameters.callback(err);
			// 						return;
			// 					}
			// 					prepareProcess(control, parameters);
			// 				});
			// 			});