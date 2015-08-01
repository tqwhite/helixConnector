
var assert = require("assert")

var helixConnector = require('../helixConnector.js');
var config = require('../../config/qbook.js');
global.systemProfile = config.getSystemProfile();

helixConnector = new helixConnector({
	helixAccessParms: config.getHelixParms()
});

var helixTestPath='/Users/tqwhite/Documents/webdev/helixConnector/project/testData/testDbOne';


//   before(function(done) {
//   
// 			helixConnector.process('startDb',
// 		{
// 
// 			queryParms: {},
// 			inData: {
// 				testDbPath: helixTestPath
// 			},
// 			callback: function(err, data) {
// 			setTimeout(done, 5000, err);
// 			}
// 		}
// 		);
// 	
// 	
//   });