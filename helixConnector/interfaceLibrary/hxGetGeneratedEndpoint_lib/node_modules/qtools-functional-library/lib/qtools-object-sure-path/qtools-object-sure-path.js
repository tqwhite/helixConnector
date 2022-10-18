'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	

		let getDottedPathLastProgressiveString = ''; //needed for recursive function
		let putDottedPathLastProgressiveString=''; //needed for recursive function
	
		function qtGetSurePath(dottedPathString, defaultReturn) {
			var baseObj = this;
			var target = this;
			var elements;
			
			if (typeof(dottedPathString)!='string'){
				console.trace();
				throw `qtGetSurePath() says, dottedPathString argument is ${typeof(dottedPathString)}, must be of type string`;
			}
			
			if (dottedPathString==''){
				return defaultReturn;
			}

			if (baseObj == null) {
				if (
					typeof defaultReturn != 'undefined' &&
					typeof target == 'undefined'
				) {
					return defaultReturn;
				} else {
					return;
				}
			}
			if (dottedPathString.toString().match(/\.|\[/)) {
				var elements = dottedPathString.split(/\.|\[(.*?)]/);
			} else {
				var elements = [];
				elements.push(dottedPathString);
			}

			if (!dottedPathString) {
				return baseObj;
			}

			if (elements.length < 2) {
				if (
					typeof defaultReturn != 'undefined' &&
					typeof baseObj[dottedPathString] == 'undefined'
				) {
					return defaultReturn;
				}
				return baseObj[dottedPathString];
			} else {
				for (var i = 0, len = elements.length; i < len; i++) {
					if (elements[i]) {
						//mainly eliminates trailing periods but would also eliminates double periods and other regex anomalies
						target = target[elements[i]];

						getDottedPathLastProgressiveString += elements[i] + '.';
						if (typeof target == 'undefined' || target === '') {
							if (
								typeof defaultReturn != 'undefined' &&
								(typeof target == 'undefined' || target === '')
							) {
								return defaultReturn;
							}

							return;
						}
					}
				}
			}

			return target;
		}
		
		function qtPutSurePath(dottedPathString, value, preserveExisting) {
			var baseObj = this;
			var elements;
			var intermediate;
			var propName;
			putDottedPathLastProgressiveString = '';

			preserveExisting =
				typeof preserveExisting != 'undefined' ? preserveExisting : false;

			if (baseObj == null) {
				throw 'qtGetDottedPath() says, baseObj cannot be nullx ' +
					dottedPathString;
			}
			if (dottedPathString.toString().match(/\.|\[/)) {
				var elements = dottedPathString.split(/\.|(\[.*?)]/);
			} else {
				var elements = [];
				elements.push(dottedPathString);
			}

			if (!dottedPathString) {
				return baseObj;
			}
			if (dottedPathString.match(/(__proto__|constructor|prototype)/)){
				return baseObj; //avoid prototype pollution
			}

			if (elements.length < 2) {
				baseObj[dottedPathString] = value;
			} else {
				intermediate = baseObj;
				for (var i = 0, len = elements.length; i < len; i++) {
					if (elements[i]) {
						//mainly eliminates trailing periods but would also eliminates double periods and other regex anomalies
						propName = elements[i];

						if (elements[i + 1] && elements[i + 1].replace(/^\[/)) {
							elements[i + 1] = elements[i + 1].replace(/^\[/, '');
							var nextElement = [];
							var nextElementType = 'array';
						} else {
							var nextElement = {};
							var nextElementType = 'object';
						}

						if (propName) {
							//ignore trailing and redundant dots
							if (
								commonFunctions.toType(intermediate[propName]) !=
								nextElementType
							) {
								intermediate[propName] = nextElement;
							} else if (preserveExisting) {
								throw "'preserveExisting' flag is set, found non-object in path: " +
									propName +
									' in ' +
									dottedPathString;
							}

							intermediate = intermediate[propName];
						}
					}
				}

				intermediate = baseObj;
				for (var i = 0, len = elements.length; i < len - 1; i++) {
					if (elements[i]) {
						//mainly eliminates trailing periods but would also eliminate double periods
						propName = elements[i];
						intermediate = intermediate[propName];
					}
				}

				intermediate[elements[len - 1]] = value;
			}
			return baseObj;
		}
		

	
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore
		
		functionObject.set('qtGetSurePath', {
			description: `({}).qtGetSurePath('path.to.something', defaultValue) retrieves the value at the end of the dotted path. It does not crash in an intermediate path element is undefined. If it is, qtGetSurePath() returns either undefined or defaultValue`,
			supportedTypeList: [Object],
			method: () => qtGetSurePath,
			test: args => {
				return require('./test.js')({
					...args,
					...{
						moduleName: module.id.replace(module.path, '')
					}
				});
			}
		});
		
		functionObject.set('qtPutSurePath', {
			description: `({}).qtPutSurePath('path.to'value', valueToBePut, preserveExisting) injects a value into an object by creating, if necessary, any intermediary objects to complete the path. If preserveExisting==true, nothing is placed if a value is already present.`,
			supportedTypeList: [Object],
			method: () => qtPutSurePath,
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
