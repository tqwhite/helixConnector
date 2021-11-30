'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args={}) {
	const {commonFunctions}=args;

// console.log("['a', 'b'].qtToString()="+['a', 'b'].qtToString()+" [config-command-line-manager.js.moduleFunction]");


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
	
	
	const workingFunction = function(args) {
	
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
	
	
	}
	
		
	const addToPrototype = (target, workingFunction) => () => {
		if (typeof target.prototype['qtToString'] == 'undefined') {
			Object.defineProperty(target.prototype, 'qtToString', {
				value: workingFunction,
				writable: false,
				enumerable: false
			});
		}
		
		return {
			methods:[`Array.qtToString({prefix='', suffix='', separator=', '})`],
			description:'Like array.join() but with prefix, suffix'
		}
	};
	this.addToPrototype = addToPrototype(Array, workingFunction);
	

};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
