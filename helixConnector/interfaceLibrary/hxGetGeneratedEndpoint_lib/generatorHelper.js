'use strict';

const qt = require('qtools-functional-library');

const commandLineParser = require('qtools-parse-command-line');
const commandLineParameters = commandLineParser.getParameters();

const fs = require('fs');
const path=require('path');
const util = require('util');
const { exec } = require("child_process");

//INIT LOGGING ============================================================

const logFilePath = commandLineParameters.fileList[0];

const log = message => {
	fs.writeFileSync(logFilePath, message+'\n');
};


const operateSpecialElement= commandLineParameters.qtGetSurePath('switches.operateSpecialElement', false);
const combineElementAndSeparatorsToFinalJson= commandLineParameters.qtGetSurePath('switches.combineElementAndSeparatorsToFinalJson', false);

log(`operateSpecialElement=${operateSpecialElement}`);

if (operateSpecialElement) {
	const getMainElementStuff = require('./getMainElementStuff');
	
// prettier-ignore
const driverParameterReplaceObject={};	

Object.keys(commandLineParameters.values).forEach(name=>driverParameterReplaceObject[name]=commandLineParameters.qtGetSurePath(`values.${name}`, []).qtPop())
driverParameterReplaceObject.myPassword=driverParameterReplaceObject.myPassword.replace(/^X/, '').replace(/X$/, ''); //causes trouble when password is empty

//     myCollection: 'donutBackBrain',
//     myRelation: 'Customer Records',
//     myView: 'exportCustomer',
//     myUser: 'lenny',
//     driverLogFilePath: '/tmp/hxcDriverLog.log',
//     scriptFilePath: '/Users/lenny/CustomApplications/Databright/library/hxConnector/system/code/helixConnector/interfaceLibrary/hxGetGeneratedEndpoint.applescript',
//     schemaName: 'hxGetGeneratedEndpoint',
//     applicationName: 'Helix RADE',
//     myPassword: ''
log("===================+");
log(util.inspect({driverParameterReplaceObject}), { showHidden: false, depth: 2, colors: true });
log("===================2+");

const getElementsTemplate=fs.readFileSync(path.join(driverParameterReplaceObject.scriptParentDirPath, `${driverParameterReplaceObject.schemaName}_lib`, 'getMainElementStuff.applescript')).toString()

const getElementsScript=getElementsTemplate.qtTemplateReplace(driverParameterReplaceObject);




exec(`osascript <<SCRIPT
${getElementsScript}
SCRIPT`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(stdout);
});

	log(util.inspect({driverParameterReplaceObject}));

	return;
} else if (combineElementAndSeparatorsToFinalJson){
	//INPUT ============================================================

	const mainElementsJson = commandLineParameters.fileList[1];
	let mainElements;
	try {
		mainElements = JSON.parse(mainElementsJson);
	} catch (e) {
		log(`failed json parsing of mainElementsJson. ${e.toString()}`);
	}

	const separatorsJson = commandLineParameters.fileList[2]
		.replace(/\t/g, 'TAB')
		.replace(/\r/g, 'CR');

	let separators;

	try {
		separators = JSON.parse(separatorsJson);
	} catch (e) {
		log(`failed json parsing of separatorsJson. ${e.toString()}`);
	}

	//PROCESS ============================================================

	const combineElementAndSeparatorsToFinalJson = require('./combineElementAndSeparatorsToFinalJson');

	const finishedEndpoint = combineElementAndSeparatorsToFinalJson({
		mainElements,
		separators,
		log
	});

	//OUTPUT ============================================================

	process.stdout.write(
		JSON.stringify(finishedEndpoint)
		
	);
}
