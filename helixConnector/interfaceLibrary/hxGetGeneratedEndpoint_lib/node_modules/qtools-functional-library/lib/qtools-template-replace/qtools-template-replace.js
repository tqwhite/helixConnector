'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;

	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);

	const baseReplacementFunction = (replaceObject, template, options) => {
		const { transformations = {}, leaveUnmatchedTagsIntact = true } = options;

		replaceObject = replaceObject.qtClone().qtMerge(transformations);

		const tmp = template.match(/<!.*?!>/g);

		const tags =
			commonFunctions.toType(tmp) == 'array'
				? tmp.map(item => item.replace(/<!(.*?)!>/, '$1'))
				: [];

		const outString = tags.reduce((result, tag) => {
			let replacement = replaceObject.qtGetSurePath(tag);

			if (typeof replacement == 'undefined' && leaveUnmatchedTagsIntact) {
				return result;
			} else if (typeof replacement == 'undefined') {
				replacement = '';
			}

			return result.replace(
				`<!${tag}!>`,
				typeof replacement == 'function'
					? replacement(replaceObject)
					: replacement
			);
		}, template);

		return outString;
	};
	
	// prettier-ignore
	const objectCallsString = (item, arg) => item instanceof Object && typeof arg == 'string';
	// prettier-ignore
	const arrayOfObjectsCallsString = (item, arg) => item instanceof Array && typeof arg == 'string' && item.filter(item => item instanceof Object).qtPop(true);
	// prettier-ignore
	const stringCallsObject = (item, arg) => arg instanceof Object && typeof item == 'string';
	// prettier-ignore
	const arrayOfStringsCallsObject = (item, arg) => arg instanceof Object && item instanceof Array && item.filter(item => typeof item == 'string').qtPop(false) ? true : false;

	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore

		const methodName = 'qtTemplateReplace';
		const description = `object.qtTemplateReplace(string), arrayOfObjects.qtTemplateReplace(string), string.qtTemplateReplace(object), arrayOfStrings.qtTemplateReplace(object)`;
		const supportedTypeList = [Array, Object, String];

		const method = () =>
			function(arg, options = {}) {
				//if one of the supportedTypeList elements is Object, basically all data types will have this method and type checking is important.
				if (!commonFunctions.isSupportedType(this, supportedTypeList)) {
					// prettier-ignore
					throw new Error(`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`);
				}

				if (arrayOfStringsCallsObject(this, arg)) {
					return this.map(item => baseReplacementFunction(arg, item, options));
				} else if (arrayOfObjectsCallsString(this, arg)) {
					return this.map(item => baseReplacementFunction(item, arg, options));
				} else if (objectCallsString(this, arg)) {
					return baseReplacementFunction(this, arg, options);
				} else if (stringCallsObject(this, arg)) {
					return baseReplacementFunction(arg, this, options);
				}

				throw new Error(
					`${methodName}(): unsupported data combination. Accepts object.qtTemplateReplace(string), arrayOfObjects.qtTemplateReplace(string), string.qtTemplateReplace(object), arrayOfStrings.qtTemplateReplace(object)`
				);
			};

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
