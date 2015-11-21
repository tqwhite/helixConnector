var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms()
});

var qtools = commonTest.qtools;

var generalFieldSequence = [
	'textField01',
	'textField02',
	'textField03',
	'dateField01',
	'numField01',
	'fixedPointField01',
	'flagField01',
];

var generalMapping={
			flagField01:'helixBoolean',
			dateField01:'helixDateTime'
};

var schemaMap = {
	upTest1_Enter_AllFields: {
		relation: '_inertProcess',
		view: 'upTest1_Enter_SevenFields',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping
	},
	upTest1_RetrieveAll: {
		relation: 'upTest1',
		view: 'upTest1_RetrieveAll',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping
	},
	upTest1_RetrieveOnTextfield01: {
		relation: 'upTest1',
		view: 'upTest1_RetrieveOnTextfield01',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping,
		criterionSchemaName: 'upTest1_setCriterion_MatchTextField01'
	},
	upTest1_setCriterion_MatchTextField01: {
		relation: '_inertProcess',
		view: 'upTest1_setCriterion_MatchTextField01',
		fieldSequenceList: [
			'textField01'
		],
		mapping: generalMapping,
		retrievalSchemaName: 'upTest1_RetrieveOnTextfield01'
	}
};

var saveRecords = function(schemaName, testRecordData, callback) {

	return function(done) {

		helixConnector.process('saveDirect', {
			authToken:commonTest.authToken,
			helixSchema: schemaMap[schemaName],
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done, 'from ' + moduleFileName) //needs closure for done()
		});

	}
};

var retrieveRecords = function(schemaName, callback, criterion) {

	return function(done) {

		var schema = schemaMap[schemaName];

		var helixParms = {
			authToken:commonTest.authToken,
			helixSchema: qtools.clone(schema),
			otherParms: {},
			debug: false,
			inData: {},
			callback: callback(done)
		};

		if (schema.criterionSchemaName) {
			var criterionSchema = schemaMap[schema.criterionSchemaName];
			helixParms.helixSchema.criterion = criterionSchema;
			helixParms.criterion = {};
			helixParms.criterion.data = criterion;
		}

		helixConnector.process('retrieveRecords', helixParms);

	};
}

var testDataBatchList = [];

testDataBatchList.push({
	criterionKeyValue: 'booleanTrue',
	recordGroup: [{
			textField01: 'booleanTrue',
			textField02: 'cat',
			textField03: 'lemur',
			dateField01: '',
			numField01: '',
			fixedPointField01: '',
			flagField01: 'true',
			}
		],
	criterion: {
		textField01: 'booleanTrue'
	}
});
testDataBatchList.push({
	criterionKeyValue: 'booleanFalse',
	recordGroup: [
	{
			textField01: 'booleanFalse',
			textField02: 'orange',
			textField03: 'peach',
			dateField01: '',
			numField01: '',
			fixedPointField01: '',
			flagField01: 'false',
		}
		],
	criterion: {
		textField01: 'booleanFalse'
	}
});
testDataBatchList.push({
	criterionKeyValue: 'integer',
	recordGroup: [
	{
			textField01: 'integer',
			textField02: 'orange',
			textField03: 'peach',
			dateField01: '',
			numField01: '999',
			fixedPointField01: '',
			flagField01: '',
		}
		],
	criterion: {
		textField01: 'integer'
	}
});
testDataBatchList.push({
	criterionKeyValue: 'fixedPoint',
	recordGroup: [
	{
			textField01: 'fixedPoint',
			textField02: 'orange',
			textField03: 'peach',
			dateField01: '',
			numField01: '',
			fixedPointField01: '3.14',
			flagField01: '',
		}
		],
	criterion: {
		textField01: 'fixedPoint'
	}
});
testDataBatchList.push({
	criterionKeyValue: 'date',
	recordGroup: [
	{
			textField01: 'date',
			textField02: 'orange',
			textField03: 'peach',
			dateField01: new Date('2015', '5', '29', '8', '38', '39'),
			numField01: '',
			fixedPointField01: '',
			flagField01: '',
		}
		],
	criterion: {
		textField01: 'date'
	}
});

var testRecordData = [];
testDataBatchList.map(function(item) {
	item.recordGroup.map(function(item) {
		testRecordData.push(item);
	});
});


var matchReferenceRecords = function(referenceData) {
	return function(done) {

		return function(err, result, misc) {

			var enhancedReferenceData = referenceData;


			enhancedReferenceData.map(function(item) {
				item.helixId = 0; //this comes from Helix always, can't control value
			});

			if (err) {
				done(err);
			}
			

			
			
			var first = isMatch(enhancedReferenceData, result, commonTest.ignoreHelixId, {hello:result}); //isMatch() ignores extra values in rightParm
			var second = isMatch(result, enhancedReferenceData, commonTest.ignoreHelixId, {orange:result}); //evaluate both directions means no extras

			if (first && second) {
				done()
			} else {
				done(new Error("Retrieved record does not match test record"));
			}
		}

	}
}


describe('Data formatting save functions (' + moduleFileName + ')', function() {


	commonTest.standardInit(helixConnector, before, after, this);

	it("should write data with no errors", saveRecords('upTest1_Enter_AllFields', testRecordData));


	for (var i = 0, len = testDataBatchList.length; i < len; i++) {
		var element = testDataBatchList[i];
		it("should retrieve correct data based on the criterion " + element.criterionKeyValue, retrieveRecords('upTest1_RetrieveOnTextfield01', matchReferenceRecords(element.recordGroup), element.criterion));
	}



	it("should retrieve all the data correctly", retrieveRecords('upTest1_RetrieveAll', matchReferenceRecords(testRecordData)));



});












