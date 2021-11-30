'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	const cloneObject=function(func) {
		const inObj=this;
		let convertFunction =
			typeof func == 'function'
				? func
				: function(inData) {
						return inData;
					};

		if (
			['string', 'number', 'boolean', 'undefined'].indexOf(typeof inObj) > -1 ||
			inObj === null
		) {
			return convertFunction(inObj);
		}

		if (commonFunctions.toType(inObj) == 'null') {
			return convertFunction(inObj);
		}

		if (!newObj) {
			if (commonFunctions.toType(inObj) == 'array') {
				var newObj = [];
			} else {
				var newObj = {};
			}
		}

		if (commonFunctions.toType(inObj) != 'array') {
			for (var i in inObj) {
				//I rescinded the numericToArray() prototype function that required this.
				// 				if (typeof(inObj.hasOwnProperty)=='function' && !inObj.hasOwnProperty(i)){
				// 					continue;
				// 				}
				if (inObj[i] !== null && typeof inObj[i] == 'object') {
					switch (inObj[i].constructor) {
						case Date:
							newObj[i] = convertFunction(new Date(inObj[i].toString()));
							break;
						default:
							newObj[i] = inObj[i].qtClone(func);
							break;
					}
				} else {
					newObj[i] = convertFunction(inObj[i]);
					//console.log("OO inObj[i]="+inObj[i]);
				}
			}
		} else {
			for (var i = 0, len = inObj.length; i < len; i++) {
				if (commonFunctions.toType(inObj[i]) == 'object') {
					newObj[i] = inObj[i].qtClone(func);
				} else {
					newObj[i] = convertFunction(inObj[i]);
					//console.log("AA inObj[i]="+inObj[i]);
				}
			}
		}

		return newObj;
	};
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore
		
		const methodName = 'qtClone';
		const description = `Deep clone of JS object for pass by value`;
		const supportedTypeList = [Object, Array];

		const method = () =>cloneObject;

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
