const commonFunctions = {
	universalAddToPrototype: (commonFunctions, functionObject) => {
		let methods = [];
		let documentation = [];
		let methodName;
		let testList = [];
		functionObject.forEach((functionItem, inx) => {
			methodName = inx;

			const supportedTypeList = functionItem.supportedTypeList
				.map(item => item.toString().replace(/^function (.*?)\(.*$/, '$1'))
				.join(', ')
				.replace(/, $/, '');

			if (functionItem.test && typeof functionItem.test == 'function') {
				testList.push({ methodName, test: functionItem.test });
			}

			methods.push(methodName);
			documentation.push({
				name: methodName,
				description: `${methodName}: ${functionItem.description}`,
				supportedTypeList
			});

			functionItem.supportedTypeList.forEach(target => {
				if (typeof target.prototype[methodName] == 'undefined') {
					Object.defineProperty(target.prototype, methodName, {
						value: functionItem.method(commonFunctions),
						writable: false,
						enumerable: false
					});
				}
			});
		});
		const testActual=methodName=>(args) => {
			const tmp = testList.reduce((passingTests, testItem, inx) => {

				if (typeof(args.methodList)!='undefined' && args.methodList.length>0 && !args.methodList.includes(methodName)){
					return true;
				}

				const result=passingTests && testItem.test(args) ? true : false;


				if (args.listTests){
					console.log(`${methodName} ${result?'passed':'failed'}`);
				}
				
				return result //calls test method passed from functional module
			}, true);
			return tmp;
		};
		
		
		const test = testActual(methodName);

		return {
			methods,
			documentation,
			test
		};
	},

	callerName: (calledFromQtLib = false, options={}) => {
		if (typeof(options)!='object'){
			throw(`qtools-functional-library.js internal error: options must be an object, got '${options}'`);
		}
		options.suffixCallStackDepth=options.suffixCallStackDepth?options.suffixCallStackDepth:3;
	

		const index = calledFromQtLib ? options.suffixCallStackDepth : 2; //the 1 might need adjusting once this is made available to applications
		return new Error().stack
			.split(/\n/)[index]
			.trim()
			.replace(/at new moduleFunction/, "called from")
			.replace(/Object\.<anonymous>/, 'not_in_function');
	},

	toType: function(obj) {
		
		if (obj instanceof Map) {
			return 'map';
		}
		if (obj instanceof Set) {
			return 'set';
		}

		if (typeof obj == 'string') {
			return 'string';
		}

		if (typeof obj == 'number') {
			return 'number';
		}

		if (typeof obj == 'obj' && typeof length == 'number') {
			return 'array';
		}
		
		if (obj === null) {
			return 'null';
		}

		if (typeof obj == 'undefined') {
			return 'undefined';
		}

		if (typeof obj == 'string') {
			return 'string';
		}

		return {}.toString
			.call(obj)
			.match(/\s([a-z|A-Z]+)/)[1]
			.toLowerCase();
	},

	byObjectProperty: function(fieldName, transformer) {
		//called: resultArray=someArray.sort(qtools.byObjectProperty('somePropertyName'));
		//based on closure of fieldName
		var fullNameSort;
		return (fullNameSort = function(a, b) {
			var localFieldName = fieldName;
			var localTransformer = transformer;
			//for debug
			if (typeof fieldName == 'function') {
				var aa = a;
				var bb = b;
				transformer = fieldName;
			} else {
				var aa = a.qtGetSurePath(fieldName);
				var bb = b.qtGetSurePath(fieldName);
			}

			if (typeof transformer == 'function') {
				aa = transformer(aa);
				bb = transformer(bb);
			} else if (transformer) {
				switch (transformer) {
					case 'caseInsensitive':
						aa = aa.toLowerCase();
						bb = bb.toLowerCase();
						break;
					default:
						console.log(
							'qt.byObjectProperty says, No such transformer as: ' + transformer
						);
						break;
				}
			}

			if (!bb && !aa) {
				return 0;
			}
			if (!bb) {
				return -1;
			}
			if (!aa) {
				return 1;
			}

			if (aa > bb) {
				return 1;
			}
			if (aa < bb) {
				return -1;
			}
			return 0;
		});
	},
	
	
	isSupportedType: (input, supportedTypeList) =>
		supportedTypeList.reduce((result, supportedTypeItem) => {
			return (
				result || Object.getPrototypeOf(input) === supportedTypeItem.prototype
			); //instoanceof does not work for strings and numbers
		}, false)
};

// Array.prototype.remove = function(from, to) {
// 	var rest = this.slice((to || from) + 1 || this.length);
// 	this.length = from < 0 ? this.length + from : from;
// 	return this.push.apply(this, rest);
// };

String.prototype.toCamelCase = function(delimiter, pascalCase) {
	var firstCharFunction = pascalCase
		? function(v) {
				return v.toUpperCase();
			}
		: function(v) {
				return v.toLowerCase();
			};
	delimiter = delimiter ? delimiter : ' ';
	return this.split(delimiter)
		.map(function(word) {
			var first = word.substring(0, 1);
			word = word.replace(new RegExp(first), first.toUpperCase());
			return word;
		})
		.join('')
		.replace(/^(.)/, firstCharFunction);
};

const docList = [];
const testList = [];

const addMorePrototypes = () => {
	const fs = require('fs');
	const path = require('path');
	const libDir = path.join(path.dirname(module.filename), 'lib');
	const dirList = fs.readdirSync(libDir);

	dirList.forEach(item => {
		if (item.match(/^qtools/)) {
			const moduleGen = require(path.join(libDir, item));
			const module = new moduleGen({ commonFunctions });
			const result = module.addToPrototype();
			result.documentation && docList.push(result.documentation);
			result.test && testList.push(result.test);
		}
	});
};

addMorePrototypes();

const helpActual = docList => (queryString = '') => {
	//someday turn this into a report instead of a JSON dump, add support for item.suppressHelpListing for qtLog_AddCallableMethods
	let outList;
	if (!queryString) {
		outList = docList;
	} else {
		outList = docList.filter(item => {
			const regex = new RegExp(queryString, 'i');
			const result = JSON.stringify(item).match(regex);
			return result;
		});
	}
	// 	const util=require('util');
	// 	util.inspect(docList, { depth: null, maxArrayLength: null }).qtDump('qtFuncionalLib Documentation');
	return outList;
};

const testActual = testList => (args={}) => {
	return testList.reduce((result, test) => {
		if (typeof test == 'function') {
			result = test(args) && result; //executes the framework testItem.test() above
		}
		return result;
	}, true);
};

commonFunctions.qtLog_AddCallableMethods("what part of 'not for civilian use' is unclear?");

commonFunctions.help = helpActual(docList);
commonFunctions.test = testActual(testList);
module.exports = commonFunctions;

