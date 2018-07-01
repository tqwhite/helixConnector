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

var testArray=[{
	textField01: 'animal',
	textField02: 'ferret',
	textField03: 'from ajax test',
	dateField01: '',
	numField01: '',
	fixedPointField01: '',
	flagField01: ''
}];

var testObject={
	textField01: 'animal',
	textField02: 'ferret',
	textField03: 'from ajax test',
	dateField01: '',
	numField01: '',
	fixedPointField01: '',
	flagField01: ''
};

var emptyObject={
	textField01: '',
	textField02: '',
	textField03: '',
	dateField01: '',
	numField01: '',
	fixedPointField01: '',
	flagField01: ''
};

describe('Post data format (' + moduleFileName + ')', function() {

	commonTest.standardInit(before, after, this);

// 	testDescription = "should be successful with an array"
// 	it(testDescription, function(done) {
// 		request.post({
// 			uri: ajaxUri+"upTest1_Enter_SevenFields",
// 			headers: generalHeader,
// 			json:true,
// 			body:testArray,
// 		}, simpleCallback(done));
// 
// 	});
// 
// 	testDescription = "should be successful with an object"
// 	it(testDescription, function(done) {
// 		request.post({
// 			uri: ajaxUri+"upTest1_Enter_SevenFields",
// 			headers: generalHeader,
// 			json:true,
// 			body:testObject,
// 		}, simpleCallback(done));
// 
// 	});
// 
// 	testDescription = "should be fail with a string"
// 	it(testDescription, function(done) {
// 		request.post({
// 			uri: ajaxUri+"upTest1_Enter_SevenFields",
// 			headers: generalHeader,
// 			json:true,
// 			body:'asfasd',
// 		}, simpleCallback(done, 'invalid json'));
// 
// 	});
// 
// 	testDescription = "should be fail with a number"
// 	it(testDescription, function(done) {
// 		request.post({
// 			uri: ajaxUri+"upTest1_Enter_SevenFields",
// 			headers: generalHeader,
// 			json:true,
// 			body:555,
// 		}, simpleCallback(done, 'invalid json'));
// 
// 	});

	testDescription = "should fail with no data property sent"
	it(testDescription, function(done) {
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			json:true
		}, simpleCallback(done, 'Record data must be supplied'));

	});

	testDescription = "should be fail with empty object"
	it(testDescription, function(done) {
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			body:{},
			json:true
		}, simpleCallback(done, 'Record data must be supplied'));

	});

	testDescription = "should be fail with all properties empty"
	it(testDescription, function(done) {
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			body:emptyObject,
			json:true
		}, simpleCallback(done, 'fields that are all missing'));

	});

	testDescription = "should be fail with an array of objects including one with empty properties"
	it(testDescription, function(done) {
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			body:[emptyObject, testObject],
			json:true
		}, simpleCallback(done, 'fields that are all missing'));

	});

	testDescription = "should succeed with good records"
	it(testDescription, function(done) {
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			body:[testObject, testObject],
			json:true
		}, simpleCallback(done));

	});

	testDescription = "should be fail with a property that is not part of the schema"
	it(testDescription, function(done) {
		var dementedObject=qtools.clone(testObject);
		dementedObject.foreignProperty='hello';
		request.post({
			uri: ajaxUri+"upTest1_Enter_SevenFields",
			headers: generalHeader,
			body:dementedObject,
			json:true
		}, simpleCallback(done, 'no field named'));

	});
	


});

