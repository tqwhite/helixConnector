
on run

	set myCollection to "<!collection!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
tell application "<!applicationName!>"
		tell collection 1
			login myUser password myPassword
			
			set allMyRelations to every relation
			
			set allTheNames to ""
			
			repeat with i in allMyRelations
				
				set theRelation to i
				
				tell theRelation
					set theName to name
					set theCustomName to custom name
					set nameObject to {{"nativeName", theName}, {"customName", theCustomName}}
					set nameElement to my convertToJsonObject(nameObject)
					set allTheNames to allTheNames & nameElement & ","
				end tell
			end repeat
			
			set finishedString to my wrapStringToJsonArray(allTheNames)
			
		end tell
		return finishedString
	end tell
end run


--UTILITIES =====================================================================


on q(inString)
	set dq to character id 34
	set backslash to character id 92
	--set inString to my stringReplace(inString, dq, backslash & dq)
	set inString to my stringReplace(inString, dq, "QUOTE")
	return dq & inString & dq
end q


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
		set theTextItems to ""
	end try
	
	set AppleScript's text item delimiters to theReplacementString
	set theText to theTextItems as string
	set AppleScript's text item delimiters to ""
	return theText
end stringReplace

on wrapStringToJsonArray(inString)
	
	set noFinalCommaString to text 1 thru -2 of inString
	
	set finishedString to ""
	set finishedString to finishedString & "["
	set finishedString to finishedString & noFinalCommaString
	set finishedString to finishedString & "]"
	
	return finishedString
	
end wrapStringToJsonArray