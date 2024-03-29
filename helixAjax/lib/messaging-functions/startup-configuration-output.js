#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

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
		
		
//=============   showSchemaSummary  ========================= 

		const showSchemaSummary=false; //false suppresses output
		
//=============   showSchemaSummary  ========================= 
		
		// prettier-ignore
		qtools.log(
`

${summarizeConfig({newConfig}).system()}
${summarizeConfig({newConfig}).endpointOverview()}
note: helixEngine.delayReleasePoolUser=${helixParms.qtGetSurePath( 'helixEngine.delayReleasePoolUser' )}
endpoints directory: ${schemaMapPath}${helixParms.suppressTokenSecurityFeatures?'\nWARNING: systemParameters.ini/suppressTokenSecurityFeatures=true':''}
applescript driver log file path: ${newConfig.system.driverLogFilePath}
reminder: setting debugData=true in endpoint causes helix-data to log JSON to a file in /tmp/...
${showSchemaSummary?(summarizeConfig({newConfig}).relationsAndViews().qtDump({label:'\n[startup-configuration-output.js]'}))?'endpoint details from  startup-configuration-output.js (showSchemaSummary) displayed above':'':'endpoint details available in startup-configuration-output.js (showSchemaSummary)'}
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

