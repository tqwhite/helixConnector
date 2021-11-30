'use strict';

//START OF moduleFunction() ============================================================

var moduleFunction = function(args={}) {
	const {commonFunctions}=args;
	
	const addToPrototype = () => {
		const setStart = function(startValue) {

		if (typeof(startValue)!='number'){
			throw("qtNumberIterator.setStart() requires a numeric value");
		}

		if(this instanceof IterationThing){

			this.startValue=startValue;
			return this;

		}
			return new IterationThing({
				startValue: startValue,
				incrementValue:1,
				count: this
			});
		};

		const setIncrement = function(incrementValue) {

		if (typeof(incrementValue)!='number'){
			throw("qtNumberIterator.setIncrement() requires a numeric value");
		}

		if(this instanceof IterationThing){

			this.incrementValue=incrementValue;
			return this;

		}
			return new IterationThing({
				startValue: 0,
				incrementValue:1,
				count: this
			});
		};

		const iterator = function(callback) {

		let startValue=0;
		let incrementValue=1;
		let count=this;

		if(this instanceof IterationThing){

			startValue = this.startValue;
			count = this.count;
			incrementValue = this.incrementValue;

		}

			const out = [];
			for (let i = 0; i < count; i = i + 1) {

				const parameter=startValue+(i*incrementValue);

				if (typeof callback == 'function') {
					out.push(callback(parameter));
				} else {
					out.push(parameter);
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

		if (typeof(Number.prototype.qtIterate)=='undefined'){
			Object.defineProperty(IterationThing.prototype, 'qtIterate', {
				value: iterator,
				writable: false,
				enumerable:false
			});

			Object.defineProperty(IterationThing.prototype, 'qtStart', {
				value: setStart,
				writable: false,
				enumerable:false
			});

			Object.defineProperty(IterationThing.prototype, 'qtIncrement', {
				value: setIncrement,
				writable: false,
				enumerable:false
			});

			Object.defineProperty(Number.prototype, 'qtIterate', {
				value: iterator,
				writable: false,
				enumerable:false
			});

			Object.defineProperty(Number.prototype, 'qtStart', {
				value: setStart,
				writable: false,
				enumerable:false
			});

			Object.defineProperty(Number.prototype, 'qtIncrement', {
				value: setIncrement,
				writable: false,
				enumerable:false
			});
		}
		
		return {
			methods:['qtIncrement','qtStart', 'qtIterate'],
			description:`const newArray=(6)).qtStart(22).qtIncrement(111).qtIterate(parm=>{return parm+' hello';});`
		}
	};



//atypical pattern !!!



	this.addToPrototype = addToPrototype;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

