#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');

//START OF moduleFunction() ============================================================

const moduleFunction = function({ fabricateConnector, req, res, schema, criterionData }) {
	
	var retrievalParms = {
		authToken: 'hello',
		helixSchema: qtools.clone(schema),
		otherParms: {},
		debug: false,
		inData: {}
	};
	
	const process = ({criterionData, schema, callback}) => {
	
		const helixConnector = fabricateConnector(req, res, false); //see helixAjaxActual.fabricateConnector() about 'false'

		retrievalParms.helixSchema = schema;
		retrievalParms.criterion = { data: criterionData };
		retrievalParms.callback = callback;

		helixConnector.process('retrieveRecords', retrievalParms);
		
	};
	
	return { process };
	
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;