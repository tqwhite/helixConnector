'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtPop';
		const description = `operand.qtPop() pops with an optional default argument`;
		const supportedTypeList = [Array];

		const method = () =>
			function(defaultValue) {
				const inData = this;
				if (typeof inData.length == 'undefined') {
					throw 'array.qtPop(defaultValue=undefined) works for Arrays only';
				}
				const arrayValue = inData.pop();
				const result =
					typeof arrayValue != 'undefined' ? arrayValue : defaultValue;
				return result;
			};

		const test = args => {
			return require('./test.js')({
				...args,
				...{
					moduleName: module.id.replace(module.path, '')
				}
			});
		};

		return {
			methodName,
			description,
			supportedTypeList,
			method,
			test
		};
	};
	//second method definition function ==========================
	const secondMethodFunction = commonFunctions => {
		const methodName = 'qtLast';
		const description = `operand.qtLast() return last element but leave it on stack) with an optional default argument`;
		const supportedTypeList = [Array];

		const method = () =>
			function(defaultValue) {
				const inData = this;
				if (typeof inData.length == 'undefined') {
					throw 'array.qtLast(defaultValue=undefined) works for Arrays only';
				}
				const arrayValue = inData.length?inData[inData.length-1]:void('');
				const result =
					typeof arrayValue != 'undefined' ? arrayValue : defaultValue;
				return result;
			};

		return {
			methodName,
			description,
			supportedTypeList,
			method
		};
	};
	//third method definition function ==========================
	const thirdMethodFunction = commonFunctions => {
		const methodName = 'qtPush';
		const description = `operand.qtPush(value) pushes to the array and returns the array`;
		const supportedTypeList = [Array];

		const method = () =>
			function(value) {
				const inData = this;
				if (typeof inData.length == 'undefined') {
					throw 'array.qtPush(defaultValue=undefined) works for Arrays only';
				}
				
				inData.push(value);
				return inData;
			};

		const test = args => {
			return require('./test.js')({
				...args,
				...{
					moduleName: module.id.replace(module.path, '')
				}
			});
		};

		return {
			methodName,
			description,
			supportedTypeList,
			method,
			test
		};
	};
	
	const functionObject = new Map(); // prettier-ignore
	const addFunction = definition => {
		const {
			methodName,
			description,
			supportedTypeList,
			method,
			test
		} = definition;
		functionObject.set(methodName, {
			description,
			supportedTypeList,
			method,
			test: args => {
				return require('./test.js')({
					...args,
					...{
						moduleName: module.id.replace(module.path, '')
					}
				});
			}
		});
	};
	
	addFunction(firstMethodFunction());
	addFunction(secondMethodFunction());
	addFunction(thirdMethodFunction());

	this.addToPrototype = addToPrototypeActual(functionObject);
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
