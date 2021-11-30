'use strict';

//START OF moduleFunction() ============================================================

var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	
	const setStart = function(startValue) {
		if (typeof startValue != 'number') {
			throw 'qtNumberIterator.setStart() requires a numeric value';
		}

		if (this instanceof IterationThing) {
			this.startValue = startValue;
			return this;
		}
		return new IterationThing({
			startValue: startValue,
			incrementValue: 1,
			count: this
		});
	};

	const setIncrement = function(incrementValue) {
		if (typeof incrementValue != 'number') {
			throw 'qtNumberIterator.setIncrement() requires a numeric value';
		}

		if (this instanceof IterationThing) {
			this.incrementValue = incrementValue;
			return this;
		}
		return new IterationThing({
			startValue: 0,
			incrementValue: 1,
			count: this
		});
	};

	const iterator = function(callback) {
		let startValue = 0;
		let incrementValue = 1;
		let count = this;

		if (this instanceof IterationThing) {
			startValue = this.startValue;
			count = this.count;
			incrementValue = this.incrementValue;
		}

		const out = [];
		for (let i = 0; i < count; i = i + 1) {
			const currentValue = startValue + i * incrementValue;

			if (typeof callback == 'function') {
				out.push(callback(currentValue, count, startValue, incrementValue));
			} else {
				out.push(currentValue);
			}
		}
		return out;
	};

	function IterationThing(inObj) {
		for (var i in inObj) {
			var element = inObj[i];
			this[i] = element;
		}
	}
	
	if (typeof Number.prototype.qtIterate == 'undefined') {
		Object.defineProperty(IterationThing.prototype, 'qtIterate', {
			value: iterator,
			writable: false,
			enumerable: false
		});

		Object.defineProperty(IterationThing.prototype, 'qtStart', {
			value: setStart,
			writable: false,
			enumerable: false
		});

		Object.defineProperty(IterationThing.prototype, 'qtIncrement', {
			value: setIncrement,
			writable: false,
			enumerable: false
		});

	}
	//atypical pattern !!!
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore
		functionObject.set('qtIterate', {
			description: `count.qtIterate((currentValue, count, startValue, incrementValue)=>{}`,
			supportedTypeList: [Number],
			method: () => iterator
		});

		functionObject.set('qtStart', {
			description: `placeholder`,
			supportedTypeList: [Number],
			method: () => setStart
		});

		functionObject.set('qtIncrement', {
			description: `placeholder`,
			supportedTypeList: [Number],
			method: () => setIncrement,
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

