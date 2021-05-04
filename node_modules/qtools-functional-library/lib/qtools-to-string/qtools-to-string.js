'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	
	//first method definition function ==========================
	
	
const toType = function(obj) {
		if (obj === null) {
			return 'null';
		} else if (typeof obj == 'undefined') {
			return 'undefined';
		} else {
			return {}.toString
				.call(obj)
				.match(/\s([a-z|A-Z]+)/)[1]
				.toLowerCase();
		}
	};
	
	
	const firstMethodFunction = commonFunctions => {
		const methodName = 'qtToString';
		const description = `operand.qtTemplateMethod('some string') converts 'source' to string and appends argument. This method serves only as a template for creating new qtLib methods.`;
		const supportedTypeList = [Array];

		const method = () =>
			function(arg) {
	
	switch(toType(this)){
	
		case 'array':
			let separator=', '
			let suffix='';
			let prefix='';
			if (typeof(args)=='string'){
				separator=args;
			}
			else if (typeof(args)=='object'){
				separator=args.separator?args.separator:separator;
				suffix=args.suffix?args.suffix:suffix;
				prefix=args.prefix?args.prefix:prefix;
			}
			else if (typeof(args)!='undefined') {
				throw `qtToString() says, string or {separator:'xxx'} are only valid arguments`
			}
			const tmp=this.join(separator).replace(new RegExp(`${separator}$`), '');
			return `${prefix}${tmp}${suffix}`;
		break;
		default:
			return this.toString();
		}
	
	
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
