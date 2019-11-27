'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	this.showErrors = false;
	this.endpointName = 'endPointNotSpecified'; 
	 this.setShowErrors = value => {
		this.showErrors = value;
	};
	this.setEndpointName = endpointName => {
		this.endpointName = endpointName;
	};

	const reportErrorsAndDieMaybe = message => {
		console.error(`\nERROR: '${this.endpointName}' got message '${message}'`);
		if (this.showErrors) {
			console.log(`\nERROR: '${this.endpointName}' got message '${message}'\n`); //this puts the message in the output file.
		} else {
			process.exit(1);
		}
	};

	const findDupesAndDie = viewSummary => {
		const dupeSuppress = new Set();

		viewSummary.fieldData.forEach(item => {
			const name = item.meta.customName || item.meta.nativeName;

			const newFieldName = this.convertName(name);

			if (dupeSuppress.has(newFieldName)) {
				reportErrorsAndDieMaybe(
					`Duplicate column name (${newFieldName} in ${
						viewSummary.context.nativeRelationName
					}\n`
				);
				process.exit(1);
			}

			dupeSuppress.add(newFieldName);
		});
	};

	this.findErrorsAndDie = viewSummary => {
		if (viewSummary.error || viewSummary[0] && viewSummary[0].error) {
			reportErrorsAndDieMaybe(`Endpoint reports error message '${viewSummary.error || viewSummary[0].error}'`);
			process.exit(1);
		}

		if (!viewSummary.context) {
			reportErrorsAndDieMaybe(`getViewData() did not send a context object`);
			process.exit(1);
		}

		if (!viewSummary.context.primaryKeyName) {
			reportErrorsAndDieMaybe(
				`No primary key specified for ${
					viewSummary.context.nativeRelationName
				}`
			);
			process.exit(1);
		}

		findDupesAndDie(viewSummary);
	};

	this.convertName = badName => {
		return badName
			.replace(/\#$/, ' number')
			.replace(/\W/g, ' ')
			.trim()
			.toLowerCase()
			.replace(/ (\w)/g, item => item.toUpperCase())
			.replace(/ /g, '');
	};
	
	this.getMappingElement = meta => {
		const functionMap = {
			['date time type']: 'DATETIME',
			['flag type']: 'TINYTEXT',
			['number type']: 'DECIMAL',
			['text type']: 'MEDIUMTEXT',
			['fixed point type']: 'DECIMAL',
			['styled text type']: 'MEDIUMTEXT'
		};

		return functionMap[meta.fieldType];
	};

	this.createControlProperties = context => {
		return {
			remoteControl: false,
			emptyRecordsAllowed: true,
			private: false,
			relation: context.customRelationName,
			view: context.viewNameUsed,
			testViewName: `${context.viewNameUsed}-debug`
		};
	};

	this.getPrimaryKey = viewSummary => {
		const primaryKeyList = viewSummary.fieldData
			.filter(
				item =>
					item.meta.nativeName == viewSummary.context.primaryKeyName ||
					item.meta.customName == viewSummary.context.primaryKeyName
			)
			.map(
				item =>
					item.meta.customName ? item.meta.customName : item.meta.nativeName
			);

		if (!primaryKeyList.length) {
			reportErrorsAndDieMaybe(
				`Primary key (${
					viewSummary.context.primaryKeyName
				}) is not a column in ${viewSummary.context.nativeRelationName}`
			);
			process.exit(1);
		}

		if (!primaryKeyList.length > 1) {
			reportErrorsAndDieMaybe(
				`Primary key (${
					viewSummary.context.primaryKeyName
				}) matches more than one column in ${
					viewSummary.context.nativeRelationName
				}`
			);
			process.exit(1);
		}

		return primaryKeyList[0];
	};
	
	this.getEndpointName = viewSummary => {
		return `${this.convertName(
			this.getNativeRelationName(viewSummary)
		)}_${this.convertName(viewSummary.context.customRelationName)}`;
	};
	
	this.getTableName = this.getEndpointName; //probably always the same but while I'm refactoring, let's leave the future open
	
	this.getNativeRelationName = viewSummary => {
		return qtools.getSurePath(
			viewSummary,
			'context.nativeRelationName',
			'MISSING_NativeRelationName'
		);
	};
};

//END OF moduleFunction() ============================================================

//module.exports = moduleFunction;
module.exports = new moduleFunction();

