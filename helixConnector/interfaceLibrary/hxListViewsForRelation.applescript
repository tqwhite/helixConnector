use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions


set myCollection to "<!collection!>"
set myUser to "<!user!>"
set myPassword to "<!password!>"

set relationName to "<!relationName!>"


--swap out as necessary
tell application "<!applicationName!>"

	tell collection 1
		set appendedText to ""

		login myUser password myPassword

		set allMyRelations to every relation

		repeat with i from 1 to (count allMyRelations) in allMyRelations

			set myRelation to relation i
			tell myRelation

				set theCustom to custom name
				set nativeName to name

				if (theCustom is relationName or nativeName is relationName) then
					exit repeat
				end if
			end tell

		end repeat

		tell myRelation
			set allMyViews to every view

			repeat with i from 1 to (count allMyViews) in allMyViews

				set myView to view i

				set theName to the name of myView
				set therelationName to custom name of myView

				set relationNameProp to my jProp("customeName", therelationName)
				set nativeNameProp to my jProp("nativeName", theName)
				set propertyList to {relationNameProp, nativeNameProp}
				set appendedText to appendedText & my jObj(propertyList)

			end repeat
		end tell

	set appendedText to text 1 thru -2 of appendedText
	return "[" & appendedText & "]"

	end tell
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
