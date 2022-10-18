#!/usr/bin/env node

const moduleName=__filename.replace(__dirname+'/', '').replace(/.js$/, ''); //this just seems to come in handy a lot

const qt = require('qtools-functional-library');
const commandLineParameters = commandLineParser.getParameters();

//PROCESS STRING ========================================================

var convertText = (inString, callback) => {
	const valuesString = inString.toUpperCase();
	
	callback('', valuesString);
};

//INPUT/OUTPUT ========================================================

let inString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
	inString += data;
});
process.stdin.on('end', () =>
	convertText(inString, (err, result) => {
		if (err) {
			// prettier-ignore
			process.stdout.write(`${''.padEnd(50, '=')}\n\nERROR:  ${err.toString()}\n\n${''.padEnd(50, '=')}\n\n${inString}`);
			return;
		}

		process.stdout.write(result);
	})
);

