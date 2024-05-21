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
		beta: 12,
		gamma:13
	},{
		alpha: 21,
		gamma:23
	}
	];
	
	const testOneArgument=[ 'one'];
	const testTwoArgument=['alpha'];
	
	const testThreeArgument=['alpha', 'beta'];
	const testThreeMoreValues={moreDefaultValues:{beta:(currentObject, elementName)=>`default function ${elementName} produces ${Object.keys(currentObject).join(', ')}`}}
	
	const testFourArgument={
		alpha: (item, name, entire)=>item*1000,
		addedValue:(item, name, entire)=>`${name} says, item:${item} becomes ${Object.keys(entire).join(', ')}`
	}
	
	const testFiveArgument={
		alpha: 'eleven',
		beta: 'twelve'
	}
	
// array of strings for one object 
// array of strings for array of objects
// array of strings for one object with moreDefaultValues
// object with defaults for object 
// EXCLUDE MODE

	//TEST ITEM ------------------------------------------------------
	methodName='qtSelectProperties'
	thisStepMessage = "did not get array of strings for one object ";
	thisStepResult = testObject[methodName](testOneArgument);
	thisStepEvalFunction = item => (item.one==1 && typeof(item.two)=='undefined');
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests; 

	//TEST ITEM ------------------------------------------------------
	methodName='qtSelectProperties'
	thisStepMessage = "did not get array of strings for array of objects";
	thisStepResult = testArray[methodName](testTwoArgument);
	thisStepEvalFunction = item => (
		item[0].alpha==11 &&
		typeof(item[0].beta)=='undefined' &&
		item[1].alpha==21 &&
		typeof(item[1].beta)=='undefined'
	);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests; 

	//TEST ITEM ------------------------------------------------------
	methodName='qtSelectProperties'
	thisStepMessage = "did not get array of strings for one object with moreDefaultValues";
	thisStepResult = testArray[methodName](testThreeArgument, testThreeMoreValues);
	thisStepEvalFunction = item => (
		item[0].alpha==11 &&
		item[0].beta==12 &&
		item[1].alpha==21 &&
		item[1].beta=='default function beta produces alpha, gamma'
	);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtSelectProperties'
	thisStepMessage = "did not get object argument containing defaults";
	thisStepResult = testArray[methodName](testFiveArgument);
	thisStepEvalFunction = item => (
		item[0].alpha==11 &&
		item[0].beta==12 &&
		item[1].alpha==21 &&
		item[1].beta=='twelve'
	);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtSelectProperties'
	thisStepMessage = "did not get EXCLUDE MODE";
	thisStepResult = testArray[methodName](testThreeArgument, {excludeMode:true});
	thisStepEvalFunction = item => (
		typeof(item[0].alpha)=='undefined' &&
		typeof(item[0].beta)=='undefined' &&
		item[0].gamma==13 &&
		typeof(item[1].alpha)=='undefined' &&
		typeof(item[1].beta)=='undefined' &&
		item[1].gamma==23
	);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

