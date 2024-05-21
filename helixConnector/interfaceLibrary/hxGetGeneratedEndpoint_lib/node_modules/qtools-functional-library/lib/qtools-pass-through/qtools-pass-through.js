'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function (args = {}) {
	const { commonFunctions } = args;

	const addToPrototypeActual = (functionObject) => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);

	//first method definition function ==========================
	const firstMethodFunction = (commonFunctions) => {
		const functionObject = new Map(); // prettier-ignore

		const methodName = 'qtPassThrough';
		const description = `executes a supplied function; 'this' is the only parameter; if supplied function returns a value, it is returned, else 'this' is returned.`;
		const supportedTypeList = [Object, Array, String, Number, Boolean, Date];

		const method = () =>
			function (utilityFunction) {
				//if one of the supportedTypeList elements is Object, basically all data types will have this method and type checking is important.
				if (!commonFunctions.isSupportedType(this, supportedTypeList)) {
					// prettier-ignore
					throw new Error(
						`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`
					);
				}

				const utilityResult = utilityFunction(this);
				if (utilityResult!=undefined) {
					return utilityResult;
				} else {
					return this;
				}
			};

		functionObject.set(methodName, {
			description,
			supportedTypeList,
			method,
			test: (args) => {
				return require('./test.js')({
					...args,
					...{
						moduleName: module.id.replace(module.path, ''),
					},
				});
			},
		});

		return functionObject;
	};
	this.addToPrototype = addToPrototypeActual(
		firstMethodFunction(commonFunctions),
	);

};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
