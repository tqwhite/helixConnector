'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtSelectProperties';
		const description = `operand.qtSelectProperties(value) create snew objects (or list of objects) containing only the enumerated properties. Allows defaults to be supplied for missing properties. If an enumerated property name does not exist at all, a property with the default value is created.`;
		const supportedTypeList = [Array, Object];

		const method = () =>
			function(keepers, options = {}) {
				
				const {
					moreDefaultValues = {},
					omitUndefined = true,
					excludeMode = false
				} = options;

				if (!(keepers instanceof Object)) {
					throw new Error(
						'qtSelectProperties() argument one must be instance of Object or Array'
					);
				}

				let inclusions = keepers;
				let defaultValues = {};
				if (!(keepers instanceof Array)) {
					inclusions = Object.keys(keepers);
					defaultValues = keepers;
				}
				
				Object.keys(moreDefaultValues).forEach(
					name => (defaultValues[name] = moreDefaultValues[name])
				);

				const selectingFunction = currentObject => {
					const getDefault = (currentObject, keeperName) =>
						typeof defaultValues[keeperName] == 'function'
							? defaultValues[keeperName](currentObject.qtClone(), keeperName)
							: defaultValues[keeperName];

					// defaultFunction=(currentObject, elementName)=>{}

					let outObj = {};

					if (!excludeMode) {
						inclusions.forEach(keeperName => {
							const newValue =
								typeof currentObject[keeperName] != 'undefined'
									? currentObject[keeperName]
									: getDefault(currentObject, keeperName);
							if (typeof newValue != 'undefined' || !omitUndefined) {
								outObj[keeperName] = newValue;
							}
						});
					} else {
						outObj = currentObject;
						inclusions.forEach(keeperName => {
							if (typeof (outObj[keeperName] == 'undefined')) {
								delete outObj[keeperName];
							}
						});
					}

					return outObj;
				};
				

				if (this instanceof Array) {
					return this.map(item => selectingFunction(item));
				} else {
					return selectingFunction(this);
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
