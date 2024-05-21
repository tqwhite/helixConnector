## **qtools-functional-library**

This is a collection of tools that allow chained operations on various Javascript datatypes. 

In each case, the primary operand is `this`. In most cases, the function takes an argument with parameters to guide the operation. 

Everything else remains compatible.

**EG,**

```
const qt=require('qtools-functional-library');

qt.help(); // this information and more

const demo=({a:{b:"Hi from b"}})

const one=demo
    .qtGetSurePath('a.b')
    .qtDump();//produces 'Hi from b [thisFilename.js]'

console.log(one); //produces '[object Object]'
```

### **Version 2:**

qtPassThrough <u>no longer</u> *always* returns the inbound 'this'. If the supplied function
returns a value, that is passed on. This way, any ad hoc function can affect the result chain.

EG,

```
'xxx'
    .qtPassThrough(item=>item.toUpperCase())
    .qtDump(); // -> 'XXX'
```

### **Non-chain utilities:**

- **qt.help**: Shows this information and more.
- **qt.log**:    Writes log entry with suffix identifying the file that generated the output. (See qtLog below for chained version.)

### **Get/Set values from an Array:**

- **qtGetByProperty**: Operates on an array of objects. Retrieves one or more elements based on the value of an object property specified by a dotted path.

- **qtPop**: Pops the last value off an array. If a default is supplied and there is nothing left on the list, that will be returned. Really good for ArrayOfObjects.qtPop({}).

- **qtPush**: Pushes a value onto an array and returns the array (unlike normal .push() which returns the length of the array)

- **qtLast**: Delivers the element that would have been pop'd but does not change the array. Default if none exists.

- **qtFirst**: Delivers the element zero if it exists but does not change the array. Default if none exists.

- **qtIncludesRegex**: Operations on a simple array of strings. Retrieves one or more elements based on an regEx match.

### **Get/Set values in an Object (or array of Objects)**

- **qtGetSurePath**: Gets the value of a property based on a dotted string path. No crash if intermediate elements are missing. Provides default. Predates and is prettier to use than optional chaining and supports setting the value.

- **qtSetSurePath** Sets the value of a property based on a dotted string path. Creates intermediate elements if they are missing.

- **qtSelectProperties**: Given an Object and an Array of Strings, filters the properties into a new Object with defaults "[{}].qtSelectProperties(outFileDefinition, {moreDefaultValues:{Value:"xxx"}}))" for missing elements. Does the same for an Array of Objects.

- **qtMapProperties**: Given an Object and a one level Object whose properties are functions, applies each function to the corresponding element. Does the same for an array of Objects.

### **Array/Object Conversions:**

- **qtClone**: Does a deep clone of an object or array.- qtNumberKeysToArray: Converts an object with properties that are numbers to an array, including subordinate properties.

- **qtToKeyValueArray**: Converts an object to an array of objects of the form, ie, `{["1"]:'one', ["2"]:'two'} => ['one', 'two']`

- **qtMerge**: Deep merge of two objects including array propterties.

- **qtToString**: Joins an array with prefix, suffix and separator. Pretty much the same as .join().

### **Array/Object Template Replacement:**

- **qtTemplateReplace**: Takes Object and a `<!template!>` String ()either can be 'this' or the argument). Substitutes from the object properties into the string. If the 'this' is an array of Objects, it does it to all of them.

### **Output:**

- **qtDump**: Prints 'this' and returns it. Good for debugging complicated chains.

- **qtLog**: Logs message by applying 'this' into the argument which is a <!template!> string. Appends calling file name.

### **Misc:**

- **qtPassThrough**: Sits in a declarative chain and executes an arbitrary function. Returns function result if not undefined, 'this' otherwise. 'this' is available to the function.

- **qtIterate**: Operates on a number. EG, (5).qtStart(7).qtIncrement(3).qtIterate(item=>item*100)

### **Output:**

1.1.16 - fixed bug where intermediate path element could be undefined and cause a crash.

### **Other Cool Qtools**

[qtools-asynchronous-pipe-plus](https://www.npmjs.com/package/qtools-asynchronous-pipe-plus)
[qtools-config-file-processor](https://www.npmjs.com/package/qtools-config-file-processor)
[qtools-format-columns](https://www.npmjs.com/package/qtools-format-columns)
[qtools-functional-library](https://www.npmjs.com/package/qtools-functional-library)
[qtools-object-flattener](https://www.npmjs.com/package/qtools-object-flattener)
[qtools-parse-command-line](https://www.npmjs.com/package/qtools-parse-command-line)
[qtools-secure-container](https://www.npmjs.com/package/qtools-secure-container)
[qtools-template-replace-for-files](https://www.npmjs.com/package/qtools-template-replace-for-files)
[qtools-transform-text](https://www.npmjs.com/package/qtools-transform-text)
