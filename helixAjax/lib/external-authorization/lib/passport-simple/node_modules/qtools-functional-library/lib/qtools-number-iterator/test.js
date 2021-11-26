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
			console.log(`Result for: ${methodName} (${thisStepPass?'PASS':'FAIL'}):`);
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

	
	const testArray = [
		'allocute',
		'Hello'
	];
	
// console.dir((5).qtStart(7).qtIncrement(3).qtIterate(item=>item*100))
// [ 700, 1000, 1300, 1600, 1900 ]

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateMethod'
	thisStepMessage = "not yet implemented";
	thisStepResult = (5).qtStart(7).qtIncrement(3).qtIterate(item=>item*100);
	thisStepEvalFunction = item => item.length=5;
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

