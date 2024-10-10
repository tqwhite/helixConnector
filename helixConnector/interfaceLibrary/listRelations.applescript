-- listRelations.applescript CONVERTED FOR 8.5 BUT NOT TESTED
-- referenced in pool-user.js
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
--<!processName!> - <!callingProcess!>
-- REFERENCED in .../code/helixConnector/helix-engine/lib/pool-user/pool-user.js
-- pool-user.js.getRelationList() is unused. not mentioned anywhere I can find today. 10/14/22 tqii
	

		set appendedText to ""
		
		tell application "<!applicationName!>" to tell collection 1 to login myUser password myPassword -- without modifying allowed (this last part not needed)
		tell application "<!applicationName!>" to tell collection 1 to set allMyRelations to every relation
		repeat with i from 1 to (count allMyRelations)
			tell application "<!applicationName!>" to tell collection 1 to set myRelation to relation i
			tell application "<!applicationName!>" to tell collection 1 to tell myRelation
				set theName to the name
				set theCustomName to the custom name
				
				set customNameProp to my jProp("customeName", theCustomName)
				set nativeNameProp to my jProp("nativeName", theName)
				set propertyList to {customNameProp, nativeNameProp}
				set appendedText to appendedText & my jObj(propertyList)
			end tell
			
		end repeat

	
	set appendedText to text 1 thru -2 of appendedText
	return "[" & appendedText & "]"


on jObj(propertyList)
	set result to ""
	repeat with element in propertyList
		set result to result & element
	end repeat
	set result to text 1 thru -2 of result
	return "{" & result & "},"
end jObj

on jProp(propName, propValue)
	return my q(propName) & ":" & my q(propValue) & ","
	--one property line "name":"value",
end jProp

on q(inString)
	set dq to character id 34
	return dq & inString & dq
	
end q