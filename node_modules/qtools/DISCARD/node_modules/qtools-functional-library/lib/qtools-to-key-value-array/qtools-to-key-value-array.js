'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore

		const methodName = 'qtToKeyValueArray';
		const description = `[Object|Set|Map].${methodName} Converts to an array of {key:'keyName', value:'value'} pairs. A Set does not have a key property.`;
		const supportedTypeList = [Object, Map, Set];

		const method = () =>
			function(arg) {
				if (!commonFunctions.isSupportedType(this, supportedTypeList)) {
					// prettier-ignore
					throw new Error(
						`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`
					);
				}

				const outArray = [];

				switch (commonFunctions.toType(this)) {
					case 'object':
						for (var i in this) {
							if (!this.hasOwnProperty(i)) {
								continue;
							}
							var element = this[i];
							outArray.push({ key: i, value: element });
						}

						break;
					case 'map':
						this.forEach((item, inx) =>
							outArray.push({ key: inx, value: item })
						);
						break;
					case 'set':
						this.forEach(item => outArray.push({ value: item }));
						break;
					default:
						// prettier-ignore
						throw new Error(
							`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`
						);
						break;
				}

				return outArray;
			};

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
