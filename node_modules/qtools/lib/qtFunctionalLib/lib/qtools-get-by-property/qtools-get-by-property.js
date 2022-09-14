'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args={}) {
	const {commonFunctions}=args;

	const functionObject = new Map();

	functionObject.set('qtGetByProperty', {
		description: `objectArray.getByProperty('path.into.objects[3].property', 'matchValue', 'optionalDefault') returns array of elements with path value==match value or default`,
		supportedTypeList: [Object],
		test:(logErrors=false)=>require('./test.js')(logErrors),

		method: commonFunctions=>function(
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
	}

	});

	//this has commonFunctions twice because I don't want new thing() or to have an extra function to make it available.
	const addToPrototypeActual = functionObject => () => commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	this.addToPrototype = addToPrototypeActual(functionObject);

};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
