'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtGetByProperty';
		const description = `objectArray.getByProperty('path.into.objects[3].property', 'matchValue', 'optionalDefault') returns array of elements with path value==match value or default`;
		const supportedTypeList = [Object];

		const method = () =>
			function(
		propertyName,
		propertyValue,
		defaultValue
	) {
	
		const inData=this;
		const isRegExp = propertyValue instanceof RegExp;
		let outList = [];
		if (inData.length) {
			var len = inData.length;
			var inx = 0;
			for (inx = 0; inx < len; inx++) {
				const item = inData[inx].qtGetSurePath(propertyName);
				if (item == propertyValue || (isRegExp && item.match(propertyValue))) {
					outList.push(inData[inx]);
				}
			}
		} else if (typeof inData == 'object') {
			for (var inx in inData) {
				const item = inData[inx].qtGetSurePath(propertyName);
				if (item == propertyValue || (isRegExp && item.match(propertyValue))) {
					outList.push(inData[inx]);
				}
			}
		}
		
		if (defaultValue && outList.length===0){
			outList=defaultValue;
		}
		
		return outList;
	};

		const functionObject = new Map(); // prettier-ignore
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
		return functionObject;
	};  
	 this.addToPrototype = addToPrototypeActual(
		firstMethodFunction(commonFunctions)
	);
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
