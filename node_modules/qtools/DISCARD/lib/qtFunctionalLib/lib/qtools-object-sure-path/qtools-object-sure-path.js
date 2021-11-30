'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args={}) {
	const {commonFunctions}=args;

	let getDottedPathLastProgressiveString = ''
	let putDottedPathLastProgressiveString='';

	const addToPrototype = () => () => {
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
		

		if (typeof Object.prototype.qtGetSurePath == 'undefined') {
			Object.defineProperty(Object.prototype, 'qtGetSurePath', {
				value: qtGetSurePath,
				writable: false,
				enumerable: false
			});
		}

		if (typeof Object.prototype.qtPutSurePath == 'undefined') {
			Object.defineProperty(Object.prototype, 'qtPutSurePath', {
				value: qtPutSurePath,
				writable: false,
				enumerable: false
			});
		}

		return {
			methods: ['Object.qtPutSurePath(dottedPathString, value, preserveExisting)',
			'Object.qtGetSurePath(dottedPathString, defaultReturn)'],
			description: `Adds or retrievs property from object. Does not error if path is not complete. Creates properties if needed. Get returns default value if one is supplied. preserveExisting throws error if non-object found in path.`
		};
	};
	this.addToPrototype = addToPrototype();
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
