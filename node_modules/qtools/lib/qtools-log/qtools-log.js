'use strict';
var util = require('util');
const fs=require('fs');
const path=require('path');

//START OF moduleFunction() ============================================================
var moduleFunction = function(self) {
	const qtools = self;
	const moduleName = qtools.ping().employer;

	qtools.ERROR = 'DEVELOPMENT'; //ad hoc messages should always be removed
	qtools.ERROR = 'ERROR'; //definitely a problem
	qtools.MILESTONE = 'MILESTONE'; //major processing steps
	qtools.RESULT = 'RESULT'; //major processing steps
	qtools.DEBUG = 'DEBUG'; //mainly should not exist after development
	qtools.WARN = 'WARN'; //could be a problem but life goes on
	qtools.INFO = 'INFO'; //help understand exceptional process, probably unusual branches
	qtools.NOTE = 'NOTE'; //comments to explain things the might be misunderstood when reading logs
	qtools.DETAIL = 'DETAIL'; //normal process details useful for understanding what happened
	qtools.FORENSICEVIDENCE = 'FORENSICEVIDENCE'; //gnarly details, usually off when developer can see log
	qtools.ALL = 'ALL';

	const priority = [
		qtools.NONE,
		qtools.DEVELOPMENT,
		qtools.ERROR,
		qtools.MILESTONE,
		qtools.RESULT,
		qtools.DEBUG,
		qtools.WARN,
		qtools.INFO,
		qtools.NOTE,
		qtools.DETAIL,
		qtools.FORENSICEVIDENCE,
		qtools.ALL
	];

	let currentMessageLevel = process.env.qtoolsLogLevel || qtools.DETAIL;
	let previousMessageLevel=currentMessageLevel;
	let groupLogString='';
	
	const qtoolsLoggingFilePath=process.env.qtoolsLoggingFilePath;
			
	if (qtoolsLoggingFilePath){
	 	console.log(`: ${qtoolsLoggingFilePath}`);
	 	fs.mkdirSync(path.dirname(qtoolsLoggingFilePath), {recursive:true});
	
	}
	
	qtools.clearLoggingFile = () => {
		if (qtoolsLoggingFilePath && fs.existsSync(qtoolsLoggingFilePath)) {
			fs.unlinkSync(qtoolsLoggingFilePath);
		}
	
	};

	
	/*
		Add something like this to the beginning of your application, optional.
			global.applicationLoggingIdString=config.system.applicationLoggingIdString;


		Convenience text so I can easily copy/paste when working:
		export qtoolsLogLevel=MILESTONE
		export qtoolsLogLevel=DETAIL
		export qtoolsLogLevel=DEBUG
		export qtoolsLogLevel=FORENSICEVIDENCE
	*/

	const importantEnough = severity => {
		return priority.indexOf(currentMessageLevel) < priority.indexOf(severity);
	};

	qtools.setMessageLevel = level => {
		if (priority.indexOf(level) == -1) {
			console.log(`Invalid message level ${level} in qtools.log.js`);
			console.dir({ ['use qtools.']: priority });
		}
		previousMessageLevel=currentMessageLevel;
		currentMessageLevel = level;
	};

	qtools.getMessageLevel = level => {
		return currentMessageLevel;
	};
	
	qtools.restoreMessageLevel=()=>{
		currentMessageLevel=previousMessageLevel;
	}
	
	qtools.setGroupLogString=input=>{
		groupLogString=`${input}/`;
	}
	
	qtools.getGroupLogString=()=>{
		return groupLogString.replace(/\/$/, '');
	}

	qtools.log = function(message, level, args) {
		const applicationLoggingIdString = global.applicationLoggingIdString+'/' || '';
		args = args || {};
		message=message || `qtools-log says, NO MESSAGE PROVIDED WHEN CALLED FOR LOG LEVEL ${level}`;
		message = message.toString();
		if (!args || args.addModule !== false) {
			message = message.replace(/(\n*)$/, ` [${applicationLoggingIdString}${groupLogString}${moduleName}]$1`);
		}
		if (!args || args.addDate !== false) {
			message = message.replace(/(\n*)$/, ` ${new Date().toLocaleString()}$1`);
		}
		
		if(args.returnString){
			return `${level}: ${message}`;
		}

		if (!args || args.highlightCapsPrefix !== false) {
			const capsColor = args.highlightCapsPrefixColor || 'red';
			const caps = message.match(/^([A-Z ][A-Z ]+)/);
			if (caps) {
				message = message.replace(caps[0], caps[0][capsColor]);
			}
		}
		
		const writeLog=message=>{
			console.log(message)
			
				if (qtoolsLoggingFilePath){
					fs.appendFileSync(qtoolsLoggingFilePath, `${message}\n`, {append:true});
				}
		
		}

		switch (level) {
			case qtools.DEVELOPMENT:
				importantEnough(level) || writeLog(message.blue);
				break;
			case qtools.MILESTONE:
				importantEnough(level) || writeLog(message);
				break;
			case qtools.RESULT:
				importantEnough(level) || writeLog(message);
				break;

			case qtools.ERROR:
				importantEnough(level) || writeLog(message.red);
				break;

			case qtools.WARN:
				importantEnough(level) || writeLog(message.blue);
				break;

			case qtools.INFO:
				importantEnough(level) || writeLog(message.grey);
				break;

			case qtools.DETAIL:
				importantEnough(level) || writeLog(message.grey);
				break;

			case qtools.NOTE:
				importantEnough(level) || writeLog(message.red);
				break;

			case qtools.DEBUG:
				importantEnough(level) || writeLog(message.white);
				break;

			case qtools.FORENSICEVIDENCE:
				importantEnough(level) || writeLog(message.yellow);
				break;

			default:
				writeLog(message);
				break;
		}
	};

	qtools.logDev = function(message, controls) {
		return self.log(message, qtools.DEVELOPMENT, controls);
	};

	qtools.logError = function(message, controls) {
		return self.log(message, qtools.ERROR, controls);
	};
	qtools.logWarn = function(message, controls) {
		return self.log(message, qtools.WARN, controls);
	};
	qtools.logMilestone = function(message, controls) {
		return self.log(message, qtools.MILESTONE, controls);
	};
	qtools.logResult = function(message, controls) {
		return self.log(message, qtools.RESULT, controls);
	};
	qtools.logDetail = function(message, controls) {
		return self.log(message, qtools.DETAIL, controls);
	};
	qtools.logInfo = function(message, controls) {
		return self.log(message, qtools.INFO, controls);
	};
	qtools.logNote = function(message, controls) {
		return self.log(message, qtools.NOTE, controls);
	};
	qtools.logDebug = function(message, controls) {
		return self.log(message, qtools.DEBUG, controls);
	};
	qtools.logForensicEvidence = function(message, controls) {
		return self.log(message, qtools.FORENSICEVIDENCE, controls);
	};

	qtools.setLogDev = () => {
		qtools.setMessageLevel(qtools.DEVELOPMENT);
	};

	qtools.setLogMilestone = () => {
		qtools.setMessageLevel(qtools.MILESTONE);
	};

	qtools.setLogResult = () => {
		qtools.setMessageLevel(qtools.RESULT);
	};

	qtools.setLogError = () => {
		qtools.setMessageLevel(qtools.ERROR);
	};

	qtools.setLogWarn = () => {
		qtools.setMessageLevel(qtools.WARN);
	};

	qtools.setLogInfo = () => {
		qtools.setMessageLevel(qtools.INFO);
	};

	qtools.setLogNote = () => {
		qtools.setMessageLevel(qtools.NOTE);
	};

	qtools.setLogDetail = () => {
		qtools.setMessageLevel(qtools.DETAIL);
	};

	qtools.setLogDebug = () => {
		qtools.setMessageLevel(qtools.DEBUG);
	};

	qtools.setlogForensicEvidence = () => {
		qtools.setMessageLevel(qtools.FORENSICEVIDENCE);
	};

	qtools.setLogAll = () => {
		qtools.setMessageLevel(qtools.ALL);
	};

	qtools.logPossibleError = err => {
		if (err) {
			qtools.logError(err.toString);
		}
	};
	
	qtools.logWarning=()=>{
		qtools.logError("it's qtools.logWarn() dumbo, not logWarning!!");
		qtools.die();
	}
};

//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
