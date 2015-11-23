var commonTest = require('../commonTest.js');
var assert = require("assert");
var isMatch = require('lodash.ismatch');

var moduleFileName = module.filename.replace(/^\/.*\/([a-zA-Z_]+)\.js/, '$1')

var testDescription;
var qtools = commonTest.qtools;
var request = commonTest.request;
var simpleCallback = commonTest.simpleCallback;
var ajaxUri = commonTest.ajaxUri;

var generalHeader = {
	'Authorization': commonTest.authGoodies.userId + ' ' + commonTest.authGoodies.authToken
};

var evaluator=function(referenceItem){
return function(body){

	var preparedReferenceItem=qtools.toType(referenceItem);
	var bodyItem=body?JSON.parse(body):'';
	
	
	var	preparedBody=qtools.toType(bodyItem);

	if (preparedBody!=preparedReferenceItem){
		return new Error('Retrieved data not the same type as reference ('+preparedBody+'!='+preparedReferenceItem+')');
	}
	else{
		return;
	}
}

}

var evaluator2=function(referenceItem){
return function(body){

	var preparedReferenceItem=qtools.clone(referenceItem);
	var bodyItem=JSON.parse(body);
	var	preparedBody=bodyItem;
	
	preparedReferenceItem.map(function(item){ item.helixId=1;});

	var first = isMatch(preparedReferenceItem[0], bodyItem[0], commonTest.ignoreHelixId); //isMatch() ignores extra values in rightParm
	var second = isMatch(bodyItem[0], preparedReferenceItem[0], commonTest.ignoreHelixId); //evaluate both directions means no extras

	if (first && second) {
		return;
	} else {
		return new Error("Retrieved record does not match test record");
	}

}

}

var testData1=[{
	textField01: 'animal',
	textField02: 'ferret',
	textField03: 'from ajax test',
	dateField01: '',
	numField01: '',
	fixedPointField01: '',
	flagField01: ''
}]

describe('Data access functions (' + moduleFileName + ')', function() {

	commonTest.standardInit(before, after, this);

	testDescription = "should throw error for bad schema"
	it(testDescription, function(done) {

		request.get({
			uri: ajaxUri+"XXX",
			headers: generalHeader
		}, simpleCallback(done, 'No such schema'));

	});

	testDescription = "should produce empty array on first 'upTest1_RetrieveAll'"
	it(testDescription, function(done) {

		request.get({
			uri: ajaxUri+"upTest1_RetrieveAll",
			headers: generalHeader
		}, simpleCallback(done, evaluator([])));

	});

	testDescription = "should successfully write to database"
	it(testDescription, function(done) {
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			json:true,
			body:testData1,
		}, simpleCallback(done, evaluator('')));

	});
	

	testDescription = "should retrieve the same data'"
	it(testDescription, function(done) {

		request.get({
			uri: ajaxUri+"upTest1_RetrieveAll",
			headers: generalHeader
		}, simpleCallback(done, evaluator2(testData1)));

	});

});

