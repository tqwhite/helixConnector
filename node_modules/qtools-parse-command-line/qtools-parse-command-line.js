'use strict';

const fs=require('fs');

//START OF moduleFunction() ============================================================

const moduleFunction = function(args={}) {

	const workingFunctionActual=localArgs=>operatingArgs=>{
		var noFunctions = args && args.noFunctions ? args.noFunctions : false;
		var doNotRetrieveFiles = args && args.getFileData ? args.getFileData : true;
		var valuesSplitCharacter =
			args && args.valuesSplitCharacter ? args.valuesSplitCharacter : ',';

		/* someday add 
		
			arg.allowedItems={
				fileList:3, //number of files allowed
				functions:['tmp', 'otherThing']
				values:['a', 'b'],
				switches:['x', 'y']
			}
		
		also, args.errorIfNotAllowedItem:true 
		
		These seem like they could be useful.
		*/
		var figureOutWhatItIs = function(filePath) {
			var isNotFile;
			var trialString;
			var statResult;
			var fileString;

			try {
				var statResult = fs.statSync(filePath);
			} catch (err) {
				if (err && err.code == 'ENOENT') {
					isNotFile = true;
				} else if (err) {
					console.log(`qtools-parse-command-line.js says, ${err.toString()}`);
					process.exit(1);
				}
			}

			if (statResult && statResult.isDirectory()) {
				fileString = filePath;
				isNotFile = true;
			}

			if (!isNotFile) {
				fileString = fs.readFileSync(filePath, 'utf8');
				if (fileString == '') {
					return '';
				}
			}

			if (typeof fileString != 'undefined') {
				trialString = fileString;
			} else {
				trialString = filePath;
			}

			if (isNotFile) {
				result = trialString;
			} else {
				result = fileString;
			}

			try {
				//example: (function(){ return {aaa:'bbb',ccc:'ddd'} })()
				//example: (function(item, inx, all){ return new Date(); }) //this one will be evaluated at substitution time
				if (noFunctions) {
					throw 'not processing functions';
				}
				result = eval(trialString);
			} catch (err) {
				if (cmdLineSwitches.v) {
					console.log('filePath=' + filePath + '\n');
					qtools.dump({ '=-=== eval err =====': err });
				}
				try {
					var result = JSON.parse(trialString);
				} catch (err) {
					if (cmdLineSwitches.v) {
						qtools.dump({ '=-=== JSON err =====': err });
					}
				}
			}

			return result;
		};

		var fileList = [];
		var replaceObject = {};
		var transformations = {};
		var cmdLineSwitches = {};

		for (var i = 2, len = process.argv.length; i < len; i++) {
			var element = process.argv[i];

			if (element.match(/^--/)) {
				var explosion = element.match(/^--(\w+)=(.+)/);
				if (explosion) {
					var switchName = explosion[1];
					if (doNotRetrieveFiles) {
						var replacement = explosion[2];
					} else {
						var replacement = figureOutWhatItIs(explosion[2]);
					}
				} else {
					var explosion = element.match(/^--(\w+)/);
					if (explosion) {
						var switchName = explosion[1];
						if (i < len) {
							i++;
							var replacement = process.argv[i];
						} else {
							var replacement = '';
						}
					}
				}

				if (replacement == '' && !cmdLineSwitches.q) {
					console.log(element + ' is empty', 'red');
				}

				if (typeof replacement == 'number') {
					replaceObject[switchName] = replacement.toString();
				} else if (typeof replacement == 'string') {
					if (valuesSplitCharacter) {
						replacement = replacement.split(valuesSplitCharacter);
					}

					replaceObject[switchName] = replacement;
				} else if (typeof(replacement) == 'object' && typeof(replacement.length)=='undefined') {
					replaceObject = Object.assign(replaceObject, replacement);
				} else if (typeof replacement == 'function') {
					transformations[switchName] = replacement;
				} else {
					replaceObject[switchName] = true;
				}
			} else if (element.match(/^-\w/)) {
				var explosion = element.match(/-(\w+)/);
				cmdLineSwitches[explosion[1]] = true;
			} else {
				fileList.push(element);
			}
		}

		//systemd has shell level 0; nodemon shell level 2
		return {
			calledFromCommandLine: process.env.SHLVL == 1 || cmdLineSwitches.forceCalledFromCommandLine,
			fileList: fileList,
			values: replaceObject,
			functions: transformations,
			switches: cmdLineSwitches
		};
	}
	
	this.parseCommandLine=workingFunctionActual(Object.assign({}, args));
	this.getParameters=workingFunctionActual(Object.assign({}, args));

	return this;
};

//END OF moduleFunction() ============================================================


//module.exports = moduleFunction;
module.exports = new moduleFunction();

