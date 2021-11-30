//removeNullElements()


var testArray=[];
var i=0;

testArray[i]='x'+i; i++;
testArray[i]='x'+i; i++;
testArray[i]=false; i++;
testArray[i]='aaaaa'; i++;
testArray[i]=''; i++;
testArray[i]='x'+i; i++;
console.dir({'testArray':testArray});

var keepFalsy=qtools.removeNullElements(testArray, '');
var removeFalsy=qtools.removeNullElements(testArray, 'removeFalsy');

console.dir({'keepFalsy':keepFalsy});
	var list=keepFalsy;
	process.stdout.write('keepFalsy: ');
	for (var i=0, len=list.length; i<len; i++){
		var element=list[i];

		process.stdout.write(i+'='+element+', ');
	}
	process.stdout.write('\n');

console.dir({'removeFalsy':removeFalsy});
	var list=removeFalsy;
	process.stdout.write('removeFalsy: ');
	for (var i=0, len=list.length; i<len; i++){
		var element=list[i];

		process.stdout.write(i+'='+element+', ');
	}
	process.stdout.write('\n');

console.log('=============');

var testObj={},
i=0;

testObj['a'+i]='x'+i; i++;
testObj['a'+i]='x'+i; i++;
testObj['a'+i]=''; i++;
testObj['a'+i]='aaaaa'; i++;
testObj['a'+i]=false; i++;
testObj['a'+i]='x'+i; i++;

console.dir({'testObj':testObj});
var keepFalsy=qtools.removeNullElements(testObj, '');
var removeFalsy=qtools.removeNullElements(testObj, 'removeFalsy');
console.dir({'keepFalsy':keepFalsy});
console.dir({'removeFalsy':removeFalsy});

