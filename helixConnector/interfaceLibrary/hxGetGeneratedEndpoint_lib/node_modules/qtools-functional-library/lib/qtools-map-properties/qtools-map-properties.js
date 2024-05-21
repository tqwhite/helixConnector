'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtMapProperties';
		const description = `operand.qtMapProperties() transforms and adds properties to a javascript object or array of objects`;
		const supportedTypeList = [Array, Object];

		const method = () =>
			function(mappings = {}, options = {}) {
				const mappingFunction = item => {
					const outObj = item.qtClone();
					const originalThis = item.qtClone();

					// mappingElementFunction=(item, name, entire)=>{}; //note: synthetic elements have item==undefined

					Object.keys(mappings).forEach(name => {
						if (typeof mappings[name] == 'function') {
							outObj[name] = mappings[name](
								originalThis[name],
								name,
								originalThis
							);
						} else {
							outObj[name] = mappings[name];
						}
					});
					return outObj;
				};

				
				
				if (this instanceof Array) {
					return this.map(item => mappingFunction(item));
				} else {
					return mappingFunction(this);
				}
				
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

	this.addToPrototype = addToPrototypeActual(functionObject);
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
