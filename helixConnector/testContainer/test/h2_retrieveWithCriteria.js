var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_0-9]+)\.js/, '$1')

var testDescription;

var helixConnector = new commonTest.helixConnector({
	helixAccessParms: commonTest.config.getHelixParms(),
	authGoodies: commonTest.authGoodies
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
	'recNum'
];

var generalMapping = {
	flagField01: 'helixBoolean',
	dateField01: 'helixDateTime'
};

//upTest1_setCriterion_MatchRecNum
//upTest1_RetrieveOnRecNum
var schemaMap = {
	upTest1_Enter_SevenFields: {
		relation: '_inertProcess',
		view: 'upTest1_Enter_SevenFields',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping
	},
	upTest1_RetrieveOnRecNum: {
		relation: 'upTest1',
		view: 'upTest1_RetrieveOnRecNum',
		fieldSequenceList: generalFieldSequence,
		mapping: generalMapping,
		criterionSchemaName: 'upTest1_setCriterion_MatchRecNum'
	},
	upTest1_setCriterion_MatchRecNum: {
		relation: '_inertProcess',
		view: 'upTest1_setCriterion_MatchRecNum',
		fieldSequenceList: [
			'recNum'
		],
		mapping: generalMapping,
		retrievalSchemaName: 'upTest1_RetrieveOnRecNum'
	}
};
var testDataBatchList = [];
var recNum = 1000;

var originalRecord = [{
		textField01: 'feline',
		textField02: 'cat',
		textField03: 'tiger',
		dateField01: '',
		numField01: '',
		fixedPointField01: '',
		flagField01: 'true',
		recNum: recNum
	}
];

var revisedRecord = qtools.clone(originalRecord);
revisedRecord[0].textField01 = 'lion';

//TEST OPERATION ==================================================================

var saveRecords = function(schemaName, testRecordData, callback) {

	return function(done) {

		helixConnector.process('saveOneWithProcess', {
			schema: schemaMap[schemaName],
			otherParms: {},
			debug: false,
			inData: testRecordData,
			callback: commonTest.simpleCallback(done) //needs closure for done()
		});

	}
};

var retrieveRecords = function(schemaName, callback, criterion) {

	return function(done) {

		var schema = schemaMap[schemaName];
		schema.emptyRecordsAllowed = true;
		schema.publicEndpoint = true;

		var helixParms = {
			schema: qtools.clone(schema),
			otherParms: {},
			debug: false,
			inData: {},
			callback: callback(done)
		};

		if (schema.criterionSchemaName) {
			var criterionSchema = schemaMap[schema.criterionSchemaName];
			helixParms.schema.criterion = criterionSchema;
			helixParms.criterion = {};
			helixParms.criterion.data = criterion;
		}
		helixConnector.process('retrieveRecords', helixParms);

	};
}

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

			var first = isMatch(enhancedReferenceData, result, commonTest.ignoreHelixId, {
				hello: result
			}); //isMatch() ignores extra values in rightParm
			var second = isMatch(result, enhancedReferenceData, commonTest.ignoreHelixId, {
				orange: result
			}); //evaluate both directions means no extras

			if (first && second) {
				done()
			} else {
				done(new Error("Retrieved record does not match test record"));
			}
		}

	}
}

describe('Update record (' + moduleFileName + ')', function() {

	commonTest.standardInit(helixConnector, before, after, this);

	it("should write ORIGINAL data with no errors", saveRecords('upTest1_Enter_SevenFields', originalRecord));

	it("should retrieve the MATCHING ORIGINAL data", retrieveRecords('upTest1_RetrieveOnRecNum', matchReferenceRecords(originalRecord), {
		recNum: recNum
	}));

	it("should write REVISED data with no errors", saveRecords('upTest1_Enter_SevenFields', revisedRecord));

	it("should retrieve the MATCHING REVISED data", retrieveRecords('upTest1_RetrieveOnRecNum', matchReferenceRecords(revisedRecord), {
		recNum: recNum
	}));

});

//save a record
//verify it's there
