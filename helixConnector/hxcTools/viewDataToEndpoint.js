#!/usr/local/bin/node
'use strict';
const https = require('http');

const URL = process.argv[2];
const relationName = process.argv[3];
const viewName = process.argv[4];

//viewDataToEndpoint.js http://70.151.72.162:9000 000 importWebOrder.01 //seachem

//viewDataToEndpoint.js http://70.151.72.162:9000 049 049-100 //seachem

const getViewData = (relationName, viewName, sendResult) =>
	https
		.get(
			`${URL}/hxGetViewSummary?nativeRelationName=${relationName}&viewName=${viewName}`,
			{
				headers: {
					accept: '*/*',
					'accept-language': 'en-US,en;q=0.9',
					authorization:
						'tq@justkidding.com eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0cUBqdXN0a2lkZGluZy5jb20iLCJpbnN0YW5jZUlkIjoidHF3aGl0ZS9xYm9vayIsImlhdCI6MTQ0OTk2NTY2NX0.9-fcamt3HRF2kK9Kmtb4u8Rd3FGj7V8HfLenvijWF_E aquaSeachem/getConfig',
					'cache-control': 'no-cache',
					pragma: 'no-cache',
					'x-requested-with': 'XMLHttpRequest'
				},
				body: null,
				method: 'GET'
			},
			res => {
				let data = '';

				// called when a data chunk is received.
				res.on('data', chunk => {
					data += chunk;
				});

				// called when the complete response is received.
				res.on('end', () => {
					sendResult(JSON.parse(data));
					console.error('finished');
				});
			}
		)
		.on('error', err => {
			console.error('Error: ', err.message);
		});

var qtLib = require('qtFunctionalLib');
var qtHelp = () =>
	qtLib.help().reduce((result, item) => result.concat(item.methods), []); //.qtDump()

const fieldListGen = fieldData => {
	return fieldData.map(
		item => (item.meta.customName ? item.meta.customName : item.meta.nativeName)
	);
};

const mappingListGen = fieldData => {
	const mappingLookup = {
		viewDataClueFor_BooleanType: 'BooleanType',
		viewDataClueFor_DateTimeStripTimeZoneType: 'DateTimeStripTimeZoneType',
		viewDataClueFor_DateTimeType: 'DateTimeType',
		viewDataClueFor_NumberType: 'NumberType',
		viewDataClueFor_StringType: 'StringType',
		viewDataClueFor_TimeStampType: 'TimeStampType',
		viewDataClueFor_UuidStampType: 'UuidStampType'
	};
	
	return fieldData.reduce(
		(result, item) => ({
			...result,
			[item.meta.customName
				? item.meta.customName
				: item.meta.nativeName]: mappingLookup.qtGetSurePath(
				item.meta.fieldType,
				'StringType'
			)
		}),
		{}
	);
};

const emitEndpoint = viewData => {
	const viewName = viewData.context.viewNameUsed;

	const newEndpoint = {
		ENDPOINTNAME: {
			debugData: false,
			debug: false,
			relation: viewData.context.customRelationName
				? viewData.context.customRelationName
				: viewData.context.nativeRelationName,
			view: viewName,
			testViewName: `${viewName}-debug`,
			noPostViewName: `${viewName}-noPost`,
			fieldSequenceList: fieldListGen(viewData.fieldData),
			mapping: mappingListGen(viewData.fieldData),
			nativeRelationName: viewData.context.nativeRelationName,
			mysqlTableName: '??',
			separators: { field: '\t', record: '`' },
			remoteControl: false,
			emptyRecordsAllowed: true,
			private: false
		}
	};
	console.log(JSON.stringify(newEndpoint, void 0, '\t'));
	
};

getViewData(relationName, viewName, emitEndpoint);

//console.log(JSON.stringify(emitEndpoint(viewData), void(0), '\t'));
