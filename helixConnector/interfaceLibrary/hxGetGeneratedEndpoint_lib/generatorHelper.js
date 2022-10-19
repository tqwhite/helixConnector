'use strict';

const moduleName=__filename.replace(__dirname+'/', '').replace(/.js$/, ''); //this just seems to come in handy a lot
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
	fs.writeFileSync(logFilePath, "MESSAGE:   \n"+message+'\n');
};

//GET PARAMETERS ============================================================

const combineElementAndSeparatorsToFinalJson= commandLineParameters.qtGetSurePath('switches.combineElementAndSeparatorsToFinalJson', false);

const driverParameterReplaceObject={};
Object.keys(commandLineParameters.values).forEach(name=>driverParameterReplaceObject[name]=commandLineParameters.qtGetSurePath(`values.${name}`, []).qtPop().replace(/^\[\[/, '').replace(/\]\]$/, '')); //problems occur with empty parameters. calling program adds prefix and suffix, removed here

//CALCULATE APPLESCRIPT ============================================================

const getElementsTemplate=fs.readFileSync(path.join(driverParameterReplaceObject.driverLibraryDirPath, `${driverParameterReplaceObject.schemaName}_lib`, 'getBasicEndpointJson.applescript')).toString();
const getElementsScript=getElementsTemplate.qtTemplateReplace(driverParameterReplaceObject);

//EXECUTE AND RETURN (console.log) RESULT ============================================================

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
    console.log(stdout); //console.log() writes json back to calling applescript
	log(`\n\nGenerated endpoint (${moduleName}.js): ${driverParameterReplaceObject.myRelation}\${driverParameterReplaceObject.myView}\n${JSON.stringify(driverParameterReplaceObject)} \n===========================================`);
});




//log(util.inspect(commandLineParameters));
//log(util.inspect(driverParameterReplaceObject));
log(`getElementsScript=${getElementsScript}`);