'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore
		
		const methodName = 'qtTemplateMethod';
		const description = `placeholder`;
		const supportedTypeList = [Array, String, Number];

		const method = () =>
			function(arg) {
				//if one of the supportedTypeList elements is Object, basically all data types will have this method and type checking is important.
				if (!commonFunctions.isSupportedType(this, supportedTypeList)) {
					// prettier-ignore
					throw new Error(
						`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`
					);
				}

				return this.toString() + ` : ${arg}`;
			};

		functionObject.set(methodName, {
			description,
			supportedTypeList,
			method,
			test: (args) =>
{
				return require('./test.js')({...args, ...{
					moduleName: module.id.replace(module.path, '')
				}})
				}
		});
		
		const placeholder=input=>input+'morePlaceholder';

		functionObject.set('qtTemplateMethod2', {
			description: `placeholder`,
			supportedTypeList: [String],
			method: () => placeholder,
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
