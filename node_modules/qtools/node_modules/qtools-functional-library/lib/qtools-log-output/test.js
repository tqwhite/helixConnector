'use strict';

//START OF moduleFunction() ============================================================

const moduleFunction = function(args) {
	//this module is initialized with parameters spec'd in the main function module
	
	const completeStepActual = ({
		verbose = false,
		logErrors = false,
		moduleName
	}) => (methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) => {
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
		substitution1:'with object substitution',
		nested:{
			element:'replaced from a nested element'
		}
	}

	const replaceObject={
		fromReplaceObj:"additional replacement object substitution"
	}
	

	//TEST ITEM ------------------------------------------------------
	methodName = 'qtLog';
	thisStepMessage = 'object.qtLog() message test';
	thisStepResult = testObject[methodName](thisStepMessage, {noSuffix:true, destination:'returnString'});
	thisStepEvalFunction = item => item==thisStepMessage;
	passingTests =
		completeStep(
			methodName,
			thisStepMessage,
			thisStepResult,
			thisStepEvalFunction
		) && passingTests;
	
	
	methodName = 'qtLog';
	thisStepMessage = 'object.qtLog() message test -><!substitution1!><-';
	thisStepResult = testObject[methodName](thisStepMessage, {noSuffix:true, destination:'returnString'});
	thisStepEvalFunction = item => item=='object.qtLog() message test ->with object substitution<-';
	passingTests =
		completeStep(
			methodName,
			thisStepMessage,
			thisStepResult,
			thisStepEvalFunction
		) && passingTests;
	
	
	methodName = 'qtLog';
	thisStepMessage = 'object.qtLog() message test -><!substitution1!><- and -><!fromReplaceObj!><-';
	thisStepResult = testObject[methodName](thisStepMessage, {noSuffix:true, destination:'returnString', substitutions:replaceObject});
	thisStepEvalFunction = item => item=='object.qtLog() message test ->with object substitution<- and ->additional replacement object substitution<-';
	passingTests =
		completeStep(
			methodName,
			thisStepMessage,
			thisStepResult,
			thisStepEvalFunction
		) && passingTests;
	
	
	methodName = 'qtLog';
	thisStepMessage = 'object.qtLog() message test -><!nested.element!><-';
	thisStepResult = testObject[methodName](thisStepMessage, {noSuffix:true, destination:'returnString', substitutions:testObject});
	thisStepEvalFunction = item => item=='object.qtLog() message test ->replaced from a nested element<-';
	passingTests =
		completeStep(
			methodName,
			thisStepMessage,
			thisStepResult,
			thisStepEvalFunction
		) && passingTests;
		
	const qt=require('../../qtools-functional-library');

	methodName = 'log';
	thisStepMessage = 'qt.log() message test -><!substitution1!><-';
	thisStepResult = qt[methodName](thisStepMessage, {noSuffix:true, destination:'returnString', substitutions:testObject});
	thisStepEvalFunction = item => item=='qt.log() message test ->with object substitution<-';
	passingTests =
		completeStep(
			methodName,
			thisStepMessage,
			thisStepResult,
			thisStepEvalFunction
		) && passingTests;
	
	

	
	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

