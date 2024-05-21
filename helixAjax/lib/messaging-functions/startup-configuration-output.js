#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const util=require('util');

//START OF moduleFunction() ============================================================

const moduleFunction = function(args = {}) {
	const sendOutput = ({
		newConfig,
		reminder,
		schemaMapPath,
		hxcVersion,
		staticPageDispatchConfig,
		sslAnnotation,
		helixParms,
		summarizeConfig
	}) => {
		
		if (helixParms.suppressTokenSecurityFeatures) {
			qtools.logWarn(`WARNING: suppressTokenSecurityFeatures=true`);
		}

		
		const overrideStringsReport=`Overrides: skipUserPoolEntirely=${newConfig.system.skipUserPoolEntirely}, debugAlways=${newConfig.system.debugAlways}, debugDataAlways=${newConfig.system.debugDataAlways}, showSchemaSummary=${newConfig.system.showSchemaSummary}`;

		
		// prettier-ignore
		qtools.log(
`

${summarizeConfig({newConfig}).system()}
${summarizeConfig({newConfig}).endpointOverview()}
note: helixEngine.delayReleasePoolUser=${helixParms.qtGetSurePath( 'helixEngine.delayReleasePoolUser' )}
endpoints directory: ${schemaMapPath}${helixParms.suppressTokenSecurityFeatures?'\nWARNING: systemParameters.ini/suppressTokenSecurityFeatures=true':''}
applescript driver log file path: ${newConfig.system.driverLogFilePath}
${overrideStringsReport}
reminder: Force helix-data to log JSON to a file in /tmp/... by setting debugData=true in endpoint or debugDataAlways=true in config 
Code Version: ${hxcVersion}
${new Date().toLocaleTimeString()}: Magic happens on port ${
staticPageDispatchConfig.port
}${sslAnnotation}. ----------------------------------------------------------
`
			);
		console.error(
			`helixAjax (version ${hxcVersion}) startup complete: ${new Date().toLocaleString()}`
		); //it's very helpful to have this annotation IN THE ERROR LOG
		reminder(`hxConnector Startup Complete`); //shows macos notification
	};

	return { sendOutput };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction();
//moduleFunction().workingFunction().qtDump();

