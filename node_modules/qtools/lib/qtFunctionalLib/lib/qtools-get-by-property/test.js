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

	
	const testArray = [
		{
			a: {
				animal: 'fish',
				eatsWith: 'straw',
				color: 'red'
			}
		},
		{
			a: {
				animal: 'snake',
				eatsWith: 'straw',
				color: 'blue'
			}
		},
		{
			a: {
				animal: 'bird',
				eatsWith: 'teeth',
				color: 'red'
			}
		},
		{
			a: {
				animal: 'bird',
				eatsWith: 'chopsticks',
				color: 'red'
			}
		},
		{
			a: {
				animal: 'bird',
				eatsWith: 'teeth',
				color: 'red'
			}
		}
	];

	//TEST ITEM ------------------------------------------------------
	thisStepMessage = "couldn't find all red ones";
	thisStepResult = testArray[methodName]('a.color', 'red');
	thisStepEvalFunction = item => item.length == 4;
	passingTests =
		completeStep(thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	//TEST ITEM ------------------------------------------------------
	thisStepMessage =
		'did not get default value when search value was not presesnt';
	thisStepResult = testArray[methodName]('a.color', 'snake', 'pumpkins');
	thisStepEvalFunction = item => item == 'pumpkins';
	passingTests =
		completeStep(thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	//TEST ITEM ------------------------------------------------------
	thisStepMessage = 'did not find correct object with dotted path criterion';
	thisStepResult = testArray[methodName]('a.color', 'blue', 'pumpkins');
	thisStepEvalFunction = item =>
		item.length == 1 &&
		item[0].a.animal == 'snake' &&
		item[0].a.eatsWith == 'straw' &&
		item[0].a.color == 'blue';
	passingTests =
		completeStep(thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	//TEST ITEM ------------------------------------------------------
	thisStepMessage =
		'did not return empty array when search value was present and there was no default';
	thisStepResult = testArray[methodName]('a.color', 'monkee');
	thisStepEvalFunction = item => item.length === 0;
	passingTests =
		completeStep(thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

