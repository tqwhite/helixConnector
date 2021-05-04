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

	
	
	const testArray = {
['0']:'zero',
['1']:'one',
['4']:'four',
a:'b'

}

	
	
	const testArray2 = {
['0']:'zero',
['1']:'one',
['4']:'four',
a:'b',
subArray:{['0']:'zeroX',
['1']:'oneX',
['4']:'fourX'},

}

const emptyArray={}
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtNumberKeysToArray'
	thisStepMessage = "test #1, result is wrong, holes or length are wrong";
	thisStepResult = testArray[methodName]({collapseHoles:false, omitNonNumeric:true});
	thisStepEvalFunction = item => item=(item.length==5 && typeof(item[2])=='undefined' && typeof(item[3])=='undefined');
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtNumberKeysToArray'
	thisStepMessage = "test #2, result is wrong, has holes or length is wrong";
	thisStepResult = testArray[methodName]({collapseHoles:true, omitNonNumeric:true});
	thisStepEvalFunction = item => item=(item.length==3 && item.reduce((item, result)=>(typeof(item!='undefined') && result), true));
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtNumberKeysToArray'
	thisStepMessage = "test #3, result is wrong, non-numeric element is missing or length is wrong";
	thisStepResult = testArray[methodName]({collapseHoles:true, omitNonNumeric:false});
	thisStepEvalFunction = item => item=(item.length==4 && typeof(item[3])=='object');
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	

	
	
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtNumberKeysToArray'
	thisStepMessage = "test #4, subordinate element was not converted properly";
	thisStepResult = testArray2[methodName]({collapseHoles:true, omitNonNumeric:false});
	thisStepEvalFunction = item => item=(item.length==5 && typeof(item[4])=='object' && item[4].value.length==3);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	//TEST ITEM ------------------------------------------------------
	methodName='qtNumberKeysToArray'
	thisStepMessage = "test #5, empty object returns empty array";
	thisStepResult = emptyArray[methodName]({collapseHoles:true, omitNonNumeric:false});
	thisStepEvalFunction = item => item=(item.length===0);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

