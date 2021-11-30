'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args={}) {
	//const {commonFunctions}=args;

// console.log("['ax', 'bb'].qtIncludesRegex(/x/)="+['ax', 'bb'].qtIncludesRegex(/x/)+" [config-command-line-manager.js.moduleFunction]");



	const workingFunction = function(needle) {
		if (needle instanceof RegExp) {
			let found = false;
			this.forEach(item => {
				found = (found || item.match(needle))?true:false;
			});
			return found;
		} else {
			return this.includes(needle);
		}
	};

	
	const addToPrototype = (target, workingFunction) => () => {
		if (typeof target.prototype['qtIncludesRegex'] == 'undefined') {
			Object.defineProperty(target.prototype, 'qtIncludesRegex', {
				value: workingFunction,
				writable: false,
				enumerable: false
			});
		}
		
		return {
			methods:['qtIncludesRegex(RegExp)'],
			description:`returns true if element.match(RegExp)==true for any element`,
			test:(logErrors=false)=>require('./test.js')(logErrors),
		}
	};
	this.addToPrototype = addToPrototype(Object, workingFunction);
	
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
