'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;
	
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	
	const baseMerge = (receivingObject, sendingObject, args = {}) => {


		const { mergeNonExistent = true } = args;
		
		
			
			if (
				['string', 'number', 'boolean', 'function', 'date'].includes(
					typeof sendingObject
				)
			) {
				receivingObject = sendingObject;
				return receivingObject;
			}
			
			

		for (var i in sendingObject) {
			if (!sendingObject.hasOwnProperty(i)) {
				continue;
			}

			var element = sendingObject[i];
			
			if (
				['string', 'number', 'boolean', 'function', 'date'].includes(
					typeof element
				) ||
				['string', 'number', 'boolean', 'function', 'date'].includes(
					typeof receivingObject[i]
				)
			) {
				receivingObject[i] = element;
				continue;
			}

			if (
				mergeNonExistent &&
				(element == null || typeof element == 'undefined' || element === '')
			) {
				receivingObject[i] = element;
				continue;
			}

			if (element instanceof Array) {
				if (typeof receivingObject[i] == 'undefined') {
					receivingObject[i] = [];
				}

				element.forEach((item, inx) => {
					if (
						receivingObject.qtGetSurePath(`${i}.${inx}`) &&
						element.qtGetSurePath(`${inx}`)
					) {
						
						receivingObject[i][inx] = baseMerge(
							receivingObject[i][inx],
							element[inx],
							args
						);
					} else if (element.qtGetSurePath(`${inx}`)) {
						receivingObject[i][inx] = element[inx];
					} 
					
				});
				
				continue;
			}

			if (element instanceof Object) {
				if (typeof receivingObject[i] == 'undefined') {
					receivingObject[i] = {};
				}

				receivingObject[i] = baseMerge(receivingObject[i], element, args);
				continue;
			}
		}

		return receivingObject;
	};
	
	//first method definition function ==========================
	const firstMethodFunction = commonFunctions => {
		const functionObject = new Map(); // prettier-ignore

		const methodName = 'qtMerge';
		const description = `Deep merge of two objects. Clones by default. receivingObject.qtMerge(sendingObject, {mutateObjects:false, mergeNonExistent:true}). DOESN'T YET WORK FOR MAPS OR SETS.`;
		const supportedTypeList = [Object];

		const method = () =>
			function(sendingObject, args = {}) {
				//if one of the supportedTypeList elements is Object, basically all data types will have this method and type checking is important.
				if (!commonFunctions.isSupportedType(this, supportedTypeList)) {
					// prettier-ignore
					throw new Error(
						`${methodName}(): unsupported data type: '${commonFunctions.toType(this)}' (${methodName} supports ${supportedTypeList.map(item=>item.toString().replace(/.*function (.*?)\(\).*/, '$1')).join(', ')})`
					);
				}

				const { mutateObjects = false } = args;

				let receivingObject = this;

				if (!mutateObjects) {
					receivingObject = this.qtClone();
					sendingObject = sendingObject.qtClone();
				}

				const outObj = baseMerge(receivingObject, sendingObject, args);

				return outObj;
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
