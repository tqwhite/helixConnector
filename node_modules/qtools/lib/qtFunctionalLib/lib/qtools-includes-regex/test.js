'use strict';

//START OF moduleFunction() ============================================================

const moduleFunction = function({ logErrors = false, methodName='missing method name' }) {
	const completeStepActual = (logErrors, methodName) => (
		thisStepMessage,
		thisStepResult,
		thisStepEvalFunction
	) => {

		const thisStepPass = thisStepEvalFunction(thisStepResult);
		passingTests = passingTests && thisStepPass;
		if (logErrors && !thisStepPass) {
			console.log(`FAIL TEST: ${thisStepMessage} in ${methodName}() [${module.path}]`);
		}
		return thisStepPass;
	};

	const completeStep = completeStepActual(logErrors, methodName);

	let passingTests = true;

	let thisStepMessage;
	let thisStepResult;
	let thisStepEvalFunction;

	//TESTS ============================================================

	
	const testArray = {
			a: {
				animal: 'fish',
				eatsWith: 'straw',
				color: 'red'
			}
		};

	//TEST ITEM ------------------------------------------------------
	thisStepMessage = "TEST NOT IMPLEMENTED YET";
	thisStepResult = testArray[methodName]();
	thisStepEvalFunction = item => false;
	passingTests =
		completeStep(thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

