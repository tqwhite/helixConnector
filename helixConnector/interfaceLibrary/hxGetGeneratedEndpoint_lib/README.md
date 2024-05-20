## Generating hxConnector Endpoints

hxConnector is used to provide a mapping between the internet and Helix views for data access. hxConnector provides an HTTP endpoint offering GET or POST to send or receive data from or to a Helix view. The details of this mapping are contained in a Javascript object definition that identifies the specific Helix view that will send or receive data and a specific HTTP request endpoint name that will be used to address the data.

Historically, these JSON endpoint definition files were hand crafted. That took advantage of the vast flexibility offered by hxConnector and provided many opportunities for errors. The hand crafting was also a lot of work.

With the introduction of hxGeneratedEndpoint, hxConnector now has the ability to access the specified Helix view, collect information about it and convert it into an endpoint definition. This process, like the rest of hxConnector is engaged over the network, in this case as a GET request with query parameters that yields a JSON string.

hxGeneratedEndpoints is built into the hxConnector system. It requires the usual API token and user ID for access.

### How It Works

The main action of hxConnector is to receive data from a network and to formulate an Applescript program that will, using the Apple Open Scripting Architecture, communicate with Helix to send or receive data. That is, the fundamental active mechanism of hxConnector is the generation and execution of Applescript programs.

This function, hxGeneratedEndpoint, is constrained by that fact. Instead of the hxConnector program directly opening the Javascript function, `hxGeneratedEndpoint_lib/generatorHelper.js`, it has to create an Applescript program to invoke the generatorHelper which then does the real work.

However, getting the information from Helix still requires Applescript. That's why there is also a second Applescript program, getBasicEndpoint.applescript that actually generates an endpoint.

The reason that Javascript is used at all in generatorHelper is that Applescript is lousy at 1) being modularized, 2) having control structures and 3) manipulating data. Javascript is good at all of those.

Also, the original Applescript that extracts data from Helix and formats it into JSON was hard to write and impossible to change. Revising it to have different properties or to do the complex control flow for criterion and response properties is not practical.

It also had the flaw of not getting data for the 'separator' property of the endpoint. Gettng this data was an easy enough addtion but inserting it into the JSON string was out of the question. Hence the existence of `getBasicEndpointSepAssembler.js`. It's primary function is to take those two JSON elements returned from `getBasicEndpointJson.applescript` and combine them.

The final problem are the criterion and response endpoints. These are utility endpoitns linked into the main one. Each requires access to Helix to get the usual endpoint data. That is why the initial Applescript, `hxGeneratedEndpoint`, calls `generatorHelper` instead of `getBasicEndpointAssembler`.

generatorHelper knows how to interpret its input, conduct multiple calls to `getBasicEndpointJson.applescript` and knit the results together.

### Process Activation

This system is accessed via hxConnector endpoint with query parameters. EG,

`http://dbdev4.vpn:9000//hxGetGeneratedEndpoint?nativeRelationName=Product&viewName=tqTest`

Here is the list of parameters:

> nativeRelationName
> viewName
> optionalEndpointName
> criterionView
> criterionRelation
> responseView
> responseRelation

Errata:

> **nativeRelationName** can be either the native or the custom name. The program tries both, if necessary.
> 
> **optionalEndpointName** overrides the default which is *nativeRelationName_viewName*. 
> 
> It is unusual for both a criterion and a response to be specified but it is allowed.

Here is an example of a fully specified endpoint:

`http://dbdev4.vpn:9000//hxGetGeneratedEndpoint?nativeRelationName=Customer%20Records&viewName=exportCustomer&criterionView=customerIn_num_pass&criterionRelation=_hxInertProcess&optionalEndpointName=authenticateCustomer&criterionView=customerIn_num_pass&criterionRelation=_hxInertProcess&responseView=customerIn_num_pass&responseRelation=_hxInertProcess`

Like everything in hxConnector, this endpoint has a JSON definition. However, it is in a special place for internal endpoints. It's path is `[projectRoot]/helixConnector/project/code/helixAjax/internalEndpoints/fileOne.json`. It is a normal, 'remoteControl' endpoint that calls the script `hxGeneratedEndpoint` discussed here.

### Process Flow

A .applescript template is converted into a valid Applescript program string. This string is embedded into a control string which is handed to the shell. The results of this process are received via 'stdout'.

For generating endpoints, that Applescript programs creates another control string to call the generatorHelper Javascript program. (This is because it is not worth it to add a new feature to hxConnector to directly call Javascript in this execution flow.) This control string is then handed off to the shell.

The generatorHelper control string is a complete specification of the generating process. In fact, it can be captured and executed to produce the endpoint directly in the shell.) It specifies a NodeJS executable Javascript program.

generatorHelper parses its input and executes a series of tasks. Each task comprises the creation of a Javascript object representing an endpoint. The main endpoint specified by nativeRelationName/viewName is always executed. Criterion and response endpoints are created if necessary and linked into the main endpoint.

The creation of endpoints in generatorHelper is also done with a .applescript template. This one is the original, complicated, unchangable one that creates JSON strings for two Javascript objects. One is a mostly complete endpoint. The other is a small segment representing the field and record separators extracted from Helix for this view. 

These two strings are handed, via the shell, to a small Javascript program, getBasicEndpointSepAssembler.js, which combines the two Javascript objects and does some other cleanup on the endpoint. (This exists because it is so hard to work with JSON in Applescript.)

The movement of data among the components is idiosyncratic. It relies on the use of the shell mechanism, stdout. Applescript uses a 'return' verb which writes the data to stdout. Javascript receives this from its exec() function as stdout. Javascript 'return' does *not* refer to stdout. It has to use process.write() (or its alias, console.log())

### Debugging

