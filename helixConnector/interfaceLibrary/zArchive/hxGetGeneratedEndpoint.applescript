
-- ----------------------------------------------------------------------
-- Script Start: hxGetGeneratedEndpoint.applescript
-- <!schemaName!>
-- ----------------------------------------------------------------------

set driverLogFilePath to "<!driverLogFilePath!>"
set scriptFilePath to "<!scriptFilePath!>"

set calcParentScriptString to "/usr/local/bin/node -e 'const path=require(\"path\"); const parse=path.parse(\"" & scriptFilePath & "\"); console.log(parse.dir);'"
set driverLibraryDirPath to do shell script calcParentScriptString

do shell script "echo \"ALOG MESSAGE [hxGetGeneratedEndpoint]: \nAPPLESCRIPT: <!nativeRelationName!>.<!viewName!>/hxGetGeneratedEndpoint.applescript>   [$(date)]\" >> " & driverLogFilePath

		-- wtf was this:		set scriptLibDirName to "<!schemaName!>_lib"
		set scriptLibDirName to "hxGetGeneratedEndpoint_lib"
		
set generatorHelperFileName to "generatorHelper.js"
set helperFilePath to driverLibraryDirPath & "/" & scriptLibDirName & "/" & generatorHelperFileName

set generatorShellCmdString to "/usr/local/bin/node " & helperFilePath
set generatorShellCmdString to generatorShellCmdString & " \"" & driverLogFilePath & "\"" 

-- paths that exist as proper variables
set generatorShellCmdString to generatorShellCmdString & " --driverLogFilePath=" & "\"" & driverLogFilePath & "\""
set generatorShellCmdString to generatorShellCmdString & " --driverLibraryDirPath=" & "\"" & driverLibraryDirPath & "\""

-- names that are historically mismatched
set generatorShellCmdString to generatorShellCmdString & " --myCollection=\"[[<!collection!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --myRelation=\"[[<!nativeRelationName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --myView=\"[[<!viewName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --myUser=\"[[<!user!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --myPassword=\"[[<!password!>]]\""

--names that are correct throughout the process
set generatorShellCmdString to generatorShellCmdString & " --schemaName=\"[[<!schemaName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --applicationName=\"[[<!applicationName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --criterionView=\"[[<!criterionView!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --criterionRelation=\"[[<!criterionRelation!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --responseView=\"[[<!responseView!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --responseRelation=\"[[<!responseRelation!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --optionalEndpointName=\"[[<!optionalEndpointName!>]]\""

--NOTE: skipPoolUser defaults to true because the endpoint definition for this endpoint, hxGetGeneratedEndpoint, skips the pool user.
-- it is successfully overridden by a value on the command line in generatorHelper.js.
set generatorShellCmdString to generatorShellCmdString & " --skipPoolUser=\"[[<!skipPoolUser!>]]\""

set generatorShellCmdString to generatorShellCmdString & " --primaryKey=\"[[<!primaryKey!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --noPostViewName=\"[[<!noPostViewName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --testViewName=\"[[<!testViewName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --unConstrainedViewName=\"[[<!unConstrainedViewName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --annotation=\"[[<!annotation!>]]\""

-- THESE CONTROL THE GENERATION PROCESS
set generatorShellCmdString to generatorShellCmdString & " --criterionName=\"[[<!criterionName!>]]\""
set generatorShellCmdString to generatorShellCmdString & " --responseName=\"[[<!responseName!>]]\""

-- LOGGING---------------------------------------------------------------

do shell script "echo \"ALOG MESSAGE [hxGetGeneratedEndpoint]: To show compiled version of this script, edit '.../helixAjax/internalEndpoints/fileOne.json/hxGetGeneratedEndpoint' and set property debug:true, restart the connector. - [$(date)]\" >> " & driverLogFilePath
do shell script "echo '---------------------\\n\\nALOG MESSAGE [hxGetGeneratedEndpoint] executable shell command:\\n\\n " & generatorShellCmdString & "\\n\\n----------------------' >> " & driverLogFilePath

set completeEndpoint to do shell script generatorShellCmdString

do shell script "echo \"ALOG MESSAGE [hxGetGeneratedEndpoint]: FINISHED <!schemaName!>/getMainElementStuff.applescript  [$(date)]\" >> " & driverLogFilePath

return completeEndpoint



-- ----------------------------------------------------------------------
	-- <!schemaName!>/hxGetGeneratedEndpoint.applescript
-- ----------------------------------------------------------------------

