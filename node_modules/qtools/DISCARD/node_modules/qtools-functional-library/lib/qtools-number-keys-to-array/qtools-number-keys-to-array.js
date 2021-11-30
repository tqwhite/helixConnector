'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtNumberKeysToArray';
		const description = `object.${methodName}({collapseHoles=true, omitNonNumeric=false, throwErrorIfNonNumeric=false})`;
		const supportedTypeList = [Object];
		
		const baseConversion=function(inData, args={}) {
				const { collapseHoles = true, omitNonNumeric = false, throwErrorIfNonNumeric=false } = args;
				if (typeof inData.length != 'undefined') {
					return inData;
				}

				var outArray = [];
				var workingArray = [];
				const extraElements = [];
				let maxIndex = 0;
				
				let naturalIndex = 0;
				
				for (var i in inData) {
					if (!inData.hasOwnProperty(i)) {
						continue;
					}

					var element = inData[i];

					if (isNaN(+i)) {
						extraElements.push({
							key: i,
							value: element
						});
						if(throwErrorIfNonNumeric){
							throw `throwErrorIfNonNumeric set true, non-numeric key '${i}' not allowed`;
						}
						continue;
					}

					if (collapseHoles) {
						workingArray[naturalIndex] = element;
						naturalIndex++;
					} else {
						workingArray[i] = element;
						maxIndex = Math.max(maxIndex, i);
					}
					
				}
				
				if (!collapseHoles) {
					
					for (var i = 0; i < maxIndex + 1; i++) {
						outArray.push(
							typeof workingArray[i] != 'undefined' ? workingArray[i] : void ''
						);
					}
					
				} else {
					outArray = workingArray;
				}
				
				if (!omitNonNumeric) {
					for (var i = 0, len = extraElements.length; i < len; i++) {
						outArray.push(extraElements[i]);
					}
				}

				return outArray;
			};

		const method = () => function(args={}){
		if (args.shallow){
			return baseConversion(this, args)
		}
		
		if (
			typeof this != 'object' ||
			typeof this.length != 'undefined' ||
			this == null
		) {
			return this;
		}
		const keys = Object.keys(this);
		 for (var i in this) {
			if (!this.hasOwnProperty(i)) {
				continue;
			}
			this[i] = this[i].qtNumberKeysToArray(args);
		}
		const isNumeric = keys.filter(item => !isNaN(+item)).length ? true : false;
		if (!isNumeric) {
			return this;
		}
			return baseConversion(this, args)
	
		
		}
			

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
