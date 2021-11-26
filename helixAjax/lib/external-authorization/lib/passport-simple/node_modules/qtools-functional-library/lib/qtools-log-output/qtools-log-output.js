'use strict';
//START OF moduleFunction() ============================================================
var moduleFunction = function(args = {}) {
	const { commonFunctions } = args;

	//qtAddCallableMethods ============================================================
	const qtLog_AddCallableMethods = {
		description: `internal function not for civilian use`,
		suppressHelpListing: true,
		supportedTypeList: [Object],
		test: args => {
			return require('./test.js')({
				...args,
				...{
					moduleName: module.id.replace(module.path, '')
				}
			});
		},

		method: commonFunctions =>
			function(permissionValue = '') {
				if (
					permissionValue != "what part of 'not for civilian use' is unclear?"
				) {
					return;
				}

				this.log = function(message, options = {}) {
					options.suffixCallStackDepth = options.suffixCallStackDepth?options.suffixCallStackDepth:4;
					return ({}.qtLog(message, options));
				};

				return this;
			}
	};

	//qtLog ============================================================
	const qtLog = {
		description: `[ANY TYPE].qtLog() outputs to stderr (console.error()) or stdout (console.log())`,
		supportedTypeList: [
			Object,
			String,
			Number,
			Set,
			Map,
			Boolean,
			Symbol,
			Function,
			BigInt,
			BigInt64Array
		],
		test: args => {
			return require('./test.js')({
				...args,
				...{
					moduleName: module.id.replace(module.path, '')
				}
			});
		},

		method: commonFunctions =>
			function(message, options = {}) {
				const inData = this;
				const {
					noSuffix = false,
					label = '',
					substitutions = {},
					destination = 'stderr'
				} = options;

				const callerName = commonFunctions.callerName(true, options);

				const showLabel = label.replace(/\n/g, '');
				const suffix = noSuffix ? '' : ` [${callerName}]`;
				const outputMessage =
					message
						.qtTemplateReplace(typeof this == 'object' ? this : {})
						.qtTemplateReplace(substitutions) + suffix;

				if (['stderr'].includes(destination)) {
					console.error(outputMessage);
				} else if (['stdout'].includes(destination)) {
					console.log(outputMessage);
				} else if (['returnString'].includes(destination)) {
					return outputMessage;
				}

				return this;
			}
	};

	//intitialize context ============================================================

	const functionObject = new Map();

	functionObject.set('qtLog_AddCallableMethods', qtLog_AddCallableMethods);
	functionObject.set('qtLog', qtLog);

	//this has commonFunctions twice because I don't want new thing() or to have an extra function to make it available.
	const addToPrototypeActual = functionObject => () =>
		commonFunctions.universalAddToPrototype(commonFunctions, functionObject);
	this.addToPrototype = addToPrototypeActual(functionObject);
};
//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
//module.exports = new moduleFunction();
