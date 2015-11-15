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
	'textField03'
];

var schemaMap = {
	upTest1_Enter_AllFields: {
		relation: '_inertProcess',
		view: 'upTest1_Enter_SevenFields',
		fieldSequenceList: generalFieldSequence,
		mapping: {}
	},
	upTest1_RetrieveAll: {
		relation: 'upTest1',
		view: 'upTest1_RetrieveAll',
		fieldSequenceList: generalFieldSequence,
		mapping: {}
	},
	upTest1_RetrieveOnTextfield01: {
		relation: 'upTest1',
		view: 'upTest1_RetrieveOnTextfield01',
		fieldSequenceList: generalFieldSequence,
		mapping: {},
		criterionSchemaName: 'upTest1_setCriterion_MatchTextField01'
	},
	upTest1_setCriterion_MatchTextField01: {
		relation: '_inertProcess',
		view: 'upTest1_setCriterion_MatchTextField01',
		fieldSequenceList: [
			'textField01'
		],
		mapping: {},
		retrievalSchemaName: 'upTest1_RetrieveOnTextfield01'
	}
};

var saveRecords = function(testRecordData) {

	return function(done) {

		helixConnector.process('saveDirect', {
			helixSchema: schemaMap.upTest1_Enter_AllFields,
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done, 'from ' + moduleFileName)
		});

	}
};

var retrieveRecords = function(callback, schemaName, criterion) {

	return function(done) {

		var schema = schemaMap[schemaName];

		var helixParms = {
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
	criterionKeyValue: 'oregano',
	recordGroup: [{
			textField01: 'oregano',
			textField02: 'cat',
			textField03: 'lemur'
		}, {
			textField01: 'oregano',
			textField02: 'garlic',
			textField03: 'marjoram'
		}],
	criterion: {
		textField01: 'oregano'
	}
});
testDataBatchList.push({
	criterionKeyValue: 'lemon',
	recordGroup: [{
			textField01: 'lemon',
			textField02: 'orange',
			textField03: 'peach'
		}, {
			textField01: 'lemon',
			textField02: 'plum',
			textField03: 'grape'
		}],
	criterion: {
		textField01: 'lemon'
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
			var first = isMatch(enhancedReferenceData, result, commonTest.ignoreHelixId); //isMatch() ignores extra values in rightParm
			var second = isMatch(result, enhancedReferenceData, commonTest.ignoreHelixId); //evaluate both directions means no extras

			if (first && second) {
				done()
			} else {
				done(new Error("Retrieved record does not match test record"));
			}
		}

	}
}


describe('Multiple criteria functions (' + moduleFileName + ')', function() {


	commonTest.standardInit(helixConnector, before, after, this);

	it("should write data with no errors", saveRecords(testRecordData));


	for (var i = 0, len = testDataBatchList.length; i < len; i++) {
		var element = testDataBatchList[i];
		it("should retrieve correct data based on the criterion " + element.criterionKeyValue, retrieveRecords(matchReferenceRecords(element.recordGroup), 'upTest1_RetrieveOnTextfield01', element.criterion));
	}



	it("should retrieve all the data correctly", retrieveRecords(matchReferenceRecords(testRecordData), 'upTest1_RetrieveAll'));



});











