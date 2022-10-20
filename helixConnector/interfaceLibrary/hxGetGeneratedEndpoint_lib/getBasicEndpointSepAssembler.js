'use strict';

const moduleName=__filename.replace(__dirname+'/', '').replace(/.js$/, ''); //this just seems to come in handy a lot


const fs = require('fs');
const util = require('util');

const qt = require('qtools-functional-library');

const commandLineParser = require('qtools-parse-command-line');
const commandLineParameters = commandLineParser.getParameters();

//START OF moduleFunction() ============================================================

const moduleFunction = function() {
	//return { demoKeys: Object.keys(mainElements).join(', ') };

const logFilePath = commandLineParameters.fileList[0];

const log = message => {
	fs.writeFileSync(logFilePath, message+'\n');
};
	log(`\n\nStarting ${moduleName} ===========================================`);


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


	
	const getMappingElement = meta => {
		const functionMap = {
			['date time type']: 'DateTimeType',
			['flag type']: 'BooleanType',
			['number type']: 'NumberType',
			['text type']: 'StringType',
			['fixed point type']: 'NumberType',
			['styled text type']: 'StringType'
		};

		const fieldType = functionMap[meta.fieldType];

		if (false && !fieldType) {
			console.log(`fieldType missing from mainElements (${meta.nativeName}`);
		}

		return fieldType ? fieldType : functionMap['text type'];
	};
	const viewSummary = mainElements;

	//NOTE: viewNameUsed is not coming from Helix. I suspect it is being
	//constructed in getViewDetails.applescript

	const createControlProperties = context => {
		return {
			remoteControl: false,
			emptyRecordsAllowed: true,
			private: false,
			skipPoolUser: false,
			relation: context.customRelationName
				? viewSummary.context.customRelationName
				: viewSummary.context.nativeRelationName,
			view: context.viewNameUsed
		};
	};

	
	const fieldSequenceList = viewSummary.fieldData.map(
		item => (item.meta.customName ? item.meta.customName : item.meta.nativeName)
	);
	const mapping = viewSummary.fieldData.map(item =>
		getMappingElement(item.meta)
	);
	
	const definitionBlock = Object.assign(
		{
			debugData: false,
			debug: false
		},
		createControlProperties(viewSummary.context),
		{
			criterionSchemaName: '',
			primaryKey: viewSummary.context.primaryKeyName,
			nativeRelationName: viewSummary.context.nativeRelationName,
			fieldSequenceList,
			fieldListNote:
				'Generated by hxGetGeneratedEndpoint.applescript/elementFormatter.js',
			mapping,
			separators: {
				field: separators.fieldSeparator,
				record: separators.recordSeparator
			}
		}
	);
	const endpointName = `${mainElements.context.nativeRelationName.replace(
		/\W/g,
		'_'
	)}__${mainElements.context.viewNameUsed.replace(/\W/g, '_')}`;
	const endpointDefinition = {
		[endpointName]: definitionBlock
	};
	
const finishedEndpointJson=JSON.stringify(endpointDefinition);


	//OUTPUT ============================================================

	process.stdout.write(finishedEndpointJson);
	log(`\n\nEnding ${moduleName} ===========================================`);
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction();


