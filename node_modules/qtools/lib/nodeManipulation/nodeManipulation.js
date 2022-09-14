var employerFilePath=function(employerModule){
	var moduleFileName = employerModule.filename.replace(/^\/.*\/([0-9a-zA-Z_-]+\.js)/, '$1');
	return employerModule.filename.replace(new RegExp(moduleFileName+'$'), '');
}

var extractParameters = function(argv, program) {
	//both parameters are optional, args will be extracted from the process global variable
	//program refers to commander.js, a node module for command line process
	var self = this;

	var optionList,
		rawArgList,
		argumentData = {};

	if (typeof (program) != 'undefined') {
		optionList = program.options;
	}

	if (argv) {
		rawArgList = argv;
	} else if (typeof (process) != 'undefined') {
		rawArgList = process.argv
	} else {
		return {};
	}

	for (var j = 0, len2 = rawArgList.length; j < len2; j++) {
		var argElement = rawArgList[j];
		var flagMatchResult = argElement.match(/^(-.*)=(.*)/);

		if (!flagMatchResult) {
			continue;
		}


		var flag = flagMatchResult[1].replace(/-+/g, ''),
			argument = flagMatchResult[2];

		if (optionList) {
			var optionItemShort = self.getByProperty(optionList, 'short', flagMatchResult[1]),
				optionItemLong = self.getByProperty(optionList, 'long', flagMatchResult[1]);
			var optionItem = optionItemShort || optionItemLong;
			argumentData[optionItem.long.replace(/-+/g, '')] = argument;
		} else {
			argumentData[flag] = argument;
		}




	}
	return argumentData;
}

module.exports = {
	extractParameters: extractParameters,
	employerFilePath:employerFilePath
}
