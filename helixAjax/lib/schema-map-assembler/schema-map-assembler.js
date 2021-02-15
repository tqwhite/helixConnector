'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');
const path = require('path');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	qtools.validateProperties({
		subject: args || {},
		targetScope: this, //will add listed items to targetScope
		propList: [
			{
				name: 'placeholder',
				optional: true
			},
			{
				name: 'initCallback',
				optional: true
			}
		]
	});

	//LOCAL VARIABLES ====================================

	//LOCAL FUNCTIONS ====================================

	//METHODS AND PROPERTIES ====================================

	const getAutoIncludeDirectoryItems = autoIncludeDirectoryPath => {
		const autoIncludeItems = qtools.fs.readdirSync(autoIncludeDirectoryPath);
		let outObj = {};
		let count = 0;
		autoIncludeItems
			.filter(fileName => fileName.match(/\.json$/))
			.forEach(fileName => {
				const itemPath = path.join(autoIncludeDirectoryPath, fileName);
				try {
					const contents = qtools.fs.readFileSync(itemPath).toString();
					const element = JSON.parse(contents);

					outObj = { ...outObj, ...element };

					count++;
				} catch (e) {
					console.log(`BAD JSON ${itemPath}`);
				}
			});

		console.log(`added ${count} items from ${autoIncludeDirectoryPath}`);

		return outObj;
	};

	const getSchemaMap = schemaMapPath => {
		if (!qtools.realPath(schemaMapPath)) {
			const message =
				'system.collection.schemaMapPath: ' + schemaMapPath + ' is missing';
			qtools.logError(message);
			return message;
		}
		let schemaMap;

		const schemaMapJson = qtools.fs.readFileSync(schemaMapPath);

		try {
			schemaMap = JSON.parse(schemaMapJson);
		} catch (e) {
			console.log('schemaMap main file failed to parse: ' + schemaMapPath);
			throw 'schemaMap main file failed to parse';
		}
		if (schemaMap.includes && schemaMap.includes.length) {
			schemaMap.includes.reduce((result, item) => {
				const includePath = path.join(schemaMapPath, '../', item);
				const includeJson = qtools.fs.readFileSync(includePath);

				let include;
				try {
					include = JSON.parse(includeJson);
				} catch (e) {
					console.log('schemaMap include fil to parse: ' + includePath);
					throw 'schemaMap include file failed to parse';
				}

				if (typeof include == 'object') {
					result.schemaMap = Object.assign({}, result.schemaMap, include);
				}

				return result;
			}, schemaMap);

			if (typeof schemaMap.autoIncludeDirectoryPath == 'string') {
				const autoIncludeDirectoryPath = path.join(
					schemaMapPath,
					'../',
					schemaMap.autoIncludeDirectoryPath
				);
				const autoIncludeSchemaItems = getAutoIncludeDirectoryItems(
					autoIncludeDirectoryPath
				);

				schemaMap.schemaMap = {
					...schemaMap.schemaMap,
					...autoIncludeSchemaItems
				};
			}
		}

		return schemaMap;
	};

	//API ENDPOINTS ====================================

	//INITIALIZATION ====================================

	this.getSchemaMap = getSchemaMap;

	!this.initCallback || this.initCallback();

	//ECOSYSTEM REQUIREMENTS ====================================

	const ping = (message = 'NO MESSAGE SUPPLIED') => {
		return `${qtools.ping().employer} got the ${message}`;
	};

	this.ping = ping;

	this.shutdown = (message, callback) => {
		console.log(`\nshutting down ${qtools.ping().employer}`);
		callback('', message);
	};

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

