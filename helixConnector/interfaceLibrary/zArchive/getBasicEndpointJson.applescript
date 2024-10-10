-- ----------------------------------------------------------------------
-- Script Start: getBasicEndpointJson.applescript
-- <!schemaName!>
-- NEW for 8.5. No Tell Blocks. 8/6/24
-- ----------------------------------------------------------------------
use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions
		
--http://192.168.0.50:9000/getViewSummary?nativeRelationName=General%20Ledger%20Accounts&viewName=008_sync_mySQL-debug

--this presupposes that there is only an abacus or a field in the rectangle
--this might be an issue, will have to check, an entry could duplicate
--it also doesn't take into account document fields or picture fields, which have been removed

-- the results show up in a variable called appendedText2

--time styles include military format, omit, or short format
--there are other formatting specifics, such as Groups (a comma) and Dollar signs - do you need these?



set myCollection to "<!myCollection!>"
set myRelation to "<!myRelation!>"
set myView to "<!myView!>"
set myUser to "<!myUser!>"
set myPassword to "<!myPassword!>"

set myData to ("<!myData!>")

set driverLogFilePath to "<!driverLogFilePath!>"


set driverLibraryDirPath to "<!driverLibraryDirPath!>"



set criterionView to "<!criterionView!>"
set criterionRelation to "<!criterionRelation!>"
set responseView to "<!responseView!>"
set responseRelation to "<!responseRelation!>"

	-- ----------------------------------------------------------------------

		-- <!schemaName!>
		
		-- <!scriptFilePath!>
		
		-- nativeRelationName name can actually be either native or custom 
	
	-- ----------------------------------------------------------------------


		do shell script "echo \"\nAPPLESCRIPT: <!myRelation!>.<!myView!>/getBasicEndpointJson.applescript   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" creating endpoint for: " & myRelation & "/" & myView & "   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \"driverLibraryDirPath " & driverLibraryDirPath & "\" >> " & driverLogFilePath

-- 		do shell script "echo \" driver version:   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" systemParameters.driverHxAccessRecordCount " & driverHxAccessRecordCount & "   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" queryParameters.hxcPagedRecordOffset " & hxcPagedRecordOffset & "   [$(date)]\" >> " & driverLogFilePath
-- 		do shell script "echo \" queryParameters.hxcPagedRecordCount " & hxcPagedRecordCount & "   [$(date)]\" >> " & driverLogFilePath
		

