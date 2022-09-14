'use strict';

//START OF moduleFunction() ============================================================

const moduleFunction = function(args) {
	//this module is initialized with parameters spec'd in the main function module
	
	const completeStepActual = ({verbose=false, logErrors=false, moduleName}) => (
		methodName,
		thisStepMessage,
		thisStepResult,
		thisStepEvalFunction
	) => {

		const thisStepPass = thisStepEvalFunction(thisStepResult);
		
		if (logErrors && !thisStepPass) {
			console.log(`FAIL TEST: ${thisStepMessage} in ...${moduleName}`);
		}
		if (verbose) {
			console.log(`Result for: ${methodName}:`);
			console.dir(thisStepResult);
			console.log('\n\n');
		}
		
		return passingTests && thisStepPass;
	};

	const completeStep = completeStepActual(args);

	let passingTests = true;

	let thisStepMessage;
	let thisStepResult;
	let thisStepEvalFunction;
	let methodName;

	//TESTS ============================================================

	
	const testArray = {
				animal: 'bird',
				eatsWith: 'teeth',
				color: 'red',
				list:[1,2,3]
			};
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtDump'
	thisStepMessage = "not yet implemented";
	thisStepResult = testArray[methodName]({returnString:true});
	thisStepEvalFunction = item => typeof(item)=='string';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	methodName='qtListProperties'
	thisStepMessage = "not yet implemented";
	thisStepResult = testArray[methodName]({returnString:true});
	thisStepEvalFunction = item => typeof(item)=='string';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

