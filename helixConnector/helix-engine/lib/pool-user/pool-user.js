'use strict';

const QTools = require('qtools');
const qtools = new QTools(module, { updatePrototypes: true });
const async = require('async');
const AsynchronousPipePlus = require('qtools-asynchronous-pipe-plus');
const asynchronousPipePlus = new AsynchronousPipePlus();
const asynchronousPipe = asynchronousPipePlus.asynchronousPipe;

function moduleFunction(args) {
  const { helixAccessParms, hxScriptRunner } = args;
  this.leaseUserName = null;

  const taskListPlus = asynchronousPipePlus.taskListPlus;

  const getPoolUserObjectActual = (localArgs) => (inData = {}, callback) => {
    const { helixAccessParms, hxScriptRunner } = localArgs;
    const taskList = new taskListPlus();

    const leasePoolUserFieldName = 'leaseUserName';
    const leasePoolPasswordFieldName = 'leasePassword';

    taskList.push((args, next) => {
      const localCallback = (err, poolUserObject) => {
        if (err) {
          const errorMsg = `Cannot get user pool session from Helix (${err}) in pool-user.js`;
          callback(new Error(errorMsg));
          return;
        }

        args.poolUserObject = poolUserObject;
        next(null, args);
      };

      const helixSchema = {
        annotation: 'hard coded in pool-user.js',
        internalSchema: true,
        schemaName: 'poolUserLease',
        debug: false,
        returnsJson: true,
        relation: '',
        view: '',
        fieldSequenceList: [leasePoolUserFieldName, leasePoolPasswordFieldName],
        mapping: {},
      }; //this schema does NOT respond to logDriverScript

      hxScriptRunner('poolUserLease', {
        schema: helixSchema,
        callback: localCallback,
      });
    });

    asynchronousPipe(taskList.getList(), inData, (err, finalResult) => {
      callback(finalResult.poolUserObject.error, finalResult.poolUserObject);
    });
  };

  const releasePoolUserObjectActual = (localArgs) => (inData = {}, callback) => {
    const { helixAccessParms, hxScriptRunner, poolUserObject } = localArgs;
    const taskList = new taskListPlus();

    taskList.push((args, next) => {
      const localCallback = (err, releaseStatus) => {
        if (err) {
          const errorMsg = `CANNOT RELEASE pool session from Helix (${err}) in pool-user.js/poolUserRelease`;
          callback(new Error(errorMsg));
          return;
        }
        args.releaseStatus = releaseStatus;
        next(null, args);
      };

      const helixSchema = {
        annotation: 'hard coded in pool-user.js',
        internalSchema: false,
        schemaName: 'poolUserRelease',
        debug: false,
        returnsJson: true,
        relation: '',
        view: '',
        mapping: {},
      }; //this schema does NOT respond to logDriverScript

      const delayReleasePoolUser = helixAccessParms.qtGetSurePath(
        'helixEngine.delayReleasePoolUser'
      );

      const runRelease = () => {
        hxScriptRunner('poolUserRelease', {
          schema: { ...helixSchema, ...args.poolUserObject },
          callback: localCallback,
        });
      };

      if (delayReleasePoolUser) {
        setTimeout(runRelease, delayReleasePoolUser);
      } else {
        runRelease();
      }
    });

    asynchronousPipe(taskList.getList(), inData, (err, finalResult) => {
      callback(err, finalResult.poolUserObject);
    });
  };

  this.getPoolUserObject = getPoolUserObjectActual({
    helixAccessParms,
    hxScriptRunner,
  });

  this.releasePoolUserObject = releasePoolUserObjectActual({
    helixAccessParms,
    hxScriptRunner,
  });

  this.checkUserPool = (callback) => {
    const taskList = new taskListPlus();

    taskList.push((args, next) => {
      if (helixAccessParms.skipUserPoolEntirely) {
        args.processResult = args.processResult || [];
        args.processResult.push('User Pool Disabled. skipUserPoolEntirely=true');
        next('skipRestOfPipe', args);
      } else {
        next(null, args);
      }
    });

    taskList.push((args, next) => {
      const localCallback = (err, relationsList) => {
        if (err) {
          next(err, args);
          return;
        }
        args.relationsList = relationsList;
        next(null, args);
      };

      const helixSchema = {
        internalSchema: true,
        schemaName: 'listRelations',
        debug: false,
        returnsJson: true,
        relation: '',
        view: '',
        fieldSequenceList: [],
        mapping: {},
      };

      hxScriptRunner('listRelations', {
        schema: helixSchema,
        callback: localCallback,
      });
    });

    taskList.push((args, next) => {
      const localCallback = (err) => {
        if (err) {
          next(err, args);
          return;
        }
        args.processResult = args.processResult || [];
        args.processResult.push('Pool User tables valid in Helix');
        next(null, args);
      };

      initUserPoolIfNeeded.call(this, { helixAccessParms, relationsList: args.relationsList }, localCallback);
    });

    asynchronousPipe(taskList.getList(), { processResult: [] }, (err, result) => {
      if (!err || err === 'skipRestOfPipe') {
        callback(null, result.processResult);
      } else {
        callback(err);
      }
    });
  };

  function initUserPoolIfNeeded(args, callback) {
    const { helixAccessParms, relationsList } = args;
    const helixRelationList = relationsList.map((item) => item.nativeName);

    const requiredRelations = [
      helixAccessParms.userPoolLeaseRelation,
      helixAccessParms.userPoolLeaseView,
      helixAccessParms.userPoolReleaseRelation,
      helixAccessParms.userPoolReleaseView,
    ];

    const allPresent = requiredRelations.every(Boolean);
    const anyPresent = requiredRelations.some(Boolean);

    let missingTables = '';
    if (!helixRelationList.includes(helixAccessParms.userPoolLeaseRelation)) {
      missingTables += `${helixAccessParms.userPoolLeaseRelation} `;
    }
    if (!helixRelationList.includes(helixAccessParms.userPoolReleaseRelation)) {
      missingTables += `${helixAccessParms.userPoolReleaseRelation} `;
    }

    if (allPresent && missingTables) {
      callback(`One or more of the User Pool Lease relations is missing: ${missingTables}`);
      return;
    }

    if (anyPresent && !allPresent) {
      callback(
        'One of the User Pool Lease parameters is missing (userPoolLeaseRelation, userPoolLeaseView, userPoolReleaseRelation, userPoolReleaseView)'
      );
      return;
    }

    if (allPresent && !this.leaseUserName) {
      callback(null, 'passed initUserPool()');
    } else {
      callback(missingTables || null);
    }
  }

  this.ping = (message = 'NO MESSAGE SUPPLIED') => {
    return `${qtools.ping().employer} got the ${message}`;
  };

  this.shutdown = (message, callback) => {
    console.log(`\nShutting down ${qtools.ping().employer}`);
    callback(null, message);
  };

  return this;
}

module.exports = moduleFunction;