--swap out as necessary

		set appendedText to ""
		set appendedText2 to ""
		set theSQLResult to ""
		set theHelixResult to ""
		set allTheRectangles to {}
		
		tell application "<!applicationName!>" to tell collection 1 to login myUser password myPassword
	

	
		set theRelationName to ""
		try
			tell application "<!applicationName!>" to tell collection 1 to set theRelationName to name of relation myRelation
		end try
		
		if (theRelationName is "") then
			set nativeName to my getNativeNameFromCustom(myRelation)
			
			set myRelation to nativeName
			set theRelationName to nativeName
		end if
		
		tell application "<!applicationName!>" to tell collection 1 to set theRelationCustomName to the custom name of relation myRelation
		
		
		if (myView is not "") then
			set viewName to myView
		else
			set viewName to (theRelationCustomName & "_DISCARD_DEPRECATED_NOW_CREATED_IN_msOpGen")
		end if
		
		tell application "<!applicationName!>" to tell collection 1 to set allViews to every view of relation myRelation
		
		--retrieve all the views in the relation
		repeat with x in allViews
		
		
		
			set thisView to x
			
			
			
				tell application "<!applicationName!>" to tell collection 1 to tell thisView to set theRealViewName to the name
				tell application "<!applicationName!>" to tell collection 1 to tell thisView to set theRealViewCustomName to the custom name
				
				
				if (theRealViewCustomName is not "") then
					set theRealViewName to theRealViewCustomName
				end if
				
				--confirm you have the right view - only way to ignore it if it hasn't been created yet
				if (theRealViewName is viewName) then
		
					tell application "<!applicationName!>" to tell collection 1 to tell thisView to set viewTemplate to the view template
					
					
						tell application "<!applicationName!>" to tell collection 1 to tell thisView to tell viewTemplate to set thePageRect to the page rectangle
						
						--get all the rectangles
							
						tell application "<!applicationName!>" to tell collection 1 to tell thisView to tell viewTemplate to tell thePageRect to set allTheRectangles to every template rectangle
							
						tell application "<!applicationName!>" to tell collection 1 to tell thisView to tell viewTemplate to tell thePageRect
							repeat with theRect from 1 to (count allTheRectangles)
								set theRectObject to item theRect
								set theRectObjectClass to (class of item theRect)
								
								if (theRectObjectClass is data rectangle) then
									
									tell theRectObject
										set theFieldIcon to the field icon
										set fieldIconClass to the class of the theFieldIcon
										
										set theAbacusIcon to the abacus icon
										set theAbacusIconClass to the class of theAbacusIcon
										
										if (fieldIconClass is not object) then
											
											--if (theFieldIcon is not null) then
											tell theFieldIcon
												set theFieldType to data type
												set theFieldFormat to the format
												
												if (theFieldType is fixed point type) then
													set theHelixResult to my formatFixedPoint(theFieldIcon, "field")
												else if (theFieldType is number type) then
													set theHelixResult to my formatNumber(theFieldIcon, "field")
												else if (theFieldType is date time type) then
													set theHelixResult to my formatDateTime(theFieldIcon, "field")
												else if (theFieldType is flag type) then
													set theHelixResult to my formatFlag(theFieldIcon, "field")
												else if (theFieldType is text type) then
													set theHelixResult to my formatText(theFieldIcon, "field")
												else if (theFieldType is styled text type) then
													set theHelixResult to my formatText(theFieldIcon, "field")
												end if
											end tell
											
										else if (theAbacusIconClass is not object) then
											tell theAbacusIcon
												set theAbacusType to data type
												set theAbacusFormat to the format
												
												if (theAbacusType is fixed point type) then
													set theHelixResult to my formatFixedPoint(theAbacusIcon, "abacus")
												else if (theAbacusType is number type) then
													set theHelixResult to my formatNumber(theAbacusIcon, "abacus")
												else if (theAbacusType is date time type) then
													set theHelixResult to my formatDateTime(theAbacusIcon, "abacus")
												else if (theAbacusType is flag type) then
													set theHelixResult to my formatFlag(theAbacusIcon, "abacus")
												else if (theAbacusType is text type) then
													set theHelixResult to my formatText(theAbacusIcon, "abacus")
												else if (theAbacusType is styled text type) then
													set theHelixResult to my formatText(theAbacusIcon, "abacus")
												end if
												
											end tell
											
										end if
										set appendedText2 to (appendedText2 & theHelixResult & ",")
									end tell
								end if
							end repeat
						end tell

				end if

			
		end repeat
		
		
 
		

--		assemble main element json ----------------------------------------------------------------------------------------

		
		
		
		if (appendedText2 is "") then
			
			set mainElementJson to ""
			set mainElementJson to mainElementJson & "[{"
			
			set mainElementJson to mainElementJson & my q("error") & ":"
			set mainElementJson to mainElementJson & my q("No fields found. Probably " & viewName & " is incorrect")
			
			set mainElementJson to mainElementJson & "}]"
			return mainElementJson
		end if
		
 		do shell script "echo \"ALOG MESSAGE [getBasicEndpointJson]: primaryKeyName is UNKNOWNVALUEIN_GETBASICENDPOINT because retrievePrimaryKey() is Seachem specific ------------------------ [$(date)]\" >> " & driverLogFilePath
	--	set primaryKeyName to my retrievePrimaryKey(theRelationCustomName, myUser, myPassword)
		set primaryKeyName to "UNKNOWNVALUEIN_GETBASICENDPOINT"
		
		set appendedText2 to text 1 thru -2 of appendedText2
		set contextList to {{"primaryKeyName", primaryKeyName}, {"requestedRelation", myRelation}, {"requestedView", myView}, {"viewNameUsed", viewName}, {"nativeRelationName", theRelationName}, {"customRelationName", theRelationCustomName}}
		set contextElement to my convertToJsonObject(contextList)
		
		set mainElementJson to ""
		set mainElementJson to mainElementJson & "{"
		set mainElementJson to mainElementJson & my q("context") & ":"
		set mainElementJson to mainElementJson & contextElement & ","
		set mainElementJson to mainElementJson & my q("fieldData") & ":"
		set mainElementJson to mainElementJson & "[" & appendedText2 & "]"
		set mainElementJson to mainElementJson & "}"
		

--		getViewSummary into separator.json ----------------------------------------------------------------------------------------

		tell application "<!applicationName!>" to tell collection 1 to set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, viewName} to create process for retrieve
		tell application "<!applicationName!>" to tell collection 1 to set viewSummary to utilize {theProcessID} to get view summary --gets us {record count, field delimiter, record delimiter}
		tell application "<!applicationName!>" to tell collection 1 to set theClose to utilize theProcessID to close process

	
----------------------------------------------------------------------------------------------------
-- SUPER DUPER HIDEOUS HACK --------------------------------------------------------------------

