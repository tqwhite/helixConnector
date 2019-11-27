use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions

--Lenny enhanced getViewSummary to do a bunch of new things.
--I have not been able to test it yet. tqii, 7/27/19


--http://192.168.0.50:9000/getViewSummary?nativeRelationName=General%20Ledger%20Accounts&viewName=008_sync_mySQL-debug

--this presupposes that there is only an abacus or a field in the rectangle
--this might be an issue, will have to check, an entry could duplicate
--it also doesn't take into account document fields or picture fields, which have been removed

-- the results show up in a variable called appendedText2

--time styles include military format, omit, or short format
--there are other formatting specifics, such as Groups (a comma) and Dollar signs - do you need these?


set myCollection to "Seachem"
set myRelation to "Entities"
set myView to "009-100"
set myUser to "exchange"
set myPassword to "2angryfrogs8flies"


--swap out as necessary
tell application "Helix Server"
	tell collection 1
		set appendedText to ""
		set appendedText2 to ""
		set theSQLResult to ""
		set theHelixResult to ""
		set allTheRectangles to {}
		set allViews to {}
		
		login myUser password "2angryfrogs8flies"
		
		set theRelationName to name of relation myRelation
		set theRelationCustomName to the custom name of relation myRelation
		
		if (myView is not "") then
			set viewName to myView
		else
			set viewName to (theRelationCustomName & "-100")
		end if
		
		set allViews to every view of relation myRelation
		
		--retrieve all the views in the relation
		repeat with x from 1 to (count allViews) in allViews
			set thisView to item x of allViews
			
			tell thisView
				set theRealViewName to the name
				set customViewName to custom name
				
				if (customViewName is not "") then
					set finalViewNameName to customViewName
				else
					set finalViewNameName to theRealViewName
				end if
				--confirm you have the right view - only way to ignore it if it hasn't been created yet
				if (finalViewNameName is viewName) then
					set viewTemplate to the view template
					tell viewTemplate
						set thePageRect to the page rectangle
						
						--get all the rectangles
						tell thePageRect
							set allTheRectangles to every template rectangle
							
							repeat with theRect from 1 to (count allTheRectangles)
								set theRectObject to item theRect
								set theRectObjectClass to (class of item theRect)
								
								if (theRectObjectClass is data rectangle) then
									
									tell theRectObject
										set theFieldIcon to the field icon
										set theAbacusIcon to the abacus icon
										
										if (theFieldIcon is not null) then
											tell theFieldIcon
												--set customName to custom name
												--set theName to name
												set theFieldType to data type
												--set theFieldFormat to the format
												
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
												end if
											end tell
											
											
										else if (theAbacusIcon is not null) then
											tell theAbacusIcon
												--	set customName to custom name
												--	set theName to name
												set theAbacusType to data type
												--set theAbacusFormat to the format
												
												
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
												end if
												
											end tell
											
										end if
										set appendedText2 to (appendedText2 & theHelixResult & ",")
									end tell
								end if
							end repeat
						end tell
					end tell
				end if
				
				
			end tell
			
		end repeat
		
		
		
		if (appendedText2 is "") then
			
			set finishedString to ""
			set finishedString to finishedString & "[{"
			
			set finishedString to finishedString & my q("error") & ":"
			set finishedString to finishedString & my q("No fields found. Probably " & viewName & " is incorrect")
			
			set finishedString to finishedString & "}]"
			return finishedString
		end if
		
		set appendedText2 to text 1 thru -2 of appendedText2
		set contextList to {{"requestedRelation", myRelation}, {"requestedView", myView}, {"viewNameUsed", viewName}, {"nativeRelationName", theRelationName}, {"customRelationName", theRelationCustomName}}
		set contextElement to my convertToJsonObject(contextList)
		
		set finishedString to ""
		set finishedString to finishedString & "{"
		set finishedString to finishedString & my q("context") & ":"
		set finishedString to finishedString & contextElement & ","
		set finishedString to finishedString & my q("fieldData") & ":"
		set finishedString to finishedString & "[" & appendedText2 & "]"
		set finishedString to finishedString & "}"
		
		
		return finishedString
		
	end tell
end tell








--FIELD TYPE CONVERTERS =====================================================================
on formatFixedPoint(hxIconObject, hxIconType)
	tell application "Helix Server"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			
			if (customName is not "") then
				set finalName to customName
			else
				set finalName to fieldName
			end if
			
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	tell application "Helix Server"
		tell hxObject
			set the decimalsOut to decimal places
			set the commasOut to commas
			set the currencyMarkOut to currency mark
		end tell
	end tell
	set propertyList to {{"decimals", decimalsOut}, {"commas", commasOut}, {"currencyMark", currencyMarkOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(finalName, hxFieldType, hxIconType, customName)
	
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatFixedPoint

--===========================================
on formatNumber(hxIconObject, hxIconType)
	tell application "Helix Server"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	
	tell application "Helix Server"
		set the decimalsOut to decimal places of hxObject
	end tell
	set propertyList to {{"decimals", decimalsOut}}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatNumber

--===========================================
on formatDateTime(hxIconObject, hxIconType)
	tell application "Helix Server"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	tell application "Helix Server"
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
	tell application "Helix Server"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	tell application "Helix Server"
	end tell
	set propertyList to {}
	
	set propertyArray to convertToJsonObject(propertyList)
	set metaDataElement to createMetaDataElement(fieldName, hxFieldType, hxIconType, customName)
	return buildFinishedJson(fieldName, metaDataElement, propertyArray)
end formatFlag

--===========================================
on formatText(hxIconObject, hxIconType)
	tell application "Helix Server"
		tell hxIconObject
			set customName to custom name
			set fieldName to name
			set hxFieldType to data type
			set hxObject to the format
		end tell
	end tell
	
	tell application "Helix Server"
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

on q(inString)
	set dq to character id 34
	return dq & inString & dq
	
end q