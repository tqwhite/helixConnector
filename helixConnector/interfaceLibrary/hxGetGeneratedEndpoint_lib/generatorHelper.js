'use strict';

const moduleName = __filename.replace(__dirname + '/', '').replace(/.js$/, ''); //this just seems to come in handy a lot
const qt = require('qtools-functional-library');

const commandLineParser = require('qtools-parse-command-line');
const commandLineParameters = commandLineParser.getParameters();

const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');

const asynchronousPipePlus = new require('qtools-asynchronous-pipe-plus')();
const pipeRunner = asynchronousPipePlus.pipeRunner;
const taskListPlus = asynchronousPipePlus.taskListPlus;

//INIT LOGGING ============================================================

const logFilePath = commandLineParameters.fileList[0];
let logString = '';

fs.writeFileSync(
	logFilePath,
	'All logging for generatorHelper.js is written at the end. If a crash occurs, no log will be shown/n'
);

const log = message => {
	logString += `LOG MESSAGE [${moduleName}]: ${message}\n`;
};

//GET PARAMETERS ============================================================

const combineElementAndSeparatorsToFinalJson = commandLineParameters.qtGetSurePath(
	'switches.combineElementAndSeparatorsToFinalJson',
	false
);

const driverParameterReplaceObject = {};
Object.keys(commandLineParameters.values).forEach(
	name =>
		(driverParameterReplaceObject[name] = commandLineParameters
			.qtGetSurePath(`values.${name}`, [])
			.qtPop()
			.replace(/^\[\[/, '')
			.replace(/\]\]$/, ''))
); //problems occur with empty parameters. calling program adds prefix and suffix, removed here

//CALCULATE APPLESCRIPT ============================================================

const getElementsTemplate = fs
	.readFileSync(
		path.join(
			driverParameterReplaceObject.driverLibraryDirPath,
			`${driverParameterReplaceObject.schemaName}_lib`,
			'getBasicEndpointJson.applescript'
		)
	)
	.toString();

//EXECUTE AND RETURN (console.log) RESULT ============================================================

const getEndpointData = (template, callback) => {


	const showGeneratedApplescriptInLog = true;
	
	if (showGeneratedApplescriptInLog) {
		log(`\n\n\ngetBasicEndpointJson ----------------------------------------`);
		log(`\n\n${template}\n\n`);
		log(`-------------------------------------------------------------`);
		log(
			`Suppress generated Applescript listing. Edit 'showGeneratedApplescriptInLog' and set to false in this module`
		);
	} else {
		log(
			`Show generated Applescript string in this log. Edit 'showGeneratedApplescriptInLog' and set to true in this module`
		);
	}
	
	// prettier-ignore
	exec(`osascript <<SCRIPT
${template}
SCRIPT`, (error='', stdout, stderr) => {
    if (error) {
        callback(`\nERROR [moduleName]/osascript: ${error.message.substr(0,400)} \n\n(truncated)\n\n ${error.message.substring((error.message.length)-1200, error.message.length+1)}}\n----------------------`)
        return;
    }
    if (stderr) {
        callback(`\nSTDERR [moduleName]/osascript: ${stderr}`)
        return;
    }
    
    let result;
    try{
    	result=JSON.parse(stdout);
    }
    catch(e){
    	log(`\nERROR [moduleName]: getEndpointData cannot parse JSON`);
    	callback(`\nERROR [moduleName]: getEndpointData cannot parse JSON`)
    	return;
    }
    callback('', JSON.parse(stdout))
    //console.log(stdout); //console.log() writes json back to calling applescript
	//log(`\n\nGenerated endpoint (${moduleName}.js): ${driverParameterReplaceObject.myRelation}\${driverParameterReplaceObject.myView}\n${JSON.stringify(driverParameterReplaceObject)} \n===========================================`);
});
};
//log(util.inspect(commandLineParameters));
//log(util.inspect(driverParameterReplaceObject));
//log(`getElementsScript=${getElementsScript}`);

const taskList = new taskListPlus();