-- For some reason, in Server v6.2, this code does not work:

--		set fieldSeparator to field delimiters of viewSummary
--		set recordSeparator to record delimiters of viewSummary

-- After a huge amount of flogging, this does the job:

		set recordCount to "PLACEHOLDER_RECORDCOUNT"
		set fieldSeparator to "PLACEHOLDER_FIELDSEPARATOR"
		set recordSeparator to "PLACEHOLDER_RECORDSEPARATOR"
				
		set inx to 0
		
		repeat with value in viewSummary as list
			if (inx is 0) then
				set recordCount to value
			end if
			
			if (inx is 1) then
				set fieldSeparator to value
			end if
			
		   if (inx is 2) then
				set recordSeparator to value
			end if
			set inx to inx + 1
		end repeat
		
-- It is, of course, stupidly fragile. If the order of the input values ever changes, 
-- it is busto but I cannot figure out an alternative.

-- SUPER DUPER HIDEOUS HACK END --------------------------------------------------------------------	
----------------------------------------------------------------------------------------------------

		set separatorJson to "{" & "\"recordSeparator\":\"" & recordSeparator & "\",\"fieldSeparator\":\"" & fieldSeparator & "\"}"
				
		
--		generatorHelper(mainElementJson, separatorJson) ----------------------------------------------------------------------------------------

 		do shell script "echo \"ALOG MESSAGE [getBasicEndpointJson]: getBasicEndpointJson.applescript spawns getBasicEndpointSepAssembler.js------------------------ [$(date)]\" >> " & driverLogFilePath
		set scriptLibDirName to "<!schemaName!>_lib"
		set generatorHelperFileName to "getBasicEndpointSepAssembler.js"
		set helperFilePath to driverLibraryDirPath & "/" & scriptLibDirName & "/" & generatorHelperFileName & " -combineElementAndSeparatorsToFinalJson " 

		
		set generatorShellCmdString to "/usr/local/bin/node " & helperFilePath &  " '" & driverLogFilePath & "' " & " '" & mainElementJson &"'" & " '" & separatorJson & "'"
		set elementJson to do shell script generatorShellCmdString

		
		
--		do shell script "echo 'ALOG MESSAGE [getBasicEndpointJson]: separatorJson " & separatorJson & "' >> " & driverLogFilePath
--		do shell script "echo 'ALOG MESSAGE [getBasicEndpointJson]: elementJson " & elementJson & "' >> " & driverLogFilePath
-- 		do shell script "echo \"endpointString ---------------------------------------- \" >> " & driverLogFilePath
-- 		do shell script "echo \"" & endpointString & "\" >> " & driverLogFilePath
-- 		do shell script "echo \"---------------------------------------- [$(date)]\" >> " & driverLogFilePath


		do shell script "echo \"finished <!schemaName!>/getBasicEndpointJson.applescript  [$(date)]\" >> " & driverLogFilePath
		
		return elementJson
		-- return mainElementJson
		
-- ----------------- end tell end tell







--FIELD TYPE CONVERTERS =====================================================================

