use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions

--http://192.168.0.50:9000/getViewSummary?nativeRelationName=General%20Ledger%20Accounts&viewName=008_sync_mySQL-debug

--this presupposes that there is only an abacus or a field in the rectangle
--this might be an issue, will have to check, an entry could duplicate
--it also doesn't take into account document fields or picture fields, which have been removed

-- the results show up in a variable called appendedText2

--time styles include military format, omit, or short format
--there are other formatting specifics, such as Groups (a comma) and Dollar signs - do you need these?



set myCollection to "<!collection!>"
set myRelation to "<!nativeRelationName!>"
set myView to "<!viewName!>"
set myUser to "<!user!>"
set myPassword to "<!password!>"

set myData to ("<!dataString!>")

set driverLogFilePath to "<!driverLogFilePath!>"


set scriptFilePath to "<!scriptFilePath!>"
set scriptString to "/usr/local/bin/node -e 'const path=require(\"path\"); const parse=path.parse(\"" & scriptFilePath & "\"); console.log(parse.dir);'"
set scriptParentDirPath to do shell script scriptString



	-- ----------------------------------------------------------------------

		-- <!processName!> - <!callingProcess!>
		-- <!schemaName!>
		
		-- <!scriptFilePath!>
		
		-- verified to work with curldb4 prod 'hxGetGeneratedEndpoint?nativeRelationName=RELATIONNAME&viewName=VIEWNAME
		-- nativeRelationName name can actually be either native or custom 
	
	-- ----------------------------------------------------------------------


		do shell script "echo \"\nSTARTING: <!schemaName!> to: " & driverLogFilePath & "   [$(date)]\" >> " & driverLogFilePath
 		do shell script "echo \" creating endpoint for: " & myRelation & "/" & myView & "   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \"scriptFilePath " & scriptFilePath & "\" >> " & driverLogFilePath
		do shell script "echo \"scriptParentDirPath " & scriptParentDirPath & "\" >> " & driverLogFilePath

-- 		do shell script "echo \" driver version:   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" systemParameters.driverHxAccessRecordCount " & driverHxAccessRecordCount & "   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" queryParameters.hxcPagedRecordOffset " & hxcPagedRecordOffset & "   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" queryParameters.hxcPagedRecordCount " & hxcPagedRecordCount & "   [$(date)]\" >> " & driverLogFilePath
		

--swap out as necessary
tell application "<!applicationName!>"
	tell collection 1

--		new getElement stuff ----------------------------------------------------------------------------------------

		set scriptLibDirName to "<!schemaName!>_lib"
		set generatorHelperFileName to "generatorHelper.js"
		set helperFilePath to scriptParentDirPath & "/" & scriptLibDirName & "/" & generatorHelperFileName
		
		set generatorShellCmdString to "/usr/local/bin/node " & helperFilePath & " -operateSpecialElement " 
set generatorShellCmdString to generatorShellCmdString & "\"" & driverLogFilePath & "\"" 
set generatorShellCmdString to generatorShellCmdString & " --myCollection=" & "\"" & myCollection & "\""
set generatorShellCmdString to generatorShellCmdString & " --myRelation=" & "\"" & myRelation & "\""
set generatorShellCmdString to generatorShellCmdString & " --myView=" & "\"" & myView & "\""
set generatorShellCmdString to generatorShellCmdString & " --myUser=" & "\"" & myUser & "\""
set generatorShellCmdString to generatorShellCmdString & " --driverLogFilePath=" & "\"" & driverLogFilePath & "\""
set generatorShellCmdString to generatorShellCmdString & " --scriptFilePath=" & "\"" & scriptFilePath & "\""
set generatorShellCmdString to generatorShellCmdString & " --scriptParentDirPath=" & "\"" & scriptParentDirPath & "\""
set generatorShellCmdString to generatorShellCmdString & " --schemaName=\"<!schemaName!>\""
set generatorShellCmdString to generatorShellCmdString & " --applicationName=\"<!applicationName!>\""
set generatorShellCmdString to generatorShellCmdString & " --myPassword=" & "\"X" & myPassword & "X\""
		
		
		do shell script "echo '\ngeneratorShellCmdStringe " & generatorShellCmdString & "\n\n' >> " & driverLogFilePath
		
		
	 	set mainElementJson to do shell script generatorShellCmdString

		
		
		return mainElementJson
		
	end tell
end tell







--FIELD TYPE CONVERTERS =====================================================================

on formatFixedPoint(hxIconObject, hxIconType)
	tell application "<!applicationName!>"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	if (customName is "") then
		set customName to fieldName
	end if
	
	tell application "<!applicationName!>"
		tell hxObject
			set the decimalsOut to decimal places
			set the commasOut to commas
			set the currencyMarkOut to currency mark
		end tell
	end tell
	set propertyList to {{"decimals", decimalsOut}, {"commas", commasOut}, {"currencyMark", currencyMarkOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatFixedPoint

--===========================================
on formatNumber(hxIconObject, hxIconType)
	tell application "<!applicationName!>"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	if (customName is "") then
		set customName to fieldName
	end if
	
	
	tell application "<!applicationName!>"
		set the decimalsOut to decimal places of hxObject
	end tell
	set propertyList to {{"decimals", decimalsOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatNumber

--===========================================
on formatDateTime(hxIconObject, hxIconType)
	tell application "<!applicationName!>"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	if (customName is "") then
		set customName to fieldName
	end if
	
	tell application "<!applicationName!>"
		set the dateStyleOut to the date style of hxObject
		set the hasSecondsOut to the include seconds of hxObject
		set the hasLeadingZeroOut to the leading zero of hxObject
		set the timeStyleOut to the time style of hxObject
	end tell
	set propertyList to {{"decimals", dateStyleOut}, {"hasSeconds", hasSecondsOut}, {"hasLeadingZero", hasLeadingZeroOut}, {"timeStyle", timeStyleOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatDateTime

--===========================================
on formatFlag(hxIconObject, hxIconType)
	tell application "<!applicationName!>"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	if (customName is "") then
		set customName to fieldName
	end if
	
	tell application "<!applicationName!>"
	end tell
	set propertyList to {}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatFlag

--===========================================
on formatText(hxIconObject, hxIconType)
	tell application "<!applicationName!>"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	if (customName is "") then
		set customName to fieldName
	end if
	
	tell application "<!applicationName!>"
	end tell
	set propertyList to {}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatText


--UTILITIES =====================================================================
on buildFinishedJson(fieldName, metaDataElement, propertyArray)
	
	set jsonOut to ""
	set jsonOut to jsonOut & "{"
	
	
	set jsonOut to jsonOut & q("meta") & ":"
	set jsonOut to jsonOut & metaDataElement
	set jsonOut to jsonOut & ","
	
	set jsonOut to jsonOut & q("properties") & ":"
	set jsonOut to jsonOut & propertyArray
	set jsonOut to jsonOut & "}"
	
end buildFinishedJson

on createMetaDataElement(nativeName, hxFieldType, hxIconType, customName)
	
	set jsonOut to ""
	set jsonOut to jsonOut & "{"
	
	set jsonOut to jsonOut & q("nativeName") & ":" & q(nativeName) & ","
	set jsonOut to jsonOut & q("customName") & ":" & q(customName) & ","
	set jsonOut to jsonOut & q("fieldType") & ":" & q(hxFieldType) & ","
	set jsonOut to jsonOut & q("iconType") & ":" & q(hxIconType)
	
	set jsonOut to jsonOut & "}"
	
	return jsonOut
end createMetaDataElement

on convertToJsonArray(propertyList)
	set dq to character id 34
	set listLen to length of propertyList
	set counter to 0
	set propertyString to ""
	repeat with i from 1 to length of propertyList
		set element to item i of propertyList
		set propertyName to item 1 of element
		set propertyValue to item 2 of element
		set json to "{" & q(propertyName) & ":" & q(propertyValue) & "}"
		set counter to counter + 1
		if (counter < listLen) then
			set propertyString to propertyString & json & ","
		else
			set propertyString to propertyString & json
		end if
	end repeat
	return "[" & propertyString & "]"
	
end convertToJsonArray

on convertToJsonObject(propertyList)
	set dq to character id 34
	set listLen to length of propertyList
	set counter to 0
	set propertyString to ""
	repeat with i from 1 to length of propertyList
		set element to item i of propertyList
		set propertyName to item 1 of element
		set propertyValue to item 2 of element
		set json to q(propertyName) & ":" & q(propertyValue)
		set counter to counter + 1
		if (counter < listLen) then
			set propertyString to propertyString & json & ","
		else
			set propertyString to propertyString & json
		end if
	end repeat
	return "{" & propertyString & "}"
	
end convertToJsonObject



on stringReplace(theText, theSearchString, theReplacementString)
	--thanks: https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/ManipulateText.html#//apple_ref/doc/uid/TP40016239-CH33-SW4
	
	try
		set AppleScript's text item delimiters to theSearchString
	on error
		return theText
	end try
	
	try
		set theTextItems to every text item of theText
	on error
		set theTextItems to theText
	end try
	
	set AppleScript's text item delimiters to theReplacementString
	set theText to theTextItems as string
	set AppleScript's text item delimiters to ""
	return theText
end stringReplace


on q(inString)
	set dq to character id 34
	set backslash to character id 92
	--set inString to my stringReplace(inString, dq, backslash & dq)
	set inString to my stringReplace(inString, dq, "QUOTE")
	return dq & inString & dq
	
end q





on retrievePrimaryKey(theRelationCustomName, myUser, myPassword)
	
	set referenceCollection to "Seachem"
	set myRelation to "363" --this is the InertProceess relation
	set myView to "sqlMirrorCriterionForm02"
	set myData to theRelationCustomName
	
	tell application "<!applicationName!>"
		
		set theResult to utilize {referenceCollection, myUser, myPassword, myRelation, myView, myData} to store one record
		
		
		set myRelation to "085" --this is the !-Custom Names Relation
		set myView to "retrievePrimaryKeyName"
		--local theResult
		set processID to utilize {referenceCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		set theResult to utilize {referenceCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
		set theDisconnect to utilize {processID} to close process
		
		set primaryKeyName to item 1 of the helix record of item 1 of theResult
	end tell
	
	return primaryKeyName
	
	
end retrievePrimaryKey

on getNativeNameFromCustom(customNameIn)
	
	
	set myCollection to "<!collection!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
	tell application "<!applicationName!>"
		tell collection 1
			login myUser password myPassword
			
			set allMyRelations to every relation
			
			repeat with i in allMyRelations
				
				set theRelation to i
				
				tell theRelation
					set theName to name
					set theCustomName to custom name
					
					if (theCustomName is customNameIn) then
						set theResult to theName
						exit repeat
					end if
				end tell
			end repeat
		end tell
		return theResult
	end tell
end getNativeNameFromCustom

	

-- ----------------------------------------------------------------------
	-- <!schemaName!>
-- ----------------------------------------------------------------------
