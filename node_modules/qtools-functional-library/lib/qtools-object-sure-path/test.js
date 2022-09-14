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

	
	const testArray = {
		data: {
			studentReport: {
				rows: [
					{
						student: {
							id: '7369',
							firstName: 'Harry',
							middleName: 'Z.',
							lastName: 'Krazy',
							suffix: '',
							gender: 'Male'
						},
						testScores: [
							{
								testId: '10',
								testName: 'MN - Accountability Tests',
								variant: {
									id: '10001',
									name: 'MCA II'
								},
								season: {
									id: '2901',
									name: '2018-2019'
								},
								outline: {
									id: '100001',
									name: 'Math',
									parentId: null,
									level: 1
								},
								gradeLevel: null,
								dateTaken: null,
								scoreType: {
									id: '1009',
									name: 'Scale Score'
								},
								score: null,
								altScore: null,
								performanceScales: []
							},
							{
								testId: '10',
								testName: 'MN - Accountability Tests',
								variant: {
									id: '10005',
									name: 'MCA III'
								},
								season: {
									id: '2901',
									name: '2018-2019'
								},
								outline: {
									id: '100001',
									name: 'Math',
									parentId: null,
									level: 1
								},
								gradeLevel: '05',
								dateTaken:
									'Sun Mar 03 2019 18:00:00 GMT-0600 (Central Standard Time)',
								scoreType: {
									id: '1009',
									name: 'Scale Score'
								},
								score: 549,
								altScore: null,
								performanceScales: [
									{
										performanceSet: {
											id: '1001',
											name: 'Proficiency'
										},
										performanceValue: 'Partially Meets'
									},
									{
										performanceSet: {
											id: '1005',
											name: 'Career and College Readiness'
										},
										performanceValue: 'N/A'
									}
								]
							}
						]
					},
					{
						student: {
							id: '9748',
							firstName: 'Julie',
							middleName: 'T.',
							lastName: 'Blue',
							suffix: '',
							gender: 'Female'
						},
						testScores: [
							{
								testId: '10',
								testName: 'MN - Accountability Tests',
								variant: {
									id: '10001',
									name: 'MCA II'
								},
								season: {
									id: '2901',
									name: '2018-2019'
								},
								outline: {
									id: '100001',
									name: 'Math',
									parentId: null,
									level: 1
								},
								gradeLevel: null,
								dateTaken: null,
								scoreType: {
									id: '1009',
									name: 'Scale Score'
								},
								score: null,
								altScore: null,
								performanceScales: []
							},
							{
								testId: '10',
								testName: 'MN - Accountability Tests',
								variant: {
									id: '10005',
									name: 'MCA III'
								},
								season: {
									id: '2901',
									name: '2018-2019'
								},
								outline: {
									id: '100001',
									name: 'Math',
									parentId: null,
									level: 1
								},
								gradeLevel: '05',
								dateTaken:
									'Sun Mar 03 2019 18:00:00 GMT-0600 (Central Standard Time)',
								scoreType: {
									id: '1009',
									name: 'Scale Score'
								},
								score: 544,
								altScore: null,
								performanceScales: [
									{
										performanceSet: {
											id: '1001',
											name: 'Proficiency'
										},
										performanceValue: 'Partially Meets'
									},
									{
										performanceSet: {
											id: '1005',
											name: 'Career and College Readiness'
										},
										performanceValue: 'N/A'
									}
								]
							}
						]
					},
					{
						student: {
							id: '1387',
							firstName: 'Virtue',
							middleName: 'H.',
							lastName: 'RosiePosie',
							suffix: '',
							gender: 'Female'
						},
						testScores: [
							{
								testId: '10',
								testName: 'MN - Accountability Tests',
								variant: {
									id: '10001',
									name: 'MCA II'
								},
								season: {
									id: '2901',
									name: '2018-2019'
								},
								outline: {
									id: '100001',
									name: 'Math',
									parentId: null,
									level: 1
								},
								gradeLevel: null,
								dateTaken: null,
								scoreType: {
									id: '1009',
									name: 'Scale Score'
								},
								score: null,
								altScore: null,
								performanceScales: []
							},
							{
								testId: '10',
								testName: 'MN - Accountability Tests',
								variant: {
									id: '10005',
									name: 'MCA III'
								},
								season: {
									id: '2901',
									name: '2018-2019'
								},
								outline: {
									id: '100001',
									name: 'Math',
									parentId: null,
									level: 1
								},
								gradeLevel: '05',
								dateTaken:
									'Sun Mar 03 2019 18:00:00 GMT-0600 (Central Standard Time)',
								scoreType: {
									id: '1009',
									name: 'Scale Score'
								},
								score: 531,
								altScore: null,
								performanceScales: [
									{
										performanceSet: {
											id: '1001',
											name: 'Proficiency'
										},
										performanceValue: 'Does Not Meet'
									},
									{
										performanceSet: {
											id: '1005',
											name: 'Career and College Readiness'
										},
										performanceValue: 'N/A'
									}
								]
							}
						]
					}
				]
			}
		}
	};
	

	//TEST ITEM ------------------------------------------------------
	methodName = 'qtGetSurePath';
	thisStepMessage = 'not yet implemented';
	thisStepResult = testArray[methodName]('data.studentReport.rows', []);
	thisStepEvalFunction = item => item.length==3;
	passingTests =
		completeStep(
			methodName,
			thisStepMessage,
			thisStepResult,
			thisStepEvalFunction
		) && passingTests;
	
	
	methodName = 'qtPutSurePath';
	thisStepMessage = 'not yet implemented';
	thisStepResult = testArray[methodName]('data.studentReport.rows[0].student.id', 9999);
	thisStepEvalFunction = item => item.qtGetSurePath('data.studentReport.rows[0].student.id')==9999;
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