on formatFixedPoint(hxIconObject, hxIconType)
	
			tell application "<!applicationName!>" to tell hxIconObject to set customName to custom name
			tell application "<!applicationName!>" to tell hxIconObject to set fieldName to name
			tell application "<!applicationName!>" to tell hxIconObject to set hxFieldType to data type
			tell application "<!applicationName!>" to tell hxIconObject to set hxObject to the format

	
	if (customName is "") then
		set customName to fieldName
	end if
	
	
			tell application "<!applicationName!>" to tell hxObject to set the decimalsOut to decimal places
			tell application "<!applicationName!>" to tell hxObject to set the commasOut to commas
			tell application "<!applicationName!>" to tell hxObject to set the currencyMarkOut to currency mark

	set propertyList to {{"decimals", decimalsOut}, {"commas", commasOut}, {"currencyMark", currencyMarkOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatFixedPoint

--===========================================
on formatNumber(hxIconObject, hxIconType)
	tell application "<!applicationName!>" to tell hxIconObject to set customName to custom name
			tell application "<!applicationName!>" to tell hxIconObject to set fieldName to name
			tell application "<!applicationName!>" to tell hxIconObject to set hxFieldType to data type
			tell application "<!applicationName!>" to tell hxIconObject to set hxObject to the format

	
	if (customName is "") then
		set customName to fieldName
	end if
	
	
		tell application "<!applicationName!>" to set the decimalsOut to decimal places of hxObject

	set propertyList to {{"decimals", decimalsOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatNumber

--===========================================
on formatDateTime(hxIconObject, hxIconType)

			tell application "<!applicationName!>" to tell hxIconObject to set customName to custom name
			tell application "<!applicationName!>" to tell hxIconObject to set fieldName to name
			tell application "<!applicationName!>" to tell hxIconObject to set hxFieldType to data type
			tell application "<!applicationName!>" to tell hxIconObject to set hxObject to the format

	
	if (customName is "") then
		set customName to fieldName
	end if
	
	
		tell application "<!applicationName!>" to set the dateStyleOut to the date style of hxObject
		tell application "<!applicationName!>" to set the hasSecondsOut to the include seconds of hxObject
		tell application "<!applicationName!>" to set the hasLeadingZeroOut to the leading zero of hxObject
		tell application "<!applicationName!>" to set the timeStyleOut to the time style of hxObject

	set propertyList to {{"decimals", dateStyleOut}, {"hasSeconds", hasSecondsOut}, {"hasLeadingZero", hasLeadingZeroOut}, {"timeStyle", timeStyleOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatDateTime

--===========================================
on formatFlag(hxIconObject, hxIconType)

			tell application "<!applicationName!>" to tell hxIconObject to set customName to custom name
			tell application "<!applicationName!>" to tell hxIconObject to set fieldName to name
			tell application "<!applicationName!>" to tell hxIconObject to set hxFieldType to data type
			tell application "<!applicationName!>" to tell hxIconObject to set hxObject to the format

	
	if (customName is "") then
		set customName to fieldName
	end if
	

	set propertyList to {}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatFlag

--===========================================
on formatText(hxIconObject, hxIconType)
	
			tell application "<!applicationName!>" to tell hxIconObject to set customName to custom name
			tell application "<!applicationName!>" to tell hxIconObject to set fieldName to name
			tell application "<!applicationName!>" to tell hxIconObject to set hxFieldType to data type
			tell application "<!applicationName!>" to tell hxIconObject to set hxObject to the format

	
	if (customName is "") then
		set customName to fieldName
	end if
	

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
	set apos to character id 39
	set backslash to character id 92
	--set inString to my stringReplace(inString, dq, backslash & dq)
	set inString to my stringReplace(inString, dq, "QUOTETOKEN")
	set inString to my stringReplace(inString, apos, "APOSTOKEN")
	return dq & inString & dq
	
end q





on retrievePrimaryKey(theRelationCustomName, myUser, myPassword)
	
	set referenceCollection to "<!myCollection!>"
	set myRelation to "363" --this is the InertProceess relation
	set myView to "sqlMirrorCriterionForm02"
	set myData to theRelationCustomName
	

		
		tell application "<!applicationName!>" to tell collection 1 to set theResult to utilize {referenceCollection, myUser, myPassword, myRelation, myView, myData} to store one record
		
		
		tell application "<!applicationName!>" to tell collection 1 to set myRelation to "085" --this is the !-Custom Names Relation
		set myView to "retrievePrimaryKeyName"
		--local theResult
		tell application "<!applicationName!>" to tell collection 1 to set processID to utilize {referenceCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		tell application "<!applicationName!>" to tell collection 1 to set theResult to utilize {referenceCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
		tell application "<!applicationName!>" to tell collection 1 to set theDisconnect to utilize {processID} to close process
		
		tell application "<!applicationName!>" to tell collection 1 to set primaryKeyName to item 1 of the helix record of item 1 of theResult

	
	return primaryKeyName
	
	
end retrievePrimaryKey

on getNativeNameFromCustom(customNameIn)
	-- goodbye
	
	set myCollection to "<!myCollection!>"
	set myUser to "<!myUser!>"
	set myPassword to "<!myPassword!>"
	
		set theResult to customNameIn
		
			tell application "<!applicationName!>" to tell collection 1 to login myUser password myPassword
			
			tell application "<!applicationName!>" to tell collection 1 to set allMyRelations to every relation
			
			repeat with i in allMyRelations
				
				set theRelation to i
				
				tell application "<!applicationName!>" to tell collection 1 to tell theRelation to set theName to name
				tell application "<!applicationName!>" to tell collection 1 to tell theRelation to set theCustomName to custom name
					
				if (theCustomName is customNameIn) then
					set theResult to theName
					exit repeat
				end if
				
			end repeat
		return theResult
end getNativeNameFromCustom

	

-- ----------------------------------------------------------------------
	-- <!schemaName!>/getMainElementStuff.applescript
	
	
-- set criterionView to "<!criterionView!>"
-- set criterionRelation to "<!criterionRelation!>"
-- set responseView to "<!responseView!>"
-- set responseRelation to "<!responseRelation!>"
-- ----------------------------------------------------------------------
