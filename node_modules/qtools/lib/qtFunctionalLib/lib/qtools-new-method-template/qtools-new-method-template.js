'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtTemplateMethod';
		const description = `operand.qtTemplateMethod('some string') converts 'source' to string and appends argument. This method serves only as a template for creating new qtLib methods.`;
		const supportedTypeList = [String, Number];
		
		
		
		const method = () =>
			function(arg) {
			
				//if one of the supportedTypeList elements is Object, basically all data types will have this method and type checking is important.
				if (!commonFunctions.isSupportedType(this, supportedTypeList)) {
					// prettier-ignore
					throw new Error(
						`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`
					);
				}
				
				return this.toString() + `_${arg}`;
			};
			
			
			

		const functionObject = new Map(); // prettier-ignore
		functionObject.set(methodName, { description, supportedTypeList, method });
		return functionObject;
	};




	this.addToPrototype = addToPrototypeActual(
		firstMethodFunction(commonFunctions)
	);
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
