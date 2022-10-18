# qtools Parse Command Line


processCommandLine() analyzes argv and returns the results for use by
the calling program.

For historical reasons, it defaults to evaluating incoming Javascript.
This can, of course, be dangerous. It should be called with the
'noFunctions:true' argument unless you need function evaluation.

var commandLineParms = qtools.parseCommandLine({noFunctions:true})

processCommandLine() produces an object with four
elements:
   { calledFromCommandLine: true|false,
	 fileList:[],
	 values: {},
	 functions: {},
	 switches: {}
	}

fileList is anything that is has no switch and resolves to a file or directory

VALUE PARAMETERS

--name=value

UPDATE (6/28/18) added:

--name value

UPDATE (11/4/19) ADDED:

--namelist=sam,henry,joan

(If valuesSplitCharacter is specified in args; otherwise, still a string)

applies to all cases below.

Anything in the command line of that form is processed to become
either a value or a function.

1) Parsed to see if it's javascript and evaluated
	eg,

		--tmp="(2+5)"

	produces a property 

		values:{tmp:7}

	or,

		--tmp="(function(a){return 2*a})"

	produces a property 

		functions:{tmp:function(a){return 2*a;}}

	that can be called later as commandLineOutput.functions.tmp(parameter)

	or (of course),

		--tmp="hello world"

	produces a property 

		values:{tmp:"hello world"}

	however, there is a special case for strings, eg,

		--tmp=/path/to/function.js

	is checked to see if it resolves to a file. (The path is *not* relative 

	or glob'd. It must be fully specified.)

	

	If it does not produce a value, the property is then eval'd to

	see if it produces a value.

		values:{tmp:"/path/to/function.js"}

	If it does parse and produce a value, the property is,

		values:{tmp:'some value resulting from the file'}

	unless it results in a function, in which case, the property is,

		functions:{tmp:function(){/ *whatever is in the file* /}}

	

	Important note: The function definition must be wrapped in parenthesis.

	eg,

		(function(input){ return input*2;})

	Otherwise it will not eval() and will be treated as a string value.

		

SWITCHES 

-switchName 

Anything of that form creates a property,
	values:{switchName:true}