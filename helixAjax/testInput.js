'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	events.EventEmitter.call(this);
	this.forceEvent = forceEvent;
	this.args = args;
	this.metaData = {};
	this.addMeta = function(name, data) {
		this.metaData[name] = data;
	}

	// 	qtools.validateProperties({
	// 		subject: args || {},
	// 		targetScope: this, //will add listed items to targetScope
	// 		propList: [
	// 			{
	// 				name: 'placeholder',
	// 				optional: true
	// 			}
	// 		]
	// 	});

	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};


	//LOCAL FUNCTIONS ====================================



	//METHODS AND PROPERTIES ====================================



	//INITIALIZATION ====================================


	this.html=""+
"<!DOCTYPE html>"+
"<html lang='en'>"+
"<head>"+
"	<META HTTP-EQUIV='Content-Type' CONTENT='text/html; charset=UTF-8'>"+
"	"+
"	<!-- META http-equiv='refresh' content='5;URL=http://somewhere.com' -->"+
"	"+
"	<title>Template Page Title</title>"+
"	"+
"	<script type='text/javascript' src='http://code.jquery.com/jquery-2.1.4.js'></script>"+
"	<!--link rel='stylesheet' type='text/css' href='css/main.css' /-->"+
"	"+
"	<style type='text/css'><!--"+
"	"+
"		body {"+
"			color:#4B92D1;"+
"			font-family:sans-serif;padding:100px;font-size:200%;line-height:2;"+
"		}"+
"		"+
"	--></style>"+
"	"+
"</head>"+
"<body>"+
""+

"<form method='post' action='upTest1_Enter_SevenFields'>"+
"textField01 <input type='text' name='textField01' value='animals' style='height:50px;width:250px;font-size:150%;'><br/>"+
"textField02 <input type='text' name='textField02' value='reptiles' style='height:50px;width:250px;font-size:150%;'><br/>"+
"textField02 <input type='text' name='textField03' value='FROM BROWSER' style='height:50px;width:350px;font-size:100%;'><br/>"+
"<input type='submit' style='height:50px;width:150px;'>"+
"</form>"+

"	"+
"</body>"+
""+
"<script type='text/javascript'>"+
"	/* <![CDATA[ */"+
"	$(document).ready(function(){"+
""+
//"		$('body').append('<p>Thanks for visiting!');"+
"	"+
"	"+
"	});"+
"	/* ]]> */"+
"</script>"+
""+
"</html>"+
	"";


	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;






