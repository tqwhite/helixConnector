'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util');

const toHelix = inDateObj =>
	inDateObj.toLocaleTimeString('en-US', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric',
		hour12: true
	});

const toMysql = inDateObj =>
	inDateObj.toISOString().slice(0, 10) +
	' ' +
	inDateObj.toLocaleTimeString('en-US', { hour12: false });

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	events.EventEmitter.call(this);
	this.forceEvent = forceEvent;
	this.args = args;
	this.metaData = {};
	this.addMeta = function(name, data) {
		this.metaData[name] = data;
	};

	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};

	//MAPPING HELPERS ====================================

	var helixNumber = function(inData) {
		if (!inData) {
			return;
		}

		return inData.replace(/[^0-9\.\-]/g, '');
	};

	var helixDateTime = function(inDate) {
		//helix example: '6/29/15  8:38:39 AM'

		if (!inDate) {
			return;
		}

		if (inDate.constructor == Date) {
			var result = toHelix(inDate);
		} else {
			var tmp = new Date(inDate);
			if (tmp != 'Invalid Date') {
				return toHelix(tmp);
			}
		}

		return result;
	};

	var helixBoolean = function(item) {
		if (item === '' || typeof item == 'undefined') {
			return;
		}
		switch (item) {
			case 'true':
			case 'Yes':
				return 'true';
				break;
			case 'false':
			case 'No':
				return 'false';
				break;
			default:
				return item;
				break;
		}
	};

	const helixFilePath = item =>
		item ? item.replace(/^\/Volumes\//, '').replace(/\/+/g, ':') : '';

	const zeroMeansBlank = item => (item == 0 ? '' : item);

	//MAPPING PROPERTIES ====================================

	self.booleanToHxString = item => {
		if (item === '' || typeof item == 'undefined') {
			return;
		}
		return item ? 'Yes' : 'No';
	};

	self.stringToNumber = item => {
		if (item === '' || typeof item == 'undefined') {
			return null;
		}
		return +item;
	};

	self.stringToBoolean = function(item) {
		if (item === '' || typeof item == 'undefined') {
			return;
		}

		switch (item.toLowerCase()) {
			case 'true':
			case 'yes':
				return true;
				break;
			case 'false':
			case 'no':
				return false;
				break;
			default:
				qtools.logError(`no boolean mapping for ${item}`);
				return item;
				break;
		}
	};

	self.helixDateTimeNow = function(inData) {
		return helixDateTime(new Date());
	};

	self.refId = function(inData) {
		return qtools.newGuid();
	};

	self.helixDateTime = function(inDate) {
		return helixDateTime(inDate);
	};

	self.helixNumber = function(inData) {
		return helixNumber(inData);
	};

	self.helixBoolean = function(inData) {
		return helixBoolean(inData);
	};

	self.helixFilePath = function(inData) {
		return helixFilePath(inData);
	};

	self.toUpperCase = function(inData) {
		return inData.toString().toUpperCase();
	};

	self.passThrough = function(inData) {
		return inData;
	};

	self.mysqlTimeStamp = function(inData) {
		return toMysql(Date.now());
	};

	self.toHelixDateTime = function(inDate) {
		//helix example: '6/29/15  8:38:39 AM'

		if (!inDate) {
			return;
		}

		if (inDate.constructor == Date) {
			var result = toHelix(inDate);
		} else {
			var tmp = new Date(inDate);
			if (tmp != 'Invalid Date') {
				return toHelix(tmp);
			}
		}

		return result;
	};

	self.BooleanType = (value, destination) => {
		if (typeof value == 'undefined' || value === '') {
			return;
		}
		switch (destination) {
			case 'toHelix':
				return value ? 'Yes' : 'No';
				break;
			case 'toJson':
				if (!value) {
					return false;
				}
				switch (value.toString().toLowerCase()) {
					case 'true':
					case 'yes':
					case '1':
						return true;
					case 'false':
					case 'no':
					case '0':
						return false;
					default:
						qtools.logError(`${value} is not a valid boolean value`);
						return value;
						break;
				}
				break;
		}
	};

	self.DateTimeType = (value, destination) => {
		if (typeof value == 'undefined' || value === '') {
			return;
		}
		const result = new Date(value);

		if (result == 'Invalid Date') {
			const message = `String '${value}' cannot be parsed into date (helixData.DateTimeType)`;
			qtools.logError(message);
			return value;
		}
		switch (destination) {
			case 'toHelix':
				//helix example: '6/29/15  8:38:39 AM'
				var options = {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: true,
					hourCycle: 'h12',
					second: 'numeric'
				};
				const newDate = new Date(result)
					.toLocaleString('en-US', options)
					.replace(/,/g, '');
				return newDate;
				break;
			case 'toJson':
				return result.toISOString();
				break;
		}
	};

	self.DateTimeStripTimeZoneType = (value, destination) => {
		const notUtcValue = value.replace(/Z$/, '');
		return self.DateTimeType(notUtcValue, destination);
	};

	self.NumberType = (value, destination) => {
		if (typeof value == 'undefined' || value === '') {
			return;
		}
		if (typeof +value != 'number') {
			return value;
		}

		switch (destination) {
			case 'toHelix':
				return value;
				break;
			case 'toJson':
				return +value;
				break;
		}
	};

	self.StringType = (value, destination) => {
		if (typeof value == 'undefined') {
			return;
		}
		switch (destination) {
			case 'toHelix':
				return value.toString();
				break;
			case 'toJson':
				return value.toString();
				break;
		}
	};

	self.TimeStampType = (value, destination) => {
		const timeStamp = value ? value : new Date();
		return self.DateTimeType(timeStamp, destination);
	};

	self.UuidStampType = (value, destination) => {
		const tmp = value ? value : qtools.newGuid();
		return tmp;
	};

	//SYSTEM DATA MANIPULATION ====================================

	//this is called as compileScript() from helixConnector.compileScriptActual() which is called from helix-engine.
	self.makeApplescriptDataString = function({
		schema,
		otherParms,
		inData,
		separators
	}) {
		const { fieldSequenceList, mapping } = schema;

		const destination = 'toHelix';
		separators = separators ? separators : {};
		var recordSeparator = separators.record ? separators.record : ', ';
		const fieldSeparator = separators.field
			? separators.field
			: String.fromCharCode(9);

		switch (qtools.toType(inData)) {
			case 'array':
				var outString = '';
				for (var i = 0, len = inData.length; i < len; i++) {
					var element = inData[i];
					const workingOtherParms = qtools.clone(otherParms);
					delete workingOtherParms.hxcPagedRecordOffset; //these are meta parameters, never part of a real query
					delete workingOtherParms.hxcPagedRecordCount;

					var replaceObject = qtools.extend(element, workingOtherParms);

					/*

						Turns out that my information about how Helix works with Applescript has 
						been wrong the whole time, for years. It does not parse a string into
						records. That is why it has not worked for loading multiple records.
					
						Instead, it needs an Applescript list (no surprise, I was just told
						different). Once the list is in place, the separator causes a Helix
						error.
					
						It is now removed. Eventually, I will remove it from the endpoint.
					
						//const tabSep=`${jsObjectToHxTabSeparated( fieldSequenceList, mapping, replaceObject, fieldSeparator, destination )}${recordSeparator}`;

						tqii. 10/14/21
						

					*/

					const tabSep = `${jsObjectToHxTabSeparated(
						fieldSequenceList,
						mapping,
						replaceObject,
						fieldSeparator,
						destination
					)}`;

					outString += `"${tabSep}", ¬\n`;
				}
				return outString.replace(new RegExp(', ¬\n$'), '');
				break;

			case 'object':
				const workingOtherParms = qtools.clone(otherParms);
				delete workingOtherParms.hxcPagedRecordOffset; //these are meta parameters, never part of a real query
				delete workingOtherParms.hxcPagedRecordCount;
				delete workingOtherParms.hxcReturnMetaDataOnly;

				var replaceObject = qtools.extend(inData, workingOtherParms);

				outString = jsObjectToHxTabSeparated(
					fieldSequenceList,
					mapping,
					replaceObject,
					fieldSeparator,
					destination
				);

				return outString;

				break;

			default:
				qtools.logError(
					`inData '${inData}' is of type '${qtools.toType(
						inData
					)}', not a valid type for conversion to a helix record, ie, object or array`
				);
				return `inData '${inData}' is of type '${qtools.toType(
					inData
				)}', not a valid type for conversion to a helix record, ie, object or array`;
				break;
		}
	};

	const jsObjectToHxTabSeparated = function(
		schema,
		mapping,
		inData,
		fieldSeparator = '\t',
		destination
	) {
		schema = schema || [];
		var outString = '',
			workingMappingFunction;

		for (
			var fieldSequencePosition = 0, len = schema.length;
			fieldSequencePosition < len;
			fieldSequencePosition++
		) {
			var fieldName = schema[fieldSequencePosition],
				workingMappingFunction;

			const mappingFunctionName = mapping[fieldName]
				? mapping[fieldName]
				: 'StringType';

			if (typeof mappingFunctionName == 'function') {
				workingMappingFunction = mappingFunctionName;
			} else if (typeof mappingFunctionName == 'string') {
				if (typeof self[mappingFunctionName] == 'function') {
					workingMappingFunction = self[mappingFunctionName];
				} else {
					workingMappingFunction = function() {
						return mappingFunctionName;
					};
				}
			} else {
				workingMappingFunction = function(a) {
					return a;
				};
			}

			if (typeof inData == 'object') {
				var result = workingMappingFunction(inData[fieldName], destination);
			} else {
				var result = '';
			}
			outString +=
				(typeof result != 'undefined' ? result : '') + fieldSeparator;
		}
		outString = outString
			.replace(new RegExp(String.fromCharCode(9) + '$'), '')
			.replace(/"/g, '\\"');

		return outString;
	};

	self.helixStringToRecordList = function(schema, rawHelixData) {
		const destination = 'toJson';
		if (!rawHelixData) {
			return rawHelixData;
		}

		const { fieldSequenceList, mapping } = schema;
		const separators = schema.separators ? schema.separators : {};
		const fieldSeparator = separators.field ? separators.field : '\t';
		const recordSeparator = separators.record ? separators.record : '\n';
		const inSchema = [].concat(['helixId'], fieldSequenceList);
		let debugInfo = '';

		if (!rawHelixData.fieldSeparator && rawHelixData.length === 1) {
			return [];
		}

		debugInfo += qtools.dump(
			{
				[`${
					schema.schemaName
				}.fieldList [helixData.helixStringToRecordList]`]: inSchema
			},
			true
		);

		var tmp = rawHelixData
			.replace(new RegExp(`${recordSeparator}+$`, 'g'), '')
			.replace(/record id:(\d+), /g, '$1' + fieldSeparator)
			.replace(/helix record:/g, '');

		var recordStringList = rawHelixData
			.replace(new RegExp(`${recordSeparator}+$`, 'g'), '')
			.replace(/record id:(\d+), /g, '$1' + fieldSeparator)
			.replace(/helix record:/g, '')
			.split(new RegExp(recordSeparator));

		if (!recordStringList[0]) {
			recordStringList = recordStringList.slice(1);
		}

		const recordObjectList = recordStringList.map(item =>
			item
				.replace(new RegExp(`${fieldSeparator}$`), '')
				.split(new RegExp(`${fieldSeparator}`))
		);

		debugInfo +=
			recordObjectList.reduce((debugString, item) => {
				return `${debugString}\n${item.join('| ').replace(/| $/, '')}`;
			}, `\n${schema.schemaName} RECORD OBJECT LIST:\n`) + '\n\n:';

		let outArray = [];
		let mappedData;
		let fieldName;
		let mappingElement;
		let incomingValue;
		debugInfo += `\n${schema.schemaName} RECORD OBJECT LIST:\n`;
		debugInfo += `\n${JSON.stringify(recordObjectList)}\n${''.padEnd(
			50,
			'='
		)}\n`;
		debugInfo += `\n PROCESSING VALUES:\n`;
		for (var i = 0, len = recordObjectList.length; i < len; i++) {
			var elementList = recordObjectList[i];

			var newRecordObject = {};
			for (var j = 0, len2 = inSchema.length; j < len2; j++) {
				fieldName = inSchema[j];
				incomingValue = elementList[j];


				const mappingEntry = mapping[fieldName];
				const mappingElement = self[mappingEntry];

				if (typeof mappingElement == 'function') {
					debugInfo += `\n${fieldName}, ${mappingElement}, ${incomingValue}, ${destination} (???)`;
					mappedData = mappingElement(incomingValue, destination);
				} else if (typeof self[mappingElement] == 'function') {
					debugInfo += `\n${fieldName}, ${mappingElement}, ${incomingValue}, ${destination} (mapping data type found)`;
					mappedData = self[mappingElement](incomingValue, destination);
				} else if (typeof mappingElement != 'undefined') {
					mappedData = mappingElement;
					debugInfo += `\n${fieldName}, ${mappingElement}, ${incomingValue}, ${destination} (mapping constant)`;
				} else {
					debugInfo += `\n${fieldName}, default(StringType), ${incomingValue}, ${destination} (no mapping specified)`;
					mappedData = self.StringType(incomingValue, destination);
				}

				if (typeof mappedData != 'undefined') {
					newRecordObject[fieldName] = mappedData;
				} else {
					debugInfo + `${fieldName} has no value. Property omitted from output`;
				}
			}

			outArray.push(newRecordObject);
			debugInfo += '\n';
		}
		if (qtools.isTrue(schema.debugData) && !schema.internalSchema) {
			const filePath = `/tmp/hxc_DebugInfo_${new Date().getTime()}_${
				schema.schemaName
			}.txt`;
			qtools.logWarn(
				`WRITING debugData info to file: ${filePath} (debugData=true)`
			);
			qtools.writeSureFile(filePath, debugInfo);
		}
		return outArray;
	};

	self.arrayOfRecordsToArrayOfResponseObjects = (
		fieldSequenceList,
		mapping = {},
		data
	) => {
		const destination = 'toJson';
		const outArray = [];
		for (let i = 0, len = data.length; i < len; i++) {
			const recordObject = {};
			const dataArray = data[i];
			for (let j = 0, len2 = dataArray.length; j < len2; j++) {
				const elementName = fieldSequenceList[j];
				recordObject[elementName] = mapping[elementName]
					? self[mapping[elementName]](dataArray[j], destination)
					: dataArray[j];
			}
			outArray.push(recordObject);
		}
		return outArray;
	};

	self.remoteControlConversionList = {};
	self.remoteControlConversionList.stringToJson = (
		conversionArgs,
		result,
		callback
	) => {
		const recordSep = conversionArgs.parameters.recordSep || '\n';
		const fieldSep = conversionArgs.parameters.fieldSep || '\t';
		const outData = result
			.split(recordSep)
			.map(item => item.split(fieldSep))
			.filter(item => item.join());
		callback('', outData);
	};
	self.remoteControlConversionList.receiveJson = (
		conversionArgs,
		result,
		callback
	) => {
		let outData;
		try {
			outData = JSON.parse(result);
		} catch (e) {
			callback('', e);
			return;
		}
		callback('', outData);
	};
	self.remoteControlConversionList.cleanToJson = (
		conversionArgs,
		result,
		callback
	) => {
		if (!result) {
			callback('', {
				error: `data source provide no result (${typeof result}).`
			});
			return;
		}

		let outData;
		const cleanString = result
			.replace(/^\"/, '')
			.replace(/(]|})[^\}\]]*$/, '$1')
			.replace(/\\/g, '');
		try {
			outData = JSON.parse(cleanString);
		} catch (e) {
			callback('', e);
			return;
		}

		callback('', outData);
	};

	//INITIALIZATION ====================================
	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

