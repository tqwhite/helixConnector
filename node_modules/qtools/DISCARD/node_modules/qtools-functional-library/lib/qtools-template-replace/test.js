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
			thisStepResult.qtDump();
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


	
	const replaceArray = [
		{
				animal: 'fish',
				eatsWith: 'straw',
				color: 'red',
				finSize:'flappy',
				foods:{
					desert:'watermelon',
					lunch:'ice cubes'
				},
				testMark:'testMarkOutput',
				capitalAnimal:replaceObject=>replaceObject.animal.toUpperCase()
			},
		{
				animal: 'snake',
				eatsWith: 'straw',
				color: 'blue',
				finSize:'trim',
				foods:{
					desert:'birds',
					lunch:'worms'
				},
				testMark:'testMarkOutput'
			},
		{
				animal: 'bird',
				eatsWith: 'teeth',
				color: 'red',
				foods:{
					desert:'chewy clouds',
					lunch:'stars'
				},
				testMark:'testMarkOutput'
			},
		{
				animal: 'bird',
				eatsWith: 'chopsticks',
				color: 'red',
				foods:{
					desert:'sticky clouds',
					lunch:'rice stars'
				},
				testMark:'testMarkOutput'
			}
	];
	
	const template=`The <!animal!> (<!capitalAnimal!>) eats with <!wrapEatsWith!> and are usually <!color!>. The like <!foods.lunch!> for lunch with a snappy <!foods.desert!> for desert. [<!testMark!>] <!unmatchedTag!>`;
	
	const templateList=[
	
		`ONE: ${template}`,
		`TWO: ${template}`,
		`THREE: ${template}`,
	
	];
	
	const transformations={
		wrapEatsWith:replaceObject=>`[[${replaceObject.eatsWith}]]`
	
	}
	

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateReplace'
	thisStepMessage = "did not work for a single object replacement";
	thisStepResult = replaceArray[0][methodName](template);
	thisStepEvalFunction = item => item.match(/testMarkOutput/, {transformations});
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateReplace'
	thisStepMessage = "did not work for a list of objects replacement";
	thisStepResult = replaceArray[methodName](template, {transformations});
	thisStepEvalFunction = item => item[0].match(/testMarkOutput/)?true:false;
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateReplace'
	thisStepMessage = "did not work for a string base with a single object";
	thisStepResult = template[methodName](replaceArray[0], {transformations});
	thisStepEvalFunction = item => item.match(/testMarkOutput/);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateReplace'
	thisStepMessage = "did not work for a string array with a single object";
	thisStepResult = templateList[methodName](replaceArray[0], {transformations});
	thisStepEvalFunction = item => item[0].match(/testMarkOutput/);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateReplace'
	thisStepMessage = "did not correctly remove unmatched tag";
	thisStepResult = templateList[methodName](replaceArray[0], {transformations, leaveUnmatchedTagsIntact:false});
	thisStepEvalFunction = item => !item[0].match(/unmatchedTag/);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtTemplateReplace'
	thisStepMessage = "did not reatain unmatched tag";
	thisStepResult = templateList[methodName](replaceArray[0], {transformations, leaveUnmatchedTagsIntact:true});
	thisStepEvalFunction = item => item[0].match(/unmatchedTag/);
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

