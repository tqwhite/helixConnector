'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtIncludesRegex';
		const description = `qtIncludesRegex(RegExp): returns true if element.match(RegExp)==true for any element`;
		const supportedTypeList = [Object];

		const method = () =>
			function(needle) {
				if (needle instanceof RegExp) {
					const haystack = this;
					let found = false;
					haystack.forEach(item => {
						found = found || item.match(needle) ? true : false;
					});
					return found;
				} else {
					return haystack.includes(needle);
				}
			};

		const functionObject = new Map(); // prettier-ignore
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
		return functionObject;
	};
	this.addToPrototype = addToPrototypeActual(
		firstMethodFunction(commonFunctions)
	);
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