taskList.push((args, next) => {
	const { driverParameterReplaceObject } = args;
	const { optionalEndpointName } = driverParameterReplaceObject;

	const localCallback = (err, defaultMainEndpoint) => {
		if (err) {
			next(err);
			return;
		}

		const defaultMainEndpointName = Object.keys(defaultMainEndpoint).qtPop();

		let mainEndpoint = defaultMainEndpoint;
		if (optionalEndpointName) {
			mainEndpoint = {
				[optionalEndpointName]: defaultMainEndpoint[defaultMainEndpointName]
			};
		}

		const mainEndpointName = Object.keys(mainEndpoint).qtPop();
		next(err, { ...args, mainEndpoint, mainEndpointName });
	};
	const getEndpointApplescript = getElementsTemplate.qtTemplateReplace(
		driverParameterReplaceObject
	);
	getEndpointData(getEndpointApplescript, localCallback);
});

if (
	driverParameterReplaceObject.criterionRelation &&
	driverParameterReplaceObject.criterionView
) {
	taskList.push((args, next) => {
		const { mainEndpointName } = args;

		const localCallback = (err, defaultCriterionEndpoint) => {
			const origCriterionName = Object.keys(defaultCriterionEndpoint).qtPop();
			const newCriterionName = `${mainEndpointName}_criterion`;

			const criterionEndpoint = {
				[newCriterionName]: defaultCriterionEndpoint[origCriterionName]
			};
			next(err, { ...args, criterionEndpoint });
		};

		const replaceObject = driverParameterReplaceObject.qtClone();
		replaceObject.myRelation = driverParameterReplaceObject.criterionRelation;
		replaceObject.myView = driverParameterReplaceObject.criterionView;

		const getEndpointApplescript = getElementsTemplate.qtTemplateReplace(
			replaceObject
		);

		getEndpointData(getEndpointApplescript, localCallback);
	});
	
}

if (
	driverParameterReplaceObject.responseRelation &&
	driverParameterReplaceObject.responseView
) {
	taskList.push((args, next) => {
		const { mainEndpointName } = args;

		const localCallback = (err, defaultResponseEndpoint) => {
			const origResponseName = Object.keys(defaultResponseEndpoint).qtPop();
			const newResponseName = `${mainEndpointName}_response`;

			const responseEndpoint = {
				[newResponseName]: defaultResponseEndpoint[origResponseName]
			};
			next(err, { ...args, responseEndpoint });
		};

		const replaceObject = driverParameterReplaceObject.qtClone();
		replaceObject.myRelation = driverParameterReplaceObject.responseRelation;
		replaceObject.myView = driverParameterReplaceObject.responseView;

		const getEndpointApplescript = getElementsTemplate.qtTemplateReplace(
			replaceObject
		);

		getEndpointData(getEndpointApplescript, localCallback);
	});
	
}

const initialData =
	typeof inData != 'undefined' ? inData : { driverParameterReplaceObject };

pipeRunner(taskList.getList(), initialData, (err, args) => {
	if (err) {
		console.error(`\nPROCESS COMPLETED WITH ERRORS`);
		console.error(`${err}`);
	} else {
		const { mainEndpoint, criterionEndpoint, responseEndpoint } = args;

		const mainEndpointName = Object.keys(mainEndpoint).qtPop();
		
		if (criterionEndpoint) {
			const criterionName = Object.keys(criterionEndpoint).qtPop();
			mainEndpoint[mainEndpointName].criterionSchemaName = criterionName;
			mainEndpoint[criterionName] = criterionEndpoint[criterionName];
		}
		
		if (responseEndpoint) {
			const responseName = Object.keys(responseEndpoint).qtPop();
			mainEndpoint[mainEndpointName].responseSchemaName = responseName;
			mainEndpoint[responseName] = responseEndpoint[responseName];
		}

		console.log(JSON.stringify(mainEndpoint));
	}
	
	fs.writeFileSync(logFilePath, logString);
	return;
	//callback(err, {localResult1Value, localResult2});
});

