#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');

//START OF moduleFunction() ============================================================

const moduleFunction = function({ fabricateConnector, req, res, schema}) {
	
	var retrievalParms = {
		authToken: 'hello',
		helixSchema: qtools.clone(schema),
		otherParms: {},
		debug: false,
		inData: {}
	};
	
	const process = ({criterionData, schema, postData , callback}) => {
	
		const helixConnector = fabricateConnector(req, res, false); //see helixAjaxActual.fabricateConnector() about 'false'

		retrievalParms.helixSchema = schema;
		retrievalParms.inData = Array.isArray[postData]?postData:[postData];
		retrievalParms.callback = callback;

		helixConnector.process('saveOneWithProcess', retrievalParms);
		
	};
	
	return { process };
	
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;