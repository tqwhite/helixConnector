
-- ----------------------------------------------------------------------
	-- <!schemaName!>/hxGetGeneratedEndpoint.applescript
-- ----------------------------------------------------------------------

set driverLogFilePath to "<!driverLogFilePath!>"
set scriptFilePath to "<!scriptFilePath!>"

set calcParentScriptString to "/usr/local/bin/node -e 'const path=require(\"path\"); const parse=path.parse(\"" & scriptFilePath & "\"); console.log(parse.dir);'"
set driverLibraryDirPath to do shell script calcParentScriptString

do shell script "echo \"ALOG MESSAGE [hxGetGeneratedEndpoint]: \nAPPLESCRIPT: <!nativeRelationName!>.<!viewName!>/hxGetGeneratedEndpoint.applescript>   [$(date)]\" >> " & driverLogFilePath

set scriptLibDirName to "<!schemaName!>_lib"
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
set generatorShellCmdString to generatorShellCmdString & " --skipPoolUser=\"[[skipPoolUser]]\""
set generatorShellCmdString to generatorShellCmdString & " --primaryKey=\"[[primaryKey]]\""

-- LOGGING---------------------------------------------------------------

do shell script "echo \"ALOG MESSAGE [hxGetGeneratedEndpoint]: To show compiled version of this script, edit '.../helixAjax/internalEndpoints/fileOne.json/hxGetGeneratedEndpoint' and set property debug:true, restart the connector. - [$(date)]\" >> " & driverLogFilePath
do shell script "echo '---------------------\\n\\nALOG MESSAGE [hxGetGeneratedEndpoint] executable shell command:\\n\\n " & generatorShellCmdString & "\\n\\n----------------------' >> " & driverLogFilePath

set completeEndpoint to do shell script generatorShellCmdString

do shell script "echo \"ALOG MESSAGE [hxGetGeneratedEndpoint]: FINISHED <!schemaName!>/getMainElementStuff.applescript  [$(date)]\" >> " & driverLogFilePath

return completeEndpoint



-- ----------------------------------------------------------------------
	-- <!schemaName!>/hxGetGeneratedEndpoint.applescript
-- ----------------------------------------------------------------------

