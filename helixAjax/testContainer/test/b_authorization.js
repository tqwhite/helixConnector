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
	var	preparedBody=qtools.toType(JSON.parse(body));


	if (preparedBody!=preparedReferenceItem){
		return new Error('Retrieved data not the same type as reference ('+preparedBody+'!='+preparedReferenceItem+')');
	}
	else{
		return;
	}
}

}

var userId='hello world';
var authGoodies;
/*

Add test to confirm correct function when there is no authorize at all

*/


/*
authToken gen works properly when operated from a web browser. This test gives 
totally weird results. I guess I am doing something wrong in the request but don't know what.
*/
describe.skip('Authorization functions (' + moduleFileName + ')', function() {

	commonTest.standardInit(before, after, this);

	testDescription = "should produce a token with no error"
	it(testDescription, function(done) {

		request.post({
			uri: ajaxUri+"generateToken",
			headers: generalHeader,
			json:true,
			body:{userId:userId},
		}, function(error, response, body){
authGoodies=body;
console.log("\n=-=============   qtools.listProperties  =========================\n");


qtools.dump({"response":response});


console.log("\n=-=============   qtools.listProperties  =========================\n");




			done(error);
		});

	});

	testDescription = "be able to use the token"
	it(testDescription, function(done) {

qtools.dump({"authGoodies":authGoodies});


		request.post({
			uri: ajaxUri+"generateToken",
			headers: generalHeader,
			json:true,
			body:{userId:userId},
		}, function(error, response, body){
authGoodies=body;
			done(error);
		});

	});

});

