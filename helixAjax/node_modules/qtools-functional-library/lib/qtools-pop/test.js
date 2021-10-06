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
	const emptyArray = [];
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtPop'
	thisStepMessage = "did not get the most recently added element";
	thisStepResult = testArray[methodName]();
	thisStepEvalFunction = item => item=='Hello';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtPop'
	thisStepMessage = "did not get the most recently added element";
	thisStepResult = emptyArray[methodName]('default value');
	thisStepEvalFunction = item => item=='default value';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtLast'
	thisStepMessage = "did not get the most recently added element";
	thisStepResult = testArray[methodName]();
	thisStepEvalFunction = item => (item=='Hello' && item.length==2);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtLast'
	thisStepMessage = "did not get the most recently added element";
	thisStepResult = emptyArray[methodName]('default value');
	thisStepEvalFunction = item => (item=='default value' && item.length==2);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtPush'
	thisStepMessage = "element was not added";
	thisStepResult = emptyArray[methodName]('test value');
	thisStepEvalFunction = item => (item=>item.qtPop()=='test value');
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