Because of its complexity and switching between languages, it is hard to debug, both conceptually and practically.

The '.applescript' files are not, for example, functional Applescript. (Big regret on the early decision not to create a new extension, like, 'astemplate' or something.) The files are template files with substitution tags. They are processed into strings and the string is executed. That means that the execution context is practically non-existent as are normal logging methods.

This is a problem common to the entire .applescript method used for hxConnector drivers. To accommodate this, there is an entirely separate logging mechanism based on explicitly appending text to a file. This file is specified as the driverLogFilePath in systemParameters.ini. It is a shared log so that other driver activity may be present, too.

The most important thing is that this log gets the generatorHelper control string. This string can be copied out of the log and executed in the shell. There, it will operate the entire process and produce a valid endpoint JSON string. Eg, 

`/usr/local/bin/node ~/CustomApplications/Databright/library/hxConnector/system/code/helixConnector/interfaceLibrary/hxGetGeneratedEndpoint_lib/generatorHelper.js "/Users/lenny/CustomApplications/Databright/logs/hxDriverLog.log" --driverLogFilePath="/Users/lenny/CustomApplications/Databright/logs/hxDriverLog.log" --driverLibraryDirPath="/Users/lenny/CustomApplications/Databright/library/hxConnector/system/code/helixConnector/interfaceLibrary" --myCollection="[[donutBackBrain]]" --myRelation="[[Product]]" --myView="[[tqTest]]" --myUser="[[lenny]]" --myPassword="[[]]" --schemaName="[[hxGetGeneratedEndpoint]]" --applicationName="[[Helix RADE]]" --criterionView="[[]]" --criterionRelation="[[]]" --responseView="[[]]" --responseRelation="[[]]" --optionalEndpointName="[[]]"`

A handy pecularity of the complicated control mechanism and its lack of programmatic context, is that everything is fully specified, especially, the file paths. That means that the control string can be executed from any directory on the hxConnector/Helix computer. This is especially useful to find errors in the Javasript parts of this system. When run normally, most errors, especially syntax errors, fail silently. The only way to see them is to run from the command line.

*(The parameters in the control string are bracketed by '[[' and ']]. These exist to accommodate an idiosyncracy of the Applescript system. Parameters that have no value, eg, if one included `--optionalEndpointName=""`, Applescript will send this as `--optionEndpointName=`, ie, with no completing parameter value. This breaks things. Adding the brackets prevents this. The brackets are all stripped by the receiving program. They are not ever necessary but can be left in the string for execution.)*

There are two generated Applescript programs involved in this process that might need to be viewed for debugging purposes. In both cases, the generated Applescript can be written to logs for viewing. In both cases, the Applescript can be copied and run in Script Editor (or Debugger) where it will work correctly. This is especially useful if changes are made. Syntax errors in Applescript fail silently. The only way to see them is to run them in Script Editor (or Debugger).

Each of the two different generated Applescript programs gets written to a different log and requires a different control to cause them to be written. 

The hxGetGeneratedEndpoint program is written to the normal hxConnector log (usually specified in `~/Library/LaunchAgents/com.databright.tqwhite.hxConnector.plist` and almost always accessible with a BASH alias, `hxlog`). To cause it to be written requires editing the internal endpoint in `fileOne.json` (also mentioned above) and setting its debug property to be true and restarting hxConnector (there is usually an alias `hxr_restart`)

The getBasicEndpoint program is written to the hxDriverLog file (mentioned above). To cause it to be written to the log, edit the variable showGeneratedApplescriptInLog. There will be a separate script shown for each endpoint, main, criterion (if any) and response (if any).

### Deploying an Endpoint

The hxGeneratedEndpointsJson endpoint produces a JSON string. This string needs to find its way to the hxConnector running endpoints directory.

The mechanism for specifying the location of endpoints is usually simple. There is a directory named `endpoints/production.d/` in the hxConnector root directory. 

By convention, the file name is the same as the endpoint name with a .json extension, however, it is not required. Also by convention, each file contains one endpoint set (main, criterion and/or response) but a file can contain many endpoints.

There is insane flexibility in the specification of endpoints. In addition to the internal ones mentioned above, there is a configuration file called a schemaMap. The location of this file is specified as schemaMapName in systemParameters.ini. It is a file name that refers to a JSON file in the configuration directory. There is no convention for this name.

The schemaMap file originally contained all of the endpoints for an hxConnector instance in a property called schemaMap. Later, it was upgraded with an includes property that specified a list of files to be added to the schemaMap. 

Eventually, adding files to this list became intractable so, a normal unix-like autoload directory system was added. A list of directories (relative to the schemaMap file) is specified, each is read and every JSON file in the directory is added to the system.

Putting your new endpoint file into any directory specified in the schemaMap file should work.

### Restarting

   hxConnector must be restarted for endpoints to be usable



### Adding New Parameters

I realized that I needed to be able to specify values for skipPoolUser and primaryKey when creating endpoints. These were not part of the original implementation. Here is how I added those.

**First**, the entry to the process is hxGetGeneratedEndpoint.applescript. The purpose of this file is to generate a command line for the Javascript part of this operation.

Specifically, I added a pair of commandLineParser value parameters:

    set generatorShellCmdString to generatorShellCmdString & " --skipPoolUser=\"[[skipPoolUser]]\""

    set generatorShellCmdString to generatorShellCmdString & " --primaryKey=\"[[primaryKey]]\""



**The Javascript program that receives** the parameters is generatorHelper.js. 

This program executes getBasicEndpointJson.applescript. This script gets all the data available for this endpoint from Helix and returns JSON. *(Note: It returns a primaryKey that is presently bad because it relies on an affordance that was unique to the client I originally used it for. That's why I am adding it now.)* 





---

TQ White II, tq@justkidding.com, 10/22
