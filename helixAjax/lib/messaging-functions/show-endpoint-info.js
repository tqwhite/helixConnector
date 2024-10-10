#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });


const qt = require('qtools-functional-library');
//console.dir(qt.help());

//START OF moduleFunction() ============================================================

const moduleFunction = function (args = {}) {
	const generateEndpointDisplayList = (helixParms, getSchema, fullEndpoint, auxBuiltinEndpoints) => {
		let endpointList = auxBuiltinEndpoints;
		for (var schemaName in helixParms.schemaMap) {
			var element = getSchema(helixParms, schemaName);
			if (!element) {
				qtools.logWarn(`MISSING SCHEMA FILE: No ${schemaName} found`);
				continue;
			}

			const dyn = element.testViewName ? `, dynamicTest/${schemaName}, ` : '';
			const stat = element.staticTestData ? `, staticTest/${schemaName}` : '';
			const noPost = element.noPostViewName ? `, noPost/${schemaName}` : '';
			if (fullEndpoint) {
				endpointList.push({ [`${schemaName}${dyn}${stat}${noPost}`]: element });
			} else {
				endpointList.push(`${schemaName}${dyn}${stat}${noPost}`);
			}
		}
		return endpointList;
	};

	const showInfo = ({
		helixParms,
		newConfig,
		getSchema,
		suppressLogEndpointsAtStartup = false,
	}) => {
		if (
			!qtools.getSurePath(newConfig, 'system.suppressLogEndpointsAtStartup')
		) {
			const endpointDisplayList = generateEndpointDisplayList(
				helixParms,
				getSchema,
			);
			qtools.logMilestone(
				`Endpoints:\n\t${endpointDisplayList.join(
					'\n\t',
				)}\n[endpoint listing from: hexlixAjax.js]`,
			);
		} else {
			qtools.logMilestone(
				'TURN ON endpoint listing from helixAjax.js by setting system.suppressLogEndpointsAtStartup=false in config',
			);
		}
	};
	

	const getEndpointSummary =
		({ helixParms, newConfig: UNUSED, getSchema }) =>
		(req) => {
			const fullEndpoint = req.query.fullEndpoint;
			console.dir(
				{ ['req.query']: req.query },
				{ showHidden: false, depth: 4, colors: true },
			);
			
			const auxBuiltinEndpoints=['endpoints', 'ping', 'hxDetails', 'hxSchema', 'generateToken', 'hxConnectorCheck',];
			
			
			const outStuff=generateEndpointDisplayList(helixParms, getSchema, fullEndpoint, auxBuiltinEndpoints);
			return outStuff
		};
	

	

	

	return { showInfo, getEndpointSummary };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction();
//moduleFunction().workingFunction().qtDump();

