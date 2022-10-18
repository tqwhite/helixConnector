#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');
// console.dir(qt.help());
// process.exit();
//START OF moduleFunction() ============================================================

const moduleFunction = function({ newConfig } = {}) {
	const isValid = element =>
		(qtools.getSurePath(element, 'relation') &&
			qtools.getSurePath(element, 'view')) ||
		qtools.getSurePath(element, 'scriptName');

	const relationsAndViews = ({ resultFormat = 'jsObj' } = {}) => {
		const reorganizeAndFilter = (result, keyName) => {
			const element = newConfig.system.schemaMap[keyName];

			result.totalEntries++;

			let tmp = 'n/a';
			if (typeof element.fieldSequenceList != 'undefined') {
				tmp = element.fieldSequenceList.qtDump({ toString: true });
			}

			if (isValid(element)) {
				result.push({
					endpointName: keyName,
					note: element.note,
					fields: tmp,
					relation: element.relation,
					view: element.view,
					criterionSchemaName: element.criterionSchemaName,
					testViewName: element.testViewName,
					noPostViewName: element.noPostViewName,
					nativeRelationName: element.nativeRelationName,
					endpointFilePath: element.endpointFilePath
				});
			}
			return result;
		};

		const result = Object.keys(newConfig.system.schemaMap)
			.reduce(reorganizeAndFilter, [])
			.filter(element => isValid(element))
			.map(element => ({ ...element, type: 'primaryEndpoint' }))
			.sort(qtools.byObjectProperty('endpointName'));

		if (resultFormat == 'jsObj') {
			return result;
		} else if (resultFormat == 'string') {
			return result
				.map(
					item =>
						`${item.relation}:${item.view}:${item.endpointName}:${item.type}`
				)
				.join(',\n');
		} else {
			return `invalid resultFormat (${resultFormat}), only supports 'string' and 'jsObj'`;
		}
	};
	//==================================
	const endpointOverview = () => {
		const validEndpointCount = Object.keys(newConfig.system.schemaMap).reduce(
			(validEndpointCount, keyName) => {
				const element = newConfig.system.schemaMap[keyName];

				validEndpointCount.totalEntries++;

				if (isValid(element)) {
					validEndpointCount.usableEndpoints++;
				}
				return validEndpointCount;
			},
			{
				usableEndpoints: 0,
				totalEntries: 0
			}
		);

		return `found ${
			validEndpointCount.usableEndpoints
		} usable endpoints out of ${
			validEndpointCount.totalEntries
		} items found in schemaMap (including internal endpoints)`;
	};

	const system = () => {
		// prettier-ignore
		return `Config Summary:
....instanceId: ${qtools.getSurePath(newConfig, 'system.instanceId', 'missing instanceId')}
....applicationName: ${qtools.getSurePath(newConfig, 'system.applicationName', 'missing applicationName')}
....collection: ${qtools.getSurePath(newConfig, 'system.collection', 'missing collection')}
....hxConnectorUser: ${qtools.getSurePath(newConfig, 'system.hxConnectorUser', 'missing hxConnectorUser')}
....configDirPath: ${qtools.getSurePath(newConfig, 'system.configDirPath', 'missing configDirPath')}
....schemaMapName: ${qtools.getSurePath(newConfig, 'system.schemaMapName', 'missing schemaMapName')}
....remoteControlDirectoryPath: ${qtools.getSurePath(newConfig, 'system.remoteControlDirectoryPath', 'missing remoteControlDirectoryPath')}
....staticDataDirectoryPath: ${qtools.getSurePath(newConfig, 'system.staticDataDirectoryPath', 'missing staticDataDirectoryPath')}
....privilegedHosts: ${Object.keys(qtools.getSurePath(newConfig, 'system.privilegedHosts', {privilegedHosts:[]})).map(((item, entire, xxx)=>(newConfig.system.privilegedHosts)?newConfig.system.privilegedHosts[item]:'no privileged hosts'))}`;
	};

	return { system, endpointOverview, relationsAndViews };
};

//END OF moduleFunction() ============================================================

module.exports = args => new moduleFunction(args);
