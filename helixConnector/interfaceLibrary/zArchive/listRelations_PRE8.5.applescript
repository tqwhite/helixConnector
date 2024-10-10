-- listRelations_PRE8.5.applescript

tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
--<!processName!> - <!callingProcess!>
-- REFERENCED in .../code/helixConnector/helix-engine/lib/pool-user/pool-user.js
-- pool-user.js.getRelationList() is unused. not mentioned anywhere I can find today. 10/14/22 tqii
	
	tell collection myCollection
		set appendedText to ""
		
		login myUser password myPassword -- without modifying allowed (this last part not needed)
		set allMyRelations to every relation
		repeat with i from 1 to (count allMyRelations)
			set myRelation to relation i
			tell myRelation
				set theName to the name
				set theCustomName to the custom name
				
				set customNameProp to my jProp("customeName", theCustomName)
				set nativeNameProp to my jProp("nativeName", theName)
				set propertyList to {customNameProp, nativeNameProp}
				set appendedText to appendedText & my jObj(propertyList)
			end tell
			
		end repeat
	end tell
	
	set appendedText to text 1 thru -2 of appendedText
	return "[" & appendedText & "]"
end tell

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