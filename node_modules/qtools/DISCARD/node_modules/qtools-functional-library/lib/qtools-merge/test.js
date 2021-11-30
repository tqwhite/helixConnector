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



	const testArray = {
				animal: 'bird',
				eatsWith: 'teeth',
				color: 'red',
				list:['orig1',2,3, 4],
				deep:[
					{a:'a'},
					{b:{nestedList:['d1','d2','d3']}}
					]
			};
	
	const testArray2 = {
				animal: 'fish',
				eatsWith: 'snout',
				shoeSize:10,
				list:['q',void(0),'new3',void(0),'new5'],
				deep:[
					{c:'creplacement'},
					{b:{nestedList:['d1replacement']}}
					],
				new_array_not_in_replacement:[
					'newA',
					'newB'
				],
				new_object_not_in_original:{
					hello:'goodbye',
					orange:'black'
				}
			};

	
	const testArray3 = {
				animal: 'mastodon',
				horns:'pointy'
			};
	
	
	const arrayTestA={
		a:'b',
		b:{'x':10, y:20},
		c:{
			importantArray:[
				{one:1, two:2},
				{onex:1, twox:2},
			],
			arrayOfBasicTypes:[
			'first',
			'second'
			
			]
	
	
	}
	};
	
	const arrayTestB={}
	arrayTestB.c={};
	arrayTestB.c.importantArray=[];
	arrayTestB.c.importantArray[3]={oney:1, twoy:2};
	
	const arrayTestC={}
	arrayTestC.c={};
	arrayTestC.c.importantArray=[];
	arrayTestC.c.importantArray[1]={twox:22};
	
	const arrayTestD={
		c:{
			arrayOfBasicTypes:[]
		}
	}
	arrayTestD.c.arrayOfBasicTypes[0]='replacesFirst';
	
	const arrayTestE={
	a:{replaces:'scalar'},
	b:'replacesArray'
	
	}



	//TEST ITEM ------------------------------------------------------
	methodName='qtMerge'
	thisStepMessage = "Failed to replace base type with complex one or vice versa";
	thisStepResult = arrayTestA[methodName](arrayTestE, {mergeNonExistent:true});
thisStepResult.qtDump({label:"thisStepResult"});



	thisStepEvalFunction = item => 
		item.qtGetSurePath('c.arrayOfBasicTypes[0]')=='replacesFirst' &&
		item.qtGetSurePath('c.arrayOfBasicTypes[1]')=='second';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;

	//TEST ITEM ------------------------------------------------------
	methodName='qtMerge'
	thisStepMessage = "Didn't merge array correctly";
	thisStepResult = arrayTestA[methodName](arrayTestD, {mergeNonExistent:true});
	thisStepEvalFunction = item => 
		item.qtGetSurePath('c.arrayOfBasicTypes[0]')=='replacesFirst' &&
		item.qtGetSurePath('c.arrayOfBasicTypes[1]')=='second';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
		
	//TEST ITEM ------------------------------------------------------
	methodName='qtMerge'
	thisStepMessage = "Didn't merge basic array element correctly";
	thisStepResult = arrayTestA[methodName](arrayTestB, {mergeNonExistent:true});
	thisStepEvalFunction = item => 
		item.qtGetSurePath('c.importantArray[0].one')==1 &&
		item.qtGetSurePath('c.importantArray[1].twox')==2 &&
		item.qtGetSurePath('c.importantArray[2]', 'undefined')=='undefined' &&
		item.qtGetSurePath('c.importantArray[3].oney')==1;
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
		
	//TEST ITEM ------------------------------------------------------
	methodName='qtMerge'
	thisStepMessage = "Didn't merge object element inside an array correctly";
	thisStepResult = arrayTestA[methodName](arrayTestC, {mergeNonExistent:true});
	thisStepEvalFunction = item =>
		item.qtGetSurePath('c.importantArray[1].onex')==1 &&
		item.qtGetSurePath('c.importantArray[1].twox')==22;
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;	
		
	//TEST ITEM ------------------------------------------------------
	methodName='qtMerge'
	thisStepMessage = "Didn't merge deep replacement property correctly";
	thisStepResult = testArray[methodName](testArray2, {mergeNonExistent:true});
	thisStepEvalFunction = item => item.qtGetSurePath('deep[1].b.nestedList[0]')=='d1replacement';
	passingTests =
		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
		passingTests;
//		
//	//TEST ITEM ------------------------------------------------------
//	methodName='qtMerge'
//	thisStepMessage = "Didn't merge undefined item correctly";
//	thisStepResult = testArray[methodName](testArray2, {mergeNonExistent:true});
//	thisStepEvalFunction = item => typeof(item.qtGetSurePath('list[1]'))=='undefined';
//	passingTests =
//		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
//		passingTests;
//
//	//TEST ITEM ------------------------------------------------------
//	methodName='qtMerge'
//	thisStepMessage = "did not merge nested array element";
//	thisStepResult = testArray[methodName](testArray2, {mergeNonExistent:false});
//	thisStepEvalFunction = item => item.qtGetSurePath('deep[1].b.nestedList[0]')=='d1replacement';
//	passingTests =
//		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
//		passingTests;
//
//	//TEST ITEM ------------------------------------------------------
//	methodName='qtMerge'
//	thisStepMessage = "did not merge third object correctly";
//	thisStepResult = testArray[methodName](testArray2, {mergeNonExistent:false}).qtMerge(testArray3);
//	thisStepEvalFunction = item => item.horns=='pointy' && item.animal=='mastodon' && item.eatsWith=='snout';
//	passingTests =
//		completeStep(methodName, thisStepMessage, thisStepResult, thisStepEvalFunction) &&
//		passingTests;
//	
//	
	

	return passingTests;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

