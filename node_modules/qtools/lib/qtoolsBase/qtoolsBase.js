'use strict';
var util = require('util');
var fs = require('fs');

//START OF moduleFunction() ============================================================
var moduleFunction = function(self) {
	//remember, this is instantiated by qtools.js
	//INITIALIZATION ====================================
	self.forceEvent = function(eventName, outData) {
		self.emit(eventName, { eventName: eventName, data: outData });
	};

	var self = self;
	var qtools = self;
	self.fs = fs;

	var delimitterHeavy =
		'========================================================';
	var delimitterLight =
		'--------------------------------------------------------';
	var topDelim = '\n\n' + delimitterLight + '\n\n';
	var bottomDelim = '\n\n' + delimitterHeavy + '\n\n';

	//LOCAL FUNCTIONS ====================================

	//BUILD OBJECT ====================================
	self.colors = require('colors');
	self.colors.gray = self.colors.grey;
	//bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow, zebra, random
	self.delimitter = delimitterHeavy;
	//sometimes it's convenient to be able to use this from outside
	self.topDelim = delimitterHeavy;
	self.bottomDelim = delimitterLight;

	self.wrapMessage = function(message) {
		return (
			'\n\n' +
			delimitterLight +
			'\n\n' +
			message +
			'\n\n' +
			delimitterHeavy +
			'\n\n'
		);
	};

	self.hash = function(inData) {
		return self.passwordHash(inData);
	};

	self.passwordHash = function(password = '', salt, args) {
		//from: http://stackoverflow.com/questions/19236327/nodejs-sha256-password-encryption
		if (typeof self.crypto == 'undefined') {
			self.crypto = require('crypto');
		}

		args = args || {};
		var algorithmName = args.algorithmName || 'sha256';
		var outputFormat = args.outputFormat || 'hex';

		var hash = self.crypto
			.createHash(algorithmName)
			.update(password)
			.digest(outputFormat);
		return hash;
	};

	self.uniqueId = Math.floor(Math.random() * 100000);

	var calcHash = function(args) {
		if (typeof self.crypto == 'undefined') {
			self.crypto = require('crypto');
		}
		var inString = args.inString || self.crypto.randomBytes(40).toString('hex');
		var salt = args.salt || 'returns same thing if inString is specified';
		if (typeof self.crypto == 'undefined') {
			self.crypto = require('crypto');
		}
		return self.crypto
			.pbkdf2Sync(
				inString.toString(),
				salt.toString(),
				args.iterations,
				args.keyLength,
				'sha512'
			)
			.toString('hex');
	};

	self.newId = function(args) {
		var sampleArg = {
			inString: 'password',
			resultLength: 6,
			//
			allowRepeat: false
		};
		var sampleArg = {
			resultLength: 6,
			//defaults to 6,
			allowRepeat: false,
			//defaults to false
			uniqueSpaceId: 'categoryName',
			inString: 'password',
			//optional, returns random string of keyLength
			salt: 'x',
			//optional, defaults to some constant string
			//optional, defaults to 10
			iterations: 10
		};

		args = qtools.clone(args);
		//don't want to risk writing back to caller
		if (typeof self.invocationCount == 'undefined') {
			self.invocationCount = 0;
		}
		self.invocationCount++;
		args = args || {};
		args.iterations = 10;
		args.keyLength = Math.max(Math.ceil(args.resultLength / 2), 1) || 3;
		//returns hex, two chars per result byte
		var idListName = args.uniqueSpaceId ? args.uniqueSpaceId : 'idList';

		if (typeof self[idListName] == 'undefined') {
			self[idListName] = [];
		}

		var keySpace = Math.pow(16, args.keyLength * 2);

		var a = calcHash(args);
		if (args.allowRepeat || self[idListName].indexOf(a) < 0) {
			self[idListName].push(a);
			return a;
		} else {
			if (self[idListName].length == keySpace) {
			} else {
				for (var i = 0, len = keySpace; i < len; i++) {
					args.inString += '-' + i;
					a = calcHash(args);

					if (self[idListName].indexOf(a) < 0) {
						self[idListName].push(a);
						return a;
					}

					continue;
				}
			}
		}

		//		var outMessage="qtools.newId used up all " + keySpace + " combinations of " + args.keyLength*2 + " length hexadecimal keys";
		//		throw outMessage;
		return '';
	};
	self.oldGuid = function() {
		//thanks 'broofa': http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
			.replace(/[xy]/g, function(c) {
				var r = (Math.random() * 16) | 0;
				var v = c == 'x' ? r : (r & 3) | 8;
				return v.toString(16);
			})
			.toLowerCase();
	};
	
	self.newUuid = function(args) {
		var uuid = require('uuid'); //also thanks to broofa!!

		if (typeof args == 'number') {
			if ([1, 4].indexOf(args) == -1) {
				return 'Only versions 1 and 4 are allowed';
			}
			return uuid[`v${args}`]();
		}

		if (typeof args == 'string') {
			if (['v1', 'v4'].indexOf(args) == -1) {
				return 'Only v1 and v4 are allowed';
			}
			return uuid[args]();
		}

		return `args of type ${typeof args} are not yet supported.`;
	};
	
	self.newGuid = function(args) {
		if (!args) {
			return self.oldGuid();
		} else {
			return self.newUuid(args);
		}
	};

	self.dump = function(inData, returnStringFlag) {
		returnStringFlag = returnStringFlag ? returnStringFlag : false;
		const moduleName = qtools.ping().employer;

		if (returnStringFlag) {
			return util.inspect(inData, { depth: null, maxArrayLength: null });
		} else {
			console.log(
				'\n' + util.inspect(inData, { depth: null }) + ` [${moduleName}]\n`
			);
		}
	};

	self.dumpDetail = function(inData, detailPath, message, returnStringFlag) {
		if (qtools.toType(inData) != 'array') {
			qtools.message('qtools.dumpDetail() only works on arrays');
			return;
		}
		const displayList = [];
		inData.forEach(item => {
			displayList.push(qtools.getByProperty(item, detailPath));
		});

		if (message) {
			qtools.dump({ [message]: displayList });
		} else {
			qtools.dump(displayList);
		}
	};

	self.dumpToFile = function(inData, filePath, fileOptions) {
		var outString = self.dump(inData, true);
		if (fileOptions.addSeparator) {
			outString = self.wrapMessage(outString);
		}

		self.writeSureFile(filePath, outString, fileOptions);
	};

	self.addSpaces = function(inString, desiredLength, fillChar) {
		fillChar = fillChar ? fillChar : ' ';
		var len = inString.length;
		var remainder = Math.ceil((desiredLength - len) / fillChar.length);
		var outString = inString;

		for (var i = 0; i < remainder; i++) {
			outString += fillChar;
		}
		return outString;
	};

	self.dumpFlat = function(inData, returnStringFlag, filterList) {
		if (typeof returnStringFlag != 'string') {
			returnStringFlag = returnStringFlag ? returnStringFlag : false;
		}

		var dottedPathList = qtools.extractDottedPaths(inData);
		var outString = '';

		if (typeof returnStringFlag == 'string') {
			console.log('\n\nSTART ' + returnStringFlag + ' ' + delimitterHeavy);
		}

		var maxNameLength = 0;
		for (var i = 0, len = dottedPathList.length; i < len; i++) {
			var element = dottedPathList[i];
			var len2 = element.length;
			var maxNameLength = len2 > maxNameLength ? len2 : maxNameLength;
			if (len2 > maxNameLength) {
				var last = element;
			}
		}
		maxNameLength = maxNameLength + 5;

		for (var i = 0, len = dottedPathList.length; i < len; i++) {
			var element = dottedPathList[i];
			var violatesFilter = false;

			if (filterList) {
				violatesFilter = true;
				for (var j = 0, len2 = filterList.length; j < len2; j++) {
					if (element.match(new RegExp(filterList[j]))) {
						violatesFilter = false;
						break;
					}
				}
			}

			if (violatesFilter) {
				continue;
			}

			var value = qtools.getSurePath(inData, element);

			if (typeof value != 'undefined') {
				outString += self.addSpaces(element, maxNameLength, '.') + ' ' + value;
			} else {
				outString += element.replace(/^\./, '');
			}

			if (!returnStringFlag || typeof returnStringFlag == 'string') {
				console.log(outString);
				outString = '';
			} else {
				outString += '\n';
			}
		}

		if (typeof returnStringFlag == 'string') {
			if (typeof returnStringFlag == 'string') {
				console.log('END ' + returnStringFlag + ' ' + delimitterLight + '\n\n');
			}
		} else if (returnStringFlag) {
			return outString;
		}
	};

	self.removeNullElements = function(target, removeFalsy, keepFunction) {
		removeFalsy = !(
			typeof removeFalsy == 'undefined' ||
			removeFalsy === '' ||
			removeFalsy === false
		);
		//ie, any non-false value says removeFalsy values
		if (typeof keepFunction == 'undefined') {
			keepFunction = function(element, removeFalsy) {
				return (
					element ||
					(removeFalsy &&
						(typeof element == 'boolean' || typeof element == 'integer'))
				);
			};
		}

		if (typeof target == 'object' && typeof target.length != 'undefined') {
			var outArray = [];
			var inx = 0;
			for (var i = 0, len = target.length; i < len; i++) {
				var element = target[i];
				if (keepFunction(element, removeFalsy)) {
					outArray[inx] = element;
					inx++;
				}
			}
			return outArray;
		} else if (typeof target == 'object') {
			var outObj = {};
			for (var i in target) {
				var element = target[i];
				if (keepFunction(element, removeFalsy)) {
					outObj[i] = element;
				}
			}

			return outObj;
		} else {
			throw "qtoolsBase.removeNulls() says, 'target must be object or array'";
		}
	};

	self.removeFromArray = function(inArray, from, to) {
		/*
			Array Remove - By John Resig (MIT Licensed)
			http://ejohn.org/blog/javascript-array-remove/
			Remove the second item from the array
				array.remove(1);
			Remove the second-to-last item from the array
				array.remove(-2);
			Remove the second and third items from the array
				array.remove(1,2);
			Remove the last and second-to-last items from the array
				array.remove(-2,-1);
		*/
		var rest = inArray.slice((to || from) + 1 || inArray.length);
		inArray.length = from < 0 ? inArray.length + from : from;
		return inArray.push.apply(inArray, rest);
	};
	self.getByProperty = function(
		inData,
		propertyName,
		propertyValue,
		defaultValue
	) {
		const isRegExp = propertyValue instanceof RegExp;

		if (inData.length) {
			var len = inData.length;
			var inx = 0;
			for (inx = 0; inx < len; inx++) {
				const item = self.getSurePath(inData[inx], propertyName);
				if (
					item == propertyValue ||
					(isRegExp && typeof item != 'undefined' && item.match(propertyValue))
				) {
					return inData[inx];
				}
			}
		} else if (typeof inData == 'object') {
			for (var inx in inData) {
				const item = self.getSurePath(inData[inx], propertyName);
				if (
					item == propertyValue ||
					(isRegExp && typeof item != 'undefined' && item.match(propertyValue))
				) {
					return inData[inx];
				}
			}
		}
		return defaultValue;
	};
	self.getAllByProperty = function(inData, propertyName, propertyValue) {
		const isRegExp = propertyValue instanceof RegExp;
		const outList = [];
		if (inData.length) {
			var len = inData.length;
			var inx = 0;
			for (inx = 0; inx < len; inx++) {
				const item = self.getSurePath(inData[inx], propertyName);
				if (item == propertyValue || (isRegExp && item.match(propertyValue))) {
					outList.push(inData[inx]);
				}
			}
		} else if (typeof inData == 'object') {
			for (var inx in inData) {
				const item = self.getSurePath(inData[inx], propertyName);
				if (item == propertyValue || (isRegExp && item.match(propertyValue))) {
					outList.push(inData[inx]);
				}
			}
		}
		return outList;
	};

	self.getIndexByValueDISCARD = function(
		inObject,
		propertyValue,
		dottedSubPath
	) {
		//qtools.getIndexByValue(self.dataSource.tmp, "z", 'inner.val');
		for (var i in inObject) {
			var element = inObject[i];
			if (typeof dottedSubPath != 'undefined') {
				element = qtools.getSurePath(element, dottedSubPath);
			}

			if (element === propertyValue) {
				return i;
			}
		}
	};

	self.getIndexByValue = function(inObject, propertyValue, dottedSubPath) {
		propertyValue = propertyValue.trim();
		if (qtools.toType(inObject) == 'object') {
			//qtools.getIndexByValue(self.dataSource.tmp, "z", 'inner.val');
			for (var i in inObject) {
				var element = inObject[i];
				if (typeof dottedSubPath != 'undefined') {
					element = qtools.getSurePath(element, dottedSubPath);
				}

				if (element === propertyValue) {
					return i;
				}
			}
		} else if (qtools.toType(inObject) == 'array') {
			for (var i = 0, len = inObject.length; i < len; i++) {
				var element = inObject[i];
				if (element == propertyValue) {
					return i;
				}
			}
		} else {
			return '';
		}
	};

	// 	self.clone = function(inData) {
	// 		return JSON.parse(JSON.stringify(inData));
	// 	}
	self.isEmpty = function(arg) {
		var objectEmptyFlag;

		if (typeof arg == 'function') {
			return false;
		}

		if (typeof arg == 'undefined') {
			return true;
		}

		if (typeof arg == 'object') {
			objectEmptyFlag = true;
			//assume it's empty until further notice
			for (var item in arg) {
				objectEmptyFlag = false; //found one
			}
		} else {
			objectEmptyFlag = false; //can't be full if it's not an object
		}

		return objectEmptyFlag || arg == '' || arg.length == 0;
	};

	self.isNotEmpty = function(arg) {
		return !self.isEmpty(arg);
	};

	self.die = function(exceptionData) {
		switch (exceptionData) {
			case 'defer':
				setTimeout(function() {
					self.die('died after delay');
				}, 10000);
				break;
			case 'silent':
				process.exit(1);
				break;
			case 'trace':
				//stack
				console.log('\n\n================================\n');
				console.trace();
				console.log('\n================================\n\n');
				process.exit(1);
				break;
			default:
				var prefix = this.employerFilename
					? this.employerFilename
					: 'qtools.die()';
				var outObj = {};

				if (exceptionData) {
					prefix = prefix + ' says';
					outObj[prefix] = exceptionData;
					this.dump(outObj);
				} else {
					console.log(
						topDelim + 'Exiting ' + prefix + ' via qtools.die()' + bottomDelim
					);
				}
				process.exit(1);
				break;
		}
	};

	self.errorExit = function(exceptionData) {
		var outMessage;
		if (typeof exceptionData != 'string') {
			outMessage = self.dump(exceptionData, true);
		} else {
			outMessage = exceptionData;
		}

		process.stderr.write(outMessage);
		process.exit(1);
	};

	self.successExit = function(exceptionData) {
		if (exceptionData) {
			var outMessage = '';
			if (typeof exceptionData != 'string') {
				outMessage = self.dump(exceptionData, true);
			}
			process.stderr.write(outMessage);
		}
		process.exit(0);
	};

	self.message = function(messageData, color, longFilename) {
		if (typeof console == 'undefined') {
			return;
		}
		if (typeof longFilename == 'undefined') {
			longFilename = false;
		}
		var prefix = '\n**==*: ';
		var showEmployer = this.employerFilename
			? '(' + this.employerFilename + ')'
			: '';
		var suffix = longFilename
			? ' (' + __dirname + '/' + this.employerFilename + ')\n'
			: showEmployer + '\n';
		var message;
		if (typeof messageData == 'string') {
			message = prefix + messageData + suffix;
			if (color) {
				console.log(message[color].bold);
			} else {
				console.log(message.red.bold);
			}
			return;
		}
	};

	self.byObjectProperty = function(fieldName, transformer) {
		//called: resultArray=someArray.sort(qtools.byObjectProperty('somePropertyName'));
		//based on closure of fieldName
		var fullNameSort;
		return (fullNameSort = function(a, b) {
			var localFieldName = fieldName;
			var localTransformer = transformer;
			//for debug
			if (typeof fieldName == 'function') {
				var aa = a;
				var bb = b;
				transformer = fieldName;
			} else {
				var aa = qtools.getSurePath(a, fieldName);
				var bb = qtools.getSurePath(b, fieldName);
			}

			if (typeof transformer == 'function') {
				aa = transformer(aa);
				bb = transformer(bb);
			} else if (transformer) {
				switch (transformer) {
					case 'caseInsensitive':
						aa = aa.toLowerCase();
						bb = bb.toLowerCase();
						break;
					default:
						qtools.consoleMessage(
							'qtools.byObjectProperty says, No such transformer as: ' +
								transformer
						);
						break;
				}
			}

			if (!bb && !aa) {
				return 0;
			}
			if (!bb) {
				return -1;
			}
			if (!aa) {
				return 1;
			}

			if (aa > bb) {
				return 1;
			}
			if (aa < bb) {
				return -1;
			}
			return 0;
		});
	};
	self.listProperties = function(inObject, toString, args) {
		args = args ? args : {};
		var maxShowStringLength = args.maxShowStringLength
			? maxShowStringLength
			: 100;

		if (typeof toString == 'undefined') {
			toString = false;
		}
		var outString = '';
		var list = [];
		var count = 0;
		var type = qtools.toType(inObject);

		if (type == 'object' || type == 'arguments') {
			var outList = [];
			for (var i in inObject) {
				var element = inObject[i];
				var hadProperties = true;
				var showElement;
				if (
					['object', 'array', 'function', 'map'].indexOf(
						qtools.toType(element)
					) == -1
				) {
					if (element == null) {
						showElement = 'null'.green;
					} else {
						if (element.length > maxShowStringLength) {
							element =
								element.substr(0, maxShowStringLength) +
								' ... (length=' +
								element.length +
								')';
						}
						if (toString) {
							showElement = element.toString();
						} else {
							showElement = element.toString().green;
						}
					}
					if (toString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							qtools.toType(element) +
							' value= ' +
							showElement;
					} else {
						var tmp =
							('item #' + count + " named '").grey +
							i.red +
							"' is a ".grey +
							qtools.toType(element).red +
							' value= '.grey +
							showElement;
					}
					outList.push({ name: i, string: tmp });
				} else {
					if (toString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							qtools.toType(element);
					} else {
						var tmp =
							('item #' + count + " named '").grey +
							i.red +
							"' is a ".grey +
							qtools.toType(element).red;
					}
					outList.push({ name: i, string: tmp });
				}
				count++;
			}

			outList = outList.sort(qtools.byObjectProperty('name'));

			for (var i = 0, len = outList.length; i < len; i++) {
				var element = outList[i];

				if (!toString) {
					console.log(element.string);
				} else {
					outString += element.string + ';     ';
				}
			}
		} else if (type == 'array') {
			for (var i = 0, len = list.length; i < len; i++) {
				var element = inObject[i];
				var hadProperties = true;

				if (!toString) {
					console.log(
						'item #' + count + " index '" + i + ' is ' + qtools.toType(element)
					);
				} else {
					outString +=
						'item #' +
						count +
						" index '" +
						i +
						' is ' +
						qtools.toType(element) +
						'\n';
				}
				count++;
			}
		} else if (type == 'map') {
			var hadProperties = false;
			var outList = [];
			inObject.forEach((element, i, all) => {
				hadProperties = true;

				var showElement;
				if (
					['object', 'array', 'function', 'map'].indexOf(
						qtools.toType(element)
					) == -1
				) {
					if (element == null) {
						showElement = 'null'.green;
					} else {
						if (element.length > maxShowStringLength) {
							element =
								element.substr(0, maxShowStringLength) +
								' ... (length=' +
								element.length +
								')';
						}
						if (toString) {
							showElement = element.toString();
						} else {
							showElement = element.toString().green;
						}
					}
					if (toString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							qtools.toType(element) +
							' value= ' +
							showElement;
					} else {
						var tmp =
							('item #' + count + " named '").grey +
							i.red +
							"' is a ".grey +
							qtools.toType(element).red +
							' value= '.grey +
							showElement;
					}
					outList.push({ name: i, string: tmp });
				} else {
					if (toString) {
						var tmp =
							'item #' +
							count +
							" named '" +
							i +
							"' is a " +
							qtools.toType(element);
					} else {
						var tmp =
							('item #' + count + " named '").grey +
							i.red +
							"' is a ".grey +
							qtools.toType(element).red;
					}
					outList.push({ name: i, string: tmp });
				}
				count++;
			});

			outList = outList.sort(qtools.byObjectProperty('name'));

			for (var i = 0, len = outList.length; i < len; i++) {
				var element = outList[i];

				if (!toString) {
					console.log(element.string);
				} else {
					outString += element.string + ';     ';
				}
			}
		} else {
			if (!toString) {
				var message =
					"qtools.listProperties says, input was of not an object or array. It was type '" +
					qtools.toType(inObject) +
					"'";
				console.log(message.red);
				var hadProperties = true; //don't need no properties message
			}
		}
		if (!hadProperties) {
			if (!toString) {
				console.log('input had no properties'.red);
			}
		}
		return outString;
	};

	self.toType = function(obj) {
		if (obj === null) {
			return 'null';
		} else if (typeof obj == 'undefined') {
			return 'undefined';
		} else {
			return {}.toString
				.call(obj)
				.match(/\s([a-z|A-Z]+)/)[1]
				.toLowerCase();
		}
	};
	//thanks: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
	self.errorObject = function(message, evidence) {
		var outObj = {};
		outObj.message = message;
		outObj.evidence = evidence;
		return outObj;
	};

	self.displayJson = function(inObject) {
		var jsonString = JSON.stringify(inObject);
		console.log(self.wrapMessage(jsonString));
	};

	self.validateProperties = function(args, doNotDie) {
		/*
				qtools.validateProperties({
					subject:args,
					targetScope: this, //will add listed items to targetScope,
					comment:`a quick note about where or why this is happening, eg, ${moduleName}.funcName()`,
					propList:[
						{name:'parent', optional:true, requiredType:'', assertNotEmptyFlag:false}
					],
					comment:'something to identify this call'
				});
				
		*/
		var name;
		var type;
		var notEmpty;
		var element;
		var importance;
		var optional;
		var outList = [];
		var outMessage = '';
		var inObj = args.subject;
		var propList = args.propList;
		var source = args.source ? args.source : self.employerFilename;
		var importance = args.importance;
		var optional = args.optional;
		var targetScope = args.targetScope ? args.targetScope : '';
		var result = '';
		var comment = args.comment ? '\nat: ' + args.comment : '';

		doNotDie = doNotDie ? true : false;

		if (self.toType(targetScope) != 'object') {
			targetScope = false;
		}

		source = source
			? source + ' (via qtools.validateProperties) '
			: 'qtools.validateProperties ';

		for (var i = 0, len = propList.length; i < len; i++) {
			var name = propList[i].name;
			var importance = propList[i].importance;
			var optional = propList[i].optional;
			var requiredType = propList[i].requiredType
				? propList[i].requiredType
				: false;
			var assertNotEmptyFlag = propList[i].assertNotEmptyFlag;
			var element = qtools.getSurePath(inObj, name);

			if (
				!optional &&
				importance != 'optional' &&
				typeof element == 'undefined'
			) {
				outList.push(name + ' is missing');
			}

			if (requiredType && self.toType(element) != requiredType) {
				outList.push(name + ' is not of type ' + requiredType);
			}
			if (assertNotEmptyFlag && self.isEmpty(element)) {
				outList.push(name + ' cannot be empty');
			}

			if (targetScope) {
				qtools.putSurePath(targetScope, name, qtools.getSurePath(inObj, name));
			}
		}

		for (var i = 0, len = outList.length; i < len; i++) {
			outMessage += outList[i] + '\n';
		}

		if (outMessage) {
			qtools.logWarn(
				self.wrapMessage(source + ' says, \n\n' + outMessage + comment)
			);
			if (!doNotDie) {
				self.die('silent');
			}

			result = source + ' says, ' + outMessage + comment;
		}
		return result;
	};

	//jQUERY here. From https://github.com/jquery/jquery/blob/master/src/core.js#L390
	//call: self.extend(baseObject, extensionObject);
	self.extend = function() {
		var options;
		var name;
		var src;
		var copy;
		var copyIsArray;
		var clone;
		var target = arguments[0] || {};
		var i = 1;
		var length = arguments.length;
		var deep = false;

		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;

			// skip the boolean and the target
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== 'object' && !typeof target == 'function') {
			target = {};
		}

		// extend jQuery itself if only one argument is passed
		if (i === length) {
			target = self;
			i--;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (
						deep &&
						copy &&
						(typeof copy == 'object' ||
							(copyIsArray = typeof copy.length != 'undefined'))
					) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && typeof src.length != 'undefined' ? src : [];
						} else {
							clone = src && typeof src == 'object' ? src : {};
						}

						// Never move original objects, clone them
						target[name] = self.extend(deep, clone, copy);
						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	self.count = function(inData) {
		if (typeof inData == 'undefined') {
			return;
		}
		var type = self.toType(inData);
		var outValue;
		switch (type) {
			case 'array':
				outValue = inData.length;
				break;
			case 'object':
				outValue = 0;
				for (var i in inData) {
					outValue++;
				}
				break;
			default:
				if (inData.hasOwnProperty('length') != 'undefined') {
					outValue = inData.length;
				}
		}

		return outValue;
	};

	self.getOnlyProperty = function(inObject) {
		var count = 0;
		for (var i in inObject) {
			var element = inObject[i];
			count++;
		}
		if (count != 1) {
			qtools.die(
				qtools.errorObject(
					'qtools.getOnlyProperty() says, object must have exactly one property',
					inObject
				)
			);
		}
		return element;
	};

	self.copySureFile = function(destFilePath, sourceFilePath) {
		//copies the file after creating all the intermediate paths
		var returnObj = { createdDirectories: [] };

		if (!fs.existsSync(sourceFilePath)) {
			qtools.message(
				'ERROR: *** file does NOT EXIST: ' + sourceFilePath + ' ***'
			);
			return -1;
		}

		var destFilePathElementArray = destFilePath.split('/');
		var workingPath = '';

		for (var i = 0, len = destFilePathElementArray.length - 1; i < len; i++) {
			var element = destFilePathElementArray[i].replace(
				/[\#\ \<\$\+\%\>\!\`\&\*\‘\|\{\?\“\=\}\:\\\@]+/g,
				''
			);
			//allows / character
			workingPath += element + '/';

			if (fs.existsSync(workingPath)) {
				continue;
			}

			fs.mkdirSync(workingPath);

			returnObj.createdDirectories.push(workingPath);
		}

		var destFileName =
			workingPath +
			destFilePathElementArray[len]
				.replace(' ', '_')
				.replace(/[\#\ \<\$\+\%\>\!\`\&\*\‘\|\{\?\“\=\}\/\:\\\@]/g, '');
		//removes / character
		var fileData = fs.readFileSync(sourceFilePath);
		fs.writeFileSync(destFileName, fileData);

		return returnObj;
	};
	
	self.deleteFolderRecursive = (directoryPath, keepEmptyDirectory = false) => {
		if (fs.existsSync(directoryPath)) {
			fs.readdirSync(directoryPath).forEach(file => {
				const currDirectoryPath = directoryPath + '/' + file;
				if (fs.statSync(currDirectoryPath).isDirectory()) {
					self.deleteFolderRecursive(currDirectoryPath);
				} else {
					fs.unlinkSync(currDirectoryPath);
				}
			});
			if (!keepEmptyDirectory) {
				fs.rmdirSync(directoryPath);
			}
		}
	};

	self.writeSureFile = function(...args) {
		/*
		
			qtools.writeSureFile(filePath, fileData, options);
			
			defaultOptions={
				append:false,
				stringify:false
			}
		
		*/

		const destFilePath = args[0];
		let options;
		let fileData;

		if (args[2]) {
			fileData = args[1];
			options = args[2];
		} else {
			if (typeof args[1] == 'string') {
				fileData = args[1];
				options = {};
			} else {
				//no fileData means create a directory only
				options = args[1];
			}
		}

		if (typeof options == 'object' && options.stringify === true) {
			fileData = JSON.stringify(fileData);
		}

		if (typeof options == 'function') {
			options = { callback: options };
		}
		//copies the file after creating all the intermediate paths
		options = options ? options : {};
		var returnObj = { createdDirectories: [] };

		var destFilePathElementArray = destFilePath.split('/');
		var workingPath = '';

		for (var i = 0, len = destFilePathElementArray.length - 1; i < len; i++) {
			var element = destFilePathElementArray[i];
			//.replace(/[\#\ \<\$\+\%\>\!\`\&\*\‘\|\{\?\“\=\}\:\\\@]/g, ''); //allows / character
			workingPath += element + '/';

			if (fs.existsSync(workingPath)) {
				continue;
			}

			fs.mkdirSync(workingPath);

			returnObj.createdDirectories.push(workingPath);
		}

		var destFileName = workingPath + destFilePathElementArray[len];
		//.replace(' ', '_').replace(/[\#\ \<\$\+\%\>\!\`\&\*\‘\|\{\?\“\=\}\/\:\\\@]/g, ''); //removes / character

		if (!destFileName) {
			returnObj.note = 'No file supplied. Directory only';
			return returnObj;
		}

		if (options.append) {
			if (options.callback) {
				fs.appendFile(
					destFileName,
					typeof fileData != 'undefined' ? fileData : '',
					options.callback
				);
			} else {
				fs.appendFileSync(
					destFileName,
					typeof fileData != 'undefined' ? fileData : ''
				);
			}
		} else {
			if (typeof fileData == 'undefined') {
				if (options.callback) {
					options.callback();
					//		fs.mkdir(destFileName, fileData, options.callback);
				} else {
					//		fs.mkdir(destFileName, fileData);
				}
			} else {
				if (options.callback) {
					fs.writeFile(destFileName, fileData, options.callback);
				} else {
					fs.writeFileSync(destFileName, fileData);
				}
			}
		}

		return returnObj;
	};

	qtools.deleteFile = function(filePath) {
		var realPath = '';
		try {
			realPath = self.realPath(filePath);
		} catch (e) {
			return;
		}
		if (realPath) {
			fs.unlinkSync(filePath);
		}
	};

	self.realPath = function(filePath) {
		if (!filePath) {
			return '';
		}
		var result;
		try {
			result = fs.realpathSync(filePath);
		} catch (e) {
			//e.Error is "ENOENT, no such file or directory"
			result = '';
		}
		return result;
	};

	self.isDirectory = function(filePath) {
		if (!self.realPath(filePath)) {
			return false;
		}
		var result;
		try {
			result = fs.statSync(filePath).isDirectory();
		} catch (e) {
			//e.Error is "ENOENT, no such file or directory"
			result = false;
		}
		return result;
	};

	self.addMetaData = function(name, data) {
		var myId = this.employerFilename;
		if (typeof self.metaData == 'undefined') {
			self.metaData = {};
		}
		if (typeof data == 'object') {
			self.metaData[name] = qtools.clone(data);
		} else {
			self.metaData[name] = data;
		}
	};

	self.getMetaData = function() {
		if (typeof self.metaData == 'undefined') {
			self.metaData = {};
		}
		var outObj = {};
		outObj[self.employerFilename + '_' + self.uniqueId] = self.metaData;
		return outObj;
	};

	self.mergeMetaData = function(otherMetaData, forceIncludeMeIfEmpty) {
		if (forceIncludeMeIfEmpty == true) {
			return self.extend(otherMetaData, self.getMetaData());
		} else {
			if (typeof self.metaData == 'undefined') {
				return otherMetaData;
			} else {
				return self.extend(otherMetaData, self.getMetaData());
			}
		}
	};

	self.stringToType = function(item) {
		let trial;

		trial = +item;
		if (!isNaN(trial)) {
			return trial;
		}

		trial = new Date(item);
		if (item.match(/\d+\D\d+\D\d+/) && trial != 'Invalid Date') {
			return trial;
		}

		if (item && item.toLowerCase() == 'true') {
			return true;
		}

		if (item && item.toLowerCase() == 'false') {
			return false;
		}

		return item;
	};

	self.clone = function(inObj, func) {
		let convertFunction =
			typeof func == 'function'
				? func
				: function(inData) {
						return inData;
					};

		if (
			['string', 'number', 'boolean', 'undefined'].indexOf(typeof inObj) > -1 ||
			inObj === null
		) {
			return convertFunction(inObj);
		}

		if (qtools.toType(inObj) == 'null') {
			return convertFunction(inObj);
		}

		if (!newObj) {
			if (self.toType(inObj) == 'array') {
				var newObj = [];
			} else {
				var newObj = {};
			}
		}

		if (self.toType(inObj) != 'array') {
			for (var i in inObj) {
				//I rescinded the numericToArray() prototype function that required this.
				// 				if (typeof(inObj.hasOwnProperty)=='function' && !inObj.hasOwnProperty(i)){
				// 					continue;
				// 				}
				if (inObj[i] !== null && typeof inObj[i] == 'object') {
					switch (inObj[i].constructor) {
						case Date:
							newObj[i] = convertFunction(new Date(inObj[i].toString()));
							break;
						default:
							newObj[i] = self.clone(inObj[i], func);
							break;
					}
				} else {
					newObj[i] = convertFunction(inObj[i]);
					//console.log("OO inObj[i]="+inObj[i]);
				}
			}
		} else {
			for (var i = 0, len = inObj.length; i < len; i++) {
				if (self.toType(inObj[i]) == 'object') {
					newObj[i] = self.clone(inObj[i], func);
				} else {
					newObj[i] = convertFunction(inObj[i]);
					//console.log("AA inObj[i]="+inObj[i]);
				}
			}
		}

		return newObj;
	};

	self.getSurePath = function(baseObj, subPathString, defaultReturn, debug) {
		var target = baseObj;
		var elements;
		self.getDottedPathLastProgressiveString = '';

		if (baseObj == null) {
			if (typeof defaultReturn != 'undefined' && typeof target == 'undefined') {
				return defaultReturn;
			} else {
				return;
			}
		}
		if (subPathString.toString().match(/\.|\[/)) {
			var elements = subPathString.split(/\.|\[(.*?)]/);
		} else {
			var elements = [];
			elements.push(subPathString);
		}

		if (!subPathString) {
			return baseObj;
		}

		if (elements.length < 2) {
			if (
				typeof defaultReturn != 'undefined' &&
				typeof baseObj[subPathString] == 'undefined'
			) {
				return defaultReturn;
			}
			return baseObj[subPathString];
		} else {
			for (var i = 0, len = elements.length; i < len; i++) {
				if (elements[i]) {
					//mainly eliminates trailing periods but would also eliminates double periods and other regex anomalies
					target = target[elements[i]];

					self.getDottedPathLastProgressiveString += elements[i] + '.';
					if (typeof target == 'undefined' || target === '') {
						if (
							typeof defaultReturn != 'undefined' &&
							(typeof target == 'undefined' || target === '')
						) {
							return defaultReturn;
						}

						return;
					}
				}
			}
		}

		return target;
	};

	self.putSurePath = function(baseObj, subPathString, value, preserveExisting) {
		var elements;
		var intermediate;
		var propName;
		self.putDottedPathLastProgressiveString = '';

		preserveExisting =
			typeof preserveExisting != 'undefined' ? preserveExisting : false;

		if (baseObj == null) {
			throw 'qtools.getDottedPath() says, baseObj cannot be nullx ' +
				subPathString;
		}
		if (subPathString.toString().match(/\.|\[/)) {
			var elements = subPathString.split(/\.|(\[.*?)]/);
		} else {
			var elements = [];
			elements.push(subPathString);
		}

		if (!subPathString) {
			return baseObj;
		}

		if (elements.length < 2) {
			baseObj[subPathString] = value;
		} else {
			intermediate = baseObj;
			for (var i = 0, len = elements.length; i < len; i++) {
				if (elements[i]) {
					//mainly eliminates trailing periods but would also eliminates double periods and other regex anomalies
					propName = elements[i];

					if (elements[i + 1] && elements[i + 1].replace(/^\[/)) {
						elements[i + 1] = elements[i + 1].replace(/^\[/, '');
						var nextElement = [];
						var nextElementType = 'array';
					} else {
						var nextElement = {};
						var nextElementType = 'object';
					}

					if (propName) {
						//ignore trailing and redundant dots
						if (qtools.toType(intermediate[propName]) != nextElementType) {
							intermediate[propName] = nextElement;
						} else if (preserveExisting) {
							qtools.die(
								qtools.errorObject(
									"'preserveExisting' flag is set, found non-object in path: " +
										propName +
										' in ' +
										subPathString,
									baseObj
								)
							);
						}

						intermediate = intermediate[propName];
					}
				}
			}

			intermediate = baseObj;
			for (var i = 0, len = elements.length; i < len - 1; i++) {
				if (elements[i]) {
					//mainly eliminates trailing periods but would also eliminate double periods
					propName = elements[i];
					intermediate = intermediate[propName];
				}
			}

			intermediate[elements[len - 1]] = value;
		}
		return baseObj;
	};

	self.deleteFile = function(filePath) {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	};

	self.extractDottedPaths = function(inObj) {
		var result;
		var pathList = [];

		var extractDottedPathRecursionEngine = function(inObj, incomingPathString) {
			if (!incomingPathString) {
				incomingPathString = '';
			}

			if (self.toType(inObj) != 'array') {
				for (var i in inObj) {
					var suffix = '.' + i;
					if (inObj[i] !== null && typeof inObj[i] == 'object') {
						extractDottedPathRecursionEngine(
							inObj[i],
							incomingPathString + suffix
						);
					} else {
						pathList.push(
							incomingPathString +
								'.' +
								suffix.replace(/\.$/, '').replace(/^\./, '')
						); //we accumulate leading and trailing dots, remove them
					}
				}
			} else {
				for (var i = 0, len = inObj.length; i < len; i++) {
					var suffix = '[' + i + ']';
					if (self.toType(inObj[i]) == 'object') {
						extractDottedPathRecursionEngine(
							inObj[i],
							incomingPathString + suffix
						);
					} else {
						pathList.push(incomingPathString + suffix);
					}
				}
			}

			return pathList;
		};

		result = extractDottedPathRecursionEngine(inObj);

		return result;
	};

	self.toUpperCaseInitial = function(word) {
		var initial = word[0].toUpperCase();
		word = word.replace(/^\w/, initial);
		return word;
	};

	self.toLowerCaseInitial = function(word) {
		var initial = word[0].toLowerCase();
		word = word.replace(/^\w/, initial);
		return word;
	};

	self.snakeToCamel = function(inString, upperCaseInitial) {
		var upperCaseInitial =
			typeof upperCaseInitial == 'undefined' ? false : upperCaseInitial;
		var wordList = inString.split('_');
		var outString = '';

		for (var i = 0, len = wordList.length; i < len; i++) {
			var element = self.toLowerCaseInitial(wordList[i]);
			if (i !== 0 || upperCaseInitial) {
				element = self.toUpperCaseInitial(element);
			}
			outString += element;
		}
		return outString;
	};
	self.templateReplaceArray = function(args) {
		var outString = '';
		for (var i in args.replaceArray) {
			args.replaceObject = args.replaceArray[i];
			if (qtools.toType(args.replaceObject) != 'object') {
				continue;
			}
			args.indexNumber = i;
			outString += self.templateReplace(args);
		}

		return outString;
	};
	self.templateReplace = function(args) {
		// {
		// 	template:template,
		// 	replaceObject:replaceObject, //replaceArray:[] for templateReplaceArray()
		//	useSimplePath:false,
		// 	leaveUnmatchedTagsIntact:false,
		// 	transformations:{showItemNo:function(replaceObject){ return "Item Number: "+replaceObject.indexNumber; }}
		// }
		var template = args.template
			? args.template
			: 'MISSING TEMPLATE IN qtools.templateReplace()';
		var replaceObject = args.replaceObject;
		var leaveUnmatchedTagsIntact = args.leaveUnmatchedTagsIntact;
		var transformations = args.transformations;
		var outString = '';
		var localReplaceObject = {};

		self.extend(
			this,
			{ localReplaceObject: qtools.clone(replaceObject) },
			args
		);
		//clones replaceObject
		self.localReplaceObject[
			'leaveUnmatchedTagsIntact'
		] = leaveUnmatchedTagsIntact ? leaveUnmatchedTagsIntact : false;
		self.localReplaceObject['indexNumber'] = args.indexNumber
			? args.indexNumber
			: 0;
		self.localReplaceObject.useSimplePath =
			args.useSimplePath === true ? true : false;

		if (qtools.isNotEmpty(transformations)) {
			for (var fieldName in transformations) {
				self.localReplaceObject[fieldName] = transformations[fieldName](
					self.localReplaceObject
				);
			}
		}

		outString = template.replace(/<!([^<>!]+)!>/g, self.evaluatorFunction);

		outString = outString.replace(/<!([^<>!]+)!>/g, self.evaluatorFunction);

		return outString;
	};
	self.evaluatorFunction = function(matchedString, propertyName) {
		/*
		* This works as a callback from replace() in self.templateReplace. Looks up the
		* appropriate property in an object and returns it to replace a tag.
		*
		* Tags are the form <!replaceName!>.
		* */

		if (self.localReplaceObject.useSimplePath) {
			var outString = self.localReplaceObject[propertyName];
		} else {
			var outString = self.getSurePath(self.localReplaceObject, propertyName);
			//property names are allowed to be paths, eg, <!user.firstName!>
		}

		if (typeof outString != 'undefined') {
			//console.log('propertyName='+propertyName+'==='+outString);
			return outString;
		} else {
			if (self.localReplaceObject['leaveUnmatchedTagsIntact']) {
				return '<!' + propertyName + '!>';
			} else {
				return '';
			}
		}
	};

	self.strToBool = function(inData) {
		if (!inData) {
			return false;
		}

		switch (inData) {
			case 'false':
				return false;
				break;
			case 'true':
				return true;
				break;

			case 'no':
				return false;
				break;
			case 'yes':
				return true;
				break;

			case '0':
				return false;
				break;
			case '1':
				return true;
				break;
		}
	};
	self.getDateString = function(format, dateObj) {
		const debugDateObj = dateObj;
		// 		qtools.logWarn(
		// 			`NOTE: getDateString() is deprecated, use qtools.dayjs() instead. Eg, dayjs().format('YYYY-MM-DD')`
		// 		);

		if (typeof dateObj == 'string') {
			dateObj = new Date(dateObj);
		}
		dateObj = dateObj || new Date();

		if (!(dateObj instanceof Date) || dateObj.getTime() != dateObj.getTime()) {
			qtools.logWarn(
				`qtools.getDateString() says, dateObj (${debugDateObj}) is not a valid date or date string`
			);
			return;
		}

		const dateValues = {
			month: dateObj.getMonth(),
			day: dateObj.getDate(),
			hours: dateObj.getHours(),
			year: dateObj.getFullYear(),
			minutes: dateObj.getMinutes(),
			seconds: dateObj.getSeconds(),
			milliseconds: dateObj.getMilliseconds()
		};

		const dateReference = {
			month: 2,
			day: 2,
			hours: 2,
			year: 4,
			minutes: 2,
			seconds: 2,
			milliseconds: 3
		};

		const pad = (value, paddedLength, padChar) => {
			var shortfall = paddedLength - value.toString().length;
			for (var i = 0; i < shortfall; i++) {
				value = padChar + value.toString();
			}
			return value;
		};

		const padObject = (object, reference, padChar) => {
			for (var i in object) {
				var element = object[i];
				var ref = reference[i];
				object[i] = pad(element, ref, padChar);
			}
		};

		padObject(dateValues, dateReference, '0');

		const dateString =
			dateValues.year +
			'.' +
			dateValues.month +
			'.' +
			dateValues.day +
			'.' +
			dateValues.hours +
			'.' +
			dateValues.minutes +
			'.' +
			dateValues.seconds +
			'.' +
			dateValues.milliseconds;

		switch (format) {
			case 'dd_MMM_yyyy':
				//nodeJs apparently doesn't use the options parameter of toLocaleDateString()
				var outString = dateObj.toLocaleDateString('en-US').toString();
				outString = outString.replace(/^.*?, (\w+) (\d+), (\d+)$/, '$2_$1_$3');
				return outString;

				break;
			case 'yyyy_mm_dd':
				//nodeJs apparently doesn't use the options parameter of toLocaleDateString()
				var outString = dateObj.toLocaleDateString('en-US').toString();
				outString = outString.replace(/^(\d+)\/(\d+)\/(\d+)$/, '$3/$1/$2');
				outString = outString.replace(/^(\d+)\/(\d)\/(\d+)$/, '$1/0$2/$3');
				outString = outString.replace(/^(\d+)\/(\d+)\/(\d)$/, '$1/$2/0$3');
				return outString;

				break;
			case 'mm_dd_yyyy':
				//nodeJs apparently doesn't use the options parameter of toLocaleDateString()
				var outString = dateObj.toLocaleDateString('en-US').toString();
				outString = outString.replace(/^(\d+)\/(\d+)\/(\d+)$/, '$1/$2/$3');
				outString = outString.replace(/^(\d)\/(\d+)\/(\d+)$/, '0$1/$2/$3');
				outString = outString.replace(/^(\d+)\/(\d)\/(\d+)$/, '$1/0$2/$3');
				return outString;

				break;
			case 'mm_dd_yyyy timeDetails':
				//nodeJs apparently doesn't use the options parameter of toLocaleDateString()
				var outString = dateObj.toLocaleString('en-US').toString();
				return outString;

				break;
			case 'allFieldsPaddedDots':
				return (
					dateValues.year +
					'.' +
					dateValues.month +
					'.' +
					dateValues.day +
					'.' +
					dateValues.hours +
					'.' +
					dateValues.minutes +
					'.' +
					dateValues.seconds +
					'.' +
					dateValues.milliseconds
				);
				break;
			case 'allFieldsPaddedDotsIncrementMonth':
				//javascript months are zero based. this is not good for file names and other visible uses.
				return (
					dateValues.year +
					'.' +
					pad(+dateValues.month + 1, 2, 0) +
					'.' +
					dateValues.day +
					'.' +
					dateValues.hours +
					'.' +
					dateValues.minutes +
					'.' +
					dateValues.seconds +
					'.' +
					dateValues.milliseconds
				);
				break;
			default:
				return dateObj.toLocaleDateString('en-US');
				break;
		}
	};

	self.parseCommandLine = function(args) {
		var noFunctions = args && args.noFunctions ? args.noFunctions : false;
		var doNotRetrieveFiles = args && args.getFileData ? args.getFileData : true;
		var valuesSplitCharacter =
			args && args.valuesSplitCharacter ? args.valuesSplitCharacter : '';

		/*add arg.allowedItems={
			fileList:3, //number of files allowed
			functions:['tmp', 'otherThing']
			values:['a', 'b'],
			switches:['x', 'y']
		}
		
		also, args.errorIfNotAllowedItem:true 
		
		These seem like they could be valuable.
		*/
		/*
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
			
			(IF valuesSplitCharacter is specified in args; otherwise, still a string)
			
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
					qtools.message('templateReplace.js says, ');
					qtools.die(err);
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
						var replacement = figureOutWhatItIs(explosion[2]);
					} else {
						var replacement = explosion[2];
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
					qtools.message(element + ' is empty', 'red');
				}

				if (typeof replacement == 'number') {
					replaceObject[switchName] = replacement.toString();
				} else if (typeof replacement == 'string') {
					if (valuesSplitCharacter) {
						replacement = replacement.split(valuesSplitCharacter);
					}
					replaceObject[switchName] = replacement;
				} else if (qtools.toType(replacement) == 'object') {
					replaceObject = qtools.extend(replaceObject, replacement);
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
	};

	self.in = function(needle, haystack) {
		switch (self.toType(haystack)) {
			case 'array':
				return haystack.indexOf(needle) > -1;
				break;
			case 'object':
				return typeof haystack[needle] != 'undefined';
				break;
			case 'string':
				if (needle == '*') {
					needle = '\\*';
				}
				return haystack.match(needle) !== null;
				break;
			default:
				return false;
				break;
		}
	};

	self.convertNumericObjectToArray = function(
		inObj,
		removeMissingElements = true,
		defaultValue
	) {
		if (qtools.toType(inObj) == 'array') {
			return inObj;
		}

		if (typeof inObj != 'object') {
			return defaultValue;
		}

		var outArray = [];
		var workingArray = [];

		for (var i in inObj) {
			var element = inObj[i];

			if (isNaN(+i)) {
				continue;
			}
			workingArray[i] = element;
		}

		if (removeMissingElements) {
			outArray = workingArray.filter(item => {
				//turns out that filter skips empty elements
				return true;
			});
		} else {
			outArray = workingArray;
		}
		return outArray;
	};

	self.objectToMap = function(inObj) {
		const outMap = new Map();
		Object.keys(inObj).forEach(key => {
			outMap.set(key, inObj[key]);
		});
		return outMap;
	};

	self.mapObject = function(inObj, func) {
		const outObj = {};

		for (var i = 0, len = inObj.length; i < len; i++) {
			var element = inObj[i];
			outObj[i] = func(element);
		}
		return outObj;
	};

	self.flattenObject = function(inObj, options = {}) {
		const includeIntermediates = options.includeIntermediates
			? options.includeIntermediates
			: false;
		var squash = function(obj, outObj, nameString) {
			outObj = outObj ? outObj : {};

			var prefix = nameString ? nameString + '[' : '',
				suffix = nameString ? ']' : '';

			if (obj instanceof Array) {
				var prefix = nameString ? nameString + '[' : '',
					suffix = nameString ? ']' : '';
				for (var i = 0, len = obj.length; i < len; i++) {
					if (typeof (obj[i] != 'undefined')) {
						squash(obj[i], outObj, prefix + i + suffix);
					}
				}
				if (includeIntermediates) {
					outObj[nameString] = obj; //include unflat version, too
				}
			} else if (typeof obj === 'object') {
				var prefix = nameString ? nameString + '.' : '',
					suffix = '';
				for (var i in obj) {
					if (!obj.hasOwnProperty(i)) {
						continue;
					}
					squash(obj[i], outObj, prefix + i + suffix);
				}

				if (includeIntermediates) {
					outObj[nameString] = obj; //include unflat version, too
				}
			} else {
				outObj[nameString] = obj;
			}
		};

		var outObj = {};
		squash(inObj, outObj);
		return outObj;
	};

	self.extractProperties = (inObj, propertyList) => {
		const outObj = {};
		propertyList.forEach(propertyName => {
			outObj[propertyName] = inObj[propertyName];
		});
		return outObj;
	};
	
	self.replaceableFunctionPlaceholder = (args, callback) => {
		qtools.logError(`\nERROR: method has not been initialized`);
		console.trace();
		qtools.logError(
			'END OF CONSOLE.TRACE()=================================\n'
		);
		//this method is overwritten by initializer when it is run
		!callback || callback();
	};
	
	self.timestamp = () => {
		return qtools.getDateString(
			'allFieldsPaddedDotsIncrementMonth',
			new Date()
		);
	};
	
	self.shortTimeStamp = (args = {}) => {
		let { prefix, extraDigits } = args;
		//qtools.shortTimeStamp({extraDigits:20});
		
		prefix = prefix ? prefix : '';
		extraDigits = extraDigits ? extraDigits : 0;
		
		const precision = extraDigits ? 1 : 1000;
		
		let suffix = '';
		if (extraDigits > 0) {
			const tmp = '1'.padEnd(extraDigits, '0');
			const tmp2 = Math.random() * (+tmp).toString().padStart(extraDigits, '0');
			suffix = Math.floor(+tmp2);
		}
		
		const today = new Date();
		const midnight = new Date();
		midnight.setHours(0, 0, 0, 0);

		const millisecondsToday = today.getTime() - midnight.getTime();
		
		const tmp = Math.floor(millisecondsToday / precision);
		
		const secondsToday = tmp.toString().padStart(5, '0');
		
		const shortTimeStamp = `${today
			.toLocaleDateString()
			.replace(/(-|\/)/g, '')
			.replace(/^20/, '')}${secondsToday}`;
		
		return prefix + shortTimeStamp + suffix;
	};

	self.escapeRegExp = string => {
		//thanks: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	};

	self.dateToSqlDISCARD = inDate => {
	if (!inDate) {
		return new Date()
			.toISOString()
			.slice(0, 19)
			.replace('T', ' ');
	} else {
		return new Date(inDate)
			.toISOString()
			.slice(0, 19)
			.replace('T', ' ');
	}
};

	self.dateToSql = inDate => {
		 
		let date;

		if (!inDate) {
			date = new Date();
		} else {
			date = new Date(inDate);
		}

		const options = {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		};

		const parseTime = /(?<month>\d{2})\/(?<day>\d{2})\/(?<year>\d{4}), (?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})/;

		const parts = date.toLocaleString('en-US', options).match(parseTime);

		const { year, month, day, hour, minute, second } = parts.groups;

		const sqlTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
		
		return sqlTime;
	};

	self.accessMapByNumber = (inMap, inx) => {
		let count = 0;
		let result;
		if (!inMap || typeof inMap.forEach != 'function') {
			return;
		}
		
		inMap.forEach(item => {
			if (count === inx) {
				result = item;
			}
			count++;
		});
		return result;
		
	};

	self.tsvToJsObjectList = (inString, numberPrefixFieldNames = false) => {
		if (typeof inString != 'string') {
			return;
		}
		
		//inString = inString.replace(/  +/g, '\t');
		const inputLines = inString
			.trim()
			.split(/\n/)
			.map(item => item.split(/\t/));

		const fieldNames = inputLines[0];
		inputLines.splice(0, 1); //remove fieldnames, leaving only data
		
		
		const resultObject = inputLines.map(dataList => {
			let numberPrefix = 0;
			return dataList.reduce((result, item, inx) => {
				const propertyName = numberPrefixFieldNames
					? `${numberPrefix++}_${fieldNames[inx]}`
					: fieldNames[inx];
				result[propertyName] = item;
				return result;
			}, {});
		});
		
		return resultObject;
	};

	self.jsObjectToTsv = recordObjectList => {
		
		const outString = '';
		

		const keySet = recordObjectList.reduce((result, arrayItem) => {
			Object.keys(arrayItem).reduce((result, keyItem) => {
				result.add(keyItem);
				return result;
			}, result);

			return result;
		}, new Set());

		const allKeys = [...keySet];

		const headerString = allKeys.join('\t') + '\n';
		
		const valuesString =
			headerString +
			recordObjectList
				.map(inObj => {
					if (typeof inObj != 'object') {
						console.log(
							`input must be an array of objects. ${inObj} is not an object`
						);
					}
					const valueString = allKeys.reduce((outString, keyName) => {
						const outVal = inObj[keyName] ? inObj[keyName] : '';

						return outString + outVal + '\t';
					}, '');
					return valueString.replace(/\t$/, '');
				})
				.join('\n');
		return valuesString;
		
	};    
	 self.isTrue = inData =>
		typeof inData != 'undefined' && inData.toString().toLowerCase() === 'true';

	self.arrayToDisplayString = (inArray, separator = ', ') => {
		return inArray.join(separator).replace(new RegExp(`${separator}$`), '');
	};

	//FINALIZE ====================================
	return this;
};

//END OF moduleFunction() ============================================================
module.exports = moduleFunction;
