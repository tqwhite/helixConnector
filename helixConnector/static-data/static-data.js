'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });
const async = require('async');
const path = require('path');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	qtools.validateProperties({
		subject: args || {},
		targetScope: this, //will add listed items to targetScope
		propList: [
			{
				name: 'placeholder',
				optional: true
			},
			{
				name: 'initCallback',
				optional: true
			}
		]
	});

	//LOCAL VARIABLES ====================================
	

	//LOCAL FUNCTIONS ====================================
	
	//METHODS AND PROPERTIES ====================================
	
	this.get=(staticTestData, staticDataDirectoryPath, helixSchema, helixAccessParms)=>{
	
	const makeArray=(inData, fieldSep, recordSep)=>{
	fieldSep ||  qtools.logWarn('helix schema has no separators.field property');
	recordSep ||  qtools.logWarn('helix schema has no separators.record property');
	return inData.toString().split(recordSep).map(recordString=>recordString.split(fieldSep))
	}


			let maybeFunc = '';
			try {
				maybeFunc = eval(staticTestData);
			} catch (e) {}
			
			let outData;
			
			if (typeof(staticTestData)=='object'){
				return staticTestData;
			}

			const staticDataPath = path.join(
				staticDataDirectoryPath,
				staticTestData
			);

			if (typeof maybeFunc == 'function') {
				outData = maybeFunc(helixSchema);
			} else if (qtools.realPath(staticDataPath)) {
				outData=makeArray(qtools.fs.readFileSync(staticDataPath), helixSchema.separators.field, helixSchema.separators.record);

if (outData && helixSchema.fieldSequenceList[0]==outData[0][0]){
outData=outData.slice(1, outData.length);
}




			} else {
				outData = staticTestData;
			}
			
			return outData;
			
			}
	//API ENDPOINTS ====================================
	
	
	//INITIALIZATION ====================================

	console.log(__dirname);
	
	!this.initCallback || this.initCallback();

	//ECOSYSTEM REQUIREMENTS ====================================
	
	const ping = (message = 'NO MESSAGE SUPPLIED') => {
		return `${qtools.ping().employer} got the ${message}`;
	};
	
	this.ping = ping;

	this.shutdown = (message, callback) => {
		console.log(`\nshutting down ${qtools.ping().employer}`);
		callback('', message);
	};

	return this;
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

