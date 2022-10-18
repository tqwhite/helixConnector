'use strict';
const util = require('util');
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;

	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);

	function qtDump(args = {}) {
		const inData = this;
		let label = '';
		let returnString = false;
		let addSeparators = false;
		let outputFunction;
		let noSuffix = false; //suppresses suffix if true
		let callerName = commonFunctions.callerName(true);
		let separator = '';
		let returnn = '';
		let showLabel = '';
		let suffix = '';
		let cancelDump = args.cancelDump ? args.cancelDump : false;
		
		if (cancelDump){
			return this;
		}
		
		const recursionDepth =
			typeof args.recursionDepth != 'undefined' ? args.recursionDepth : null;
		const addCliColors =
			typeof args.addCliColors != 'undefined' ? args.recursionDepth : true;

		if (typeof args == 'object') {
			label = args.label ? args.label : '';
			returnString = args.returnString ? args.returnString : false;
			addSeparators = args.addSeparators ? args.addSeparators : false;
			noSuffix = args.noSuffix ? args.noSuffix : false;
			callerName = commonFunctions.callerName(true);
			separator = addSeparators ? '\n--------\n' : '';
			returnn = addSeparators ? '\n' : ' ';
			showLabel = label.replace(/\n/g, '');
			suffix = noSuffix ? '' : ` [${returnn}[${callerName}]${separator}]`;
			outputFunction = args.outputFunction
				? args.outputFunction
				: console.error;
		} else if (typeof args == 'string') {
			label = args;
			showLabel = label.replace(/\n/g, '');
		}

		if (['string', 'number', 'boolean'].includes(typeof this)) {
			if (returnString) {
				return `${this}${suffix}`;
			} else {
				let outString = this;
				let suffixx = '';
				const disassesmbleString = this.match(/(\n*)$/);
				if (disassesmbleString[0]) {
					suffixx = disassesmbleString[0];
					outString = outString.replace(disassesmbleString[0], '');
				}

				outputFunction(
					`${separator}${label ? showLabel + '= ' : ''}${outString} ${suffix}`
				);
			}
		} else if (['function'].includes(typeof this)) {
			if (returnString) {
				return this.toString() + suffix;
			} else {
				outputFunction(
					`${separator}${
						label ? showLabel + `=${returnn}` : ''
					}${returnn}${this}${returnn}${suffix}`
				);
			}
		} else {
			let tmpObject = inData;
			if (label) {
				tmpObject = { [label]: inData };
			}

			if (returnString) {
				return (
					util.inspect(tmpObject, {
						depth: recursionDepth,
						maxArrayLength: null,
						colors: addCliColors
					}) + ` [${suffix}]`
				);
			} else {
				outputFunction(
					`${separator}${label ? showLabel + `:${returnn}` : ''}${util.inspect(
						inData,
						{
							depth: recursionDepth,
							colors: addCliColors
						}
					)} ${suffix}`
				);
				return this;
			}
		}
	}

	function qtListProperties(args = {}) {
		const inObject = this;
		const {
			label = '',
			returnString = false,
			maxShowStringLength = 100
		} = args;

		var outString = label ? `${label}:\n` : '';
		var list = [];
		var count = 0;
		var type = commonFunctions.toType(inObject);

		if (type == 'object' || type == 'arguments') {
			var outList = [];
			for (var i in inObject) {
				var element = inObject[i];
				var hadProperties = true;
				var showElement;
				if (
					['object', 'array', 'function', 'map'].indexOf(
						commonFunctions.toType(element)
					) == -1
				) {
					if (element == null) {
						showElement = 'null'.green;
					} else {
						if (element.length > maxShowStringLength) {
							element =
								element.substr(0, maxShowStringLength) +
								' ... (length=' +
								element.length +
								', use maxShowStringLength)';
						}
						if (returnString) {
							showElement = element.toString();
						} else {
							showElement = element.toString();
						}
					}
					if (returnString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							commonFunctions.toType(element) +
							' value= ' +
							showElement;
					} else {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							commonFunctions.toType(element) +
							' value= ' +
							showElement;
					}
					outList.push({ name: i, string: tmp });
				} else {
					if (returnString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							commonFunctions.toType(element) +
							(commonFunctions.toType(element) == 'array'
								? ` length= ${element.length}`
								: '');
					} else {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							commonFunctions.toType(element) +
							(commonFunctions.toType(element) == 'array'
								? ` length= ${element.length}`
								: '');
					}
					outList.push({ name: i, string: tmp });
				}
				count++;
			}

			outList = outList.sort(commonFunctions.byObjectProperty('name'));

			for (var i = 0, len = outList.length; i < len; i++) {
				var element = outList[i];

				outString += `\t${element.string}\n`;
			}
		} else if (type == 'array') {
			for (var i = 0, len = list.length; i < len; i++) {
				var element = inObject[i];
				var hadProperties = true;

				outString +=
					'item #' +
					count +
					" index '" +
					i +
					' is ' +
					commonFunctions.toType(element) +
					'length= ' +
					element.length +
					'\n';

				count++;
			}
		} else if (type == 'map') {
			var hadProperties = false;
			var outList = [];
			inObject.forEach((element, i, all) => {
				hadProperties = true;

				var showElement;
				if (
					['object', 'array', 'function', 'map'].indexOf(
						commonFunctions.toType(element)
					) == -1
				) {
					if (element == null) {
						showElement = 'null'.green;
					} else {
						if (element.length > maxShowStringLength) {
							element =
								element.substr(0, maxShowStringLength) +
								' ... (length=' +
								element.length +
								')';
						}
						if (returnString) {
							showElement = element.toString();
						} else {
							showElement = element.toString();
						}
					}
					if (returnString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							commonFunctions.toType(element) +
							' value= ' +
							showElement;
					} else {
						var tmp =
							('item #' + count + " named '").grey +
							i.red +
							"' is a ".grey +
							commonFunctions.toType(element).red +
							' value= '.grey +
							showElement;
					}
					outList.push({ name: i, string: tmp });
				} else {
					if (returnString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							commonFunctions.toType(element);
					} else {
						var tmp =
							('item #' + count + " named '").grey +
							i.red +
							"' is a ".grey +
							commonFunctions.toType(element).red;
					}
					outList.push({ name: i, string: tmp });
				}
				count++;
			});

			outList = outList.sort(commonFunctions.byObjectProperty('name'));

			for (var i = 0, len = outList.length; i < len; i++) {
				var element = outList[i];

				outString += `\t${element.string}\n`;
			}
		} else {
			if (!returnString) {
				var message =
					"commonFunctions.listProperties says, input was of not an object or array. It was type '" +
					commonFunctions.toType(inObject) +
					"'";
				console.error(message);
				var hadProperties = true; //don't need no properties message
			}
		}
		if (!hadProperties) {
			if (!returnString) {
				console.error('input had no properties');
			}
		}
		if (!returnString) {
			console.error(outString);
			return this;
		} else {
			return outString;
		}
	}

	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore

		functionObject.set('qtDump', {
			description: `placeholder`,
			supportedTypeList: [Object],
			method: () => qtDump
		});

		functionObject.set('qtListProperties', {
			description: `placeholder`,
			supportedTypeList: [Object],
			method: () => qtListProperties,
			test: args => {
				return require('./test.js')({
					...args,
					...{
						moduleName: module.id.replace(module.path, '')
					}
				});
			}
		});
		return functionObject;
	};
	this.addToPrototype = addToPrototypeActual(
		firstMethodFunction(commonFunctions)
	);
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
