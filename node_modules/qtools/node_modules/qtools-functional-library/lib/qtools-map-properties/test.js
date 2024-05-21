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

	
	
	const testObject={
		one: 1,
		two: 2
	}
	
	const testArray=[
	{
		alpha: 11,
		beta: 12
	},{
		alpha: 21,
		beta: 22
	}
	];
	
	const testOneArgument={
		one: (item, name, entire)=>item*1000
	}
	const testTwoArgument={
		one: (item, name, entire)=>item*1000,
		addedValue:(item, name, entire)=>`${name} says, item:${item} becomes ${Object.keys(entire).join(', ')}`
	}
	const testThreeArgument={
		alpha: (item, name, entire)=>item*1000,
		addedValue:(item, name, entire)=>`${name} says, item:${item} becomes ${Object.keys(entire).join(', ')}`
	}
// map one object 
// map one with added property
// map array 



	//TEST ITEM ------------------------------------------------------
	methodName='qtMapProperties'
	thisStepMessage = "did not get map one object ";
	thisStepResult = testObject[methodName](testOneArgument);
	thisStepEvalFunction = item => (item.one==1000 && item.two==2);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtMapProperties'
	thisStepMessage = "did not map one with added property";
	thisStepResult = testObject[methodName](testTwoArgument);
	thisStepEvalFunction = item => (item.one==1000 && item.two==2 && item.addedValue=='addedValue says, item:undefined becomes one, two');
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtMapProperties'
	thisStepMessage = "did not map array woth added property";
	thisStepResult = testArray[methodName](testThreeArgument);
	thisStepEvalFunction = item => (
		item[0].alpha==11000 &&
		item[0].beta==12 &&
		item[0].addedValue=='addedValue says, item:undefined becomes alpha, beta' &&
		item[1].alpha==21000 &&
		item[1].beta==22 &&
		item[1].addedValue=='addedValue says, item:undefined becomes alpha, beta'
	);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

