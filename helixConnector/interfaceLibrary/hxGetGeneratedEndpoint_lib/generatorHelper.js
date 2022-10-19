'use strict';

const moduleName=__filename.replace(__dirname+'/', '').replace(/.js$/, ''); //this just seems to come in handy a lot
const qt = require('qtools-functional-library');

const commandLineParser = require('qtools-parse-command-line');
const commandLineParameters = commandLineParser.getParameters();

const fs = require('fs');
const path=require('path');
const util = require('util');
const { exec } = require("child_process");

const asynchronousPipePlus = new require('qtools-asynchronous-pipe-plus')();
const pipeRunner = asynchronousPipePlus.pipeRunner;
const taskListPlus = asynchronousPipePlus.taskListPlus;

//INIT LOGGING ============================================================

const logFilePath = commandLineParameters.fileList[0];

const log = message => {
	fs.writeFileSync(logFilePath, "MESSAGE:   \n"+message+'\n');
};

//GET PARAMETERS ============================================================

const combineElementAndSeparatorsToFinalJson= commandLineParameters.qtGetSurePath('switches.combineElementAndSeparatorsToFinalJson', false);

const driverParameterReplaceObject={};
Object.keys(commandLineParameters.values).forEach(name=>driverParameterReplaceObject[name]=commandLineParameters.qtGetSurePath(`values.${name}`, []).qtPop().replace(/^\[\[/, '').replace(/\]\]$/, '')); //problems occur with empty parameters. calling program adds prefix and suffix, removed here

//CALCULATE APPLESCRIPT ============================================================

const getElementsTemplate=fs.readFileSync(path.join(driverParameterReplaceObject.driverLibraryDirPath, `${driverParameterReplaceObject.schemaName}_lib`, 'getBasicEndpointJson.applescript')).toString();
const getEndpointApplescript=getElementsTemplate.qtTemplateReplace(driverParameterReplaceObject);

//EXECUTE AND RETURN (console.log) RESULT ============================================================

const getEndpointData=(template, callback)=>{

exec(`osascript <<SCRIPT
${template}
SCRIPT`, (error, stdout, stderr) => {
    if (error) {
        callback(`error: ${error.message}`)
        return;
    }
    if (stderr) {
        callback(`stderr: ${stderr}`)
        return;
    }
    callback('', stdout)
    //console.log(stdout); //console.log() writes json back to calling applescript
	log(`\n\nGenerated endpoint (${moduleName}.js): ${driverParameterReplaceObject.myRelation}\${driverParameterReplaceObject.myView}\n${JSON.stringify(driverParameterReplaceObject)} \n===========================================`);
});

}



//log(util.inspect(commandLineParameters));
//log(util.inspect(driverParameterReplaceObject));
//log(`getElementsScript=${getElementsScript}`);


	const taskList = new taskListPlus();
	
	taskList.push((args, next) => {
		const localCallback = (err, mainEndpoint) => {
			next(err, { ...args, mainEndpoint });
		};
		getEndpointData(getEndpointApplescript, localCallback);
	});

	
	const initialData = typeof inData != 'undefined' ? inData : {};
	pipeRunner(taskList.getList(), initialData, (err, args) => {
		const { mainEndpoint } = args;

		console.log(mainEndpoint);
		
		//callback(err, {localResult1Value, localResult2});
	});








