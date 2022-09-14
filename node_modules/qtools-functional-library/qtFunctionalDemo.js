#!/usr/local/bin/node
'use strict';

const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

// console.log(`\n=-=============   help  ========================= [noodleWithNode.js.]\n`);
// 
// qtools.qt.help().qtDump();
// qtools.qt.help(/various/).qtDump();

//const timeStamp = qtools.dateToSql();
// 				const timeStamp2 = qtools.dateToSqlNew();
// 
// timeStamp.qtDump({label:"dateToSql"});
// timeStamp2.qtDump({label:"dateToSqlNew"});


const jamesData={
	"data": {
		"studentReport": {
			"rows": [
				{
					"student": {
						"id": "7369",
						"firstName": "Harry",
						"middleName": "Z.",
						"lastName": "Krazy",
						"suffix": "",
						"gender": "Male"
					},
					"testScores": [
						{
							"testId": "10",
							"testName": "MN - Accountability Tests",
							"variant": {
								"id": "10001",
								"name": "MCA II"
							},
							"season": {
								"id": "2901",
								"name": "2018-2019"
							},
							"outline": {
								"id": "100001",
								"name": "Math",
								"parentId": null,
								"level": 1
							},
							"gradeLevel": null,
							"dateTaken": null,
							"scoreType": {
								"id": "1009",
								"name": "Scale Score"
							},
							"score": null,
							"altScore": null,
							"performanceScales": []
						},
						{
							"testId": "10",
							"testName": "MN - Accountability Tests",
							"variant": {
								"id": "10005",
								"name": "MCA III"
							},
							"season": {
								"id": "2901",
								"name": "2018-2019"
							},
							"outline": {
								"id": "100001",
								"name": "Math",
								"parentId": null,
								"level": 1
							},
							"gradeLevel": "05",
							"dateTaken": "Sun Mar 03 2019 18:00:00 GMT-0600 (Central Standard Time)",
							"scoreType": {
								"id": "1009",
								"name": "Scale Score"
							},
							"score": 549,
							"altScore": null,
							"performanceScales": [
								{
									"performanceSet": {
										"id": "1001",
										"name": "Proficiency"
									},
									"performanceValue": "Partially Meets"
								},
								{
									"performanceSet": {
										"id": "1005",
										"name": "Career and College Readiness"
									},
									"performanceValue": "N/A"
								}
							]
						}
					]
				},
				{
					"student": {
						"id": "9748",
						"firstName": "Julie",
						"middleName": "T.",
						"lastName": "Blue",
						"suffix": "",
						"gender": "Female"
					},
					"testScores": [
						{
							"testId": "10",
							"testName": "MN - Accountability Tests",
							"variant": {
								"id": "10001",
								"name": "MCA II"
							},
							"season": {
								"id": "2901",
								"name": "2018-2019"
							},
							"outline": {
								"id": "100001",
								"name": "Math",
								"parentId": null,
								"level": 1
							},
							"gradeLevel": null,
							"dateTaken": null,
							"scoreType": {
								"id": "1009",
								"name": "Scale Score"
							},
							"score": null,
							"altScore": null,
							"performanceScales": []
						},
						{
							"testId": "10",
							"testName": "MN - Accountability Tests",
							"variant": {
								"id": "10005",
								"name": "MCA III"
							},
							"season": {
								"id": "2901",
								"name": "2018-2019"
							},
							"outline": {
								"id": "100001",
								"name": "Math",
								"parentId": null,
								"level": 1
							},
							"gradeLevel": "05",
							"dateTaken": "Sun Mar 03 2019 18:00:00 GMT-0600 (Central Standard Time)",
							"scoreType": {
								"id": "1009",
								"name": "Scale Score"
							},
							"score": 544,
							"altScore": null,
							"performanceScales": [
								{
									"performanceSet": {
										"id": "1001",
										"name": "Proficiency"
									},
									"performanceValue": "Partially Meets"
								},
								{
									"performanceSet": {
										"id": "1005",
										"name": "Career and College Readiness"
									},
									"performanceValue": "N/A"
								}
							]
						}
					]
				},
				{
					"student": {
						"id": "1387",
						"firstName": "Virtue",
						"middleName": "H.",
						"lastName": "RosiePosie",
						"suffix": "",
						"gender": "Female"
					},
					"testScores": [
						{
							"testId": "10",
							"testName": "MN - Accountability Tests",
							"variant": {
								"id": "10001",
								"name": "MCA II"
							},
							"season": {
								"id": "2901",
								"name": "2018-2019"
							},
							"outline": {
								"id": "100001",
								"name": "Math",
								"parentId": null,
								"level": 1
							},
							"gradeLevel": null,
							"dateTaken": null,
							"scoreType": {
								"id": "1009",
								"name": "Scale Score"
							},
							"score": null,
							"altScore": null,
							"performanceScales": []
						},
						{
							"testId": "10",
							"testName": "MN - Accountability Tests",
							"variant": {
								"id": "10005",
								"name": "MCA III"
							},
							"season": {
								"id": "2901",
								"name": "2018-2019"
							},
							"outline": {
								"id": "100001",
								"name": "Math",
								"parentId": null,
								"level": 1
							},
							"gradeLevel": "05",
							"dateTaken": "Sun Mar 03 2019 18:00:00 GMT-0600 (Central Standard Time)",
							"scoreType": {
								"id": "1009",
								"name": "Scale Score"
							},
							"score": 531,
							"altScore": null,
							"performanceScales": [
								{
									"performanceSet": {
										"id": "1001",
										"name": "Proficiency"
									},
									"performanceValue": "Does Not Meet"
								},
								{
									"performanceSet": {
										"id": "1005",
										"name": "Career and College Readiness"
									},
									"performanceValue": "N/A"
								}
							]
						}
					]
				}
			]
		}
	}
}


const selectionId='9748'

const tmp=jamesData
.qtGetSurePath('data.studentReport.rows', [])
.qtGetByProperty('student.id', selectionId, [])
.qtPop({})
.qtGetSurePath('testScores', [])
.qtGetByProperty('variant.id', 10005, [])
.qtGetByProperty('outline.id', 100001, [])
.qtPop({})
.qtGetSurePath('score', 'n/a')
.qtDump();


// const students=jamesData.data.studentReport.rows;
// 
// students.length.qtDump({label:"students.length"});
// 
// students.qtPop()
// 
// students.length.qtDump({label:"students.length"});
// 
// 
// students.qtPop()
// 
// students.length.qtDump({label:"students.length"});
