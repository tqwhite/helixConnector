-- NEW for 8.5. No Tell Blocks. 8/3/24

use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions


set myCollection to "<!collection!>"
set myUser to "<!user!>"
set myPassword to "<!password!>"

set relationName to "<!relationName!>"


		set appendedText to ""

		tell application "<!applicationName!>" to tell collection 1 to login myUser password myPassword

		tell application "<!applicationName!>" to tell collection 1 to set allMyRelations to every relation

		repeat with i from 1 to (count allMyRelations) in allMyRelations

			tell application "<!applicationName!>" to tell collection 1 to set myRelation to relation i
			

				tell application "<!applicationName!>" to tell collection 1 to tell myRelation to set theCustom to custom name
				tell application "<!applicationName!>" to tell collection 1 to tell myRelation to set nativeName to name

				if (theCustom is relationName or nativeName is relationName) then
					exit repeat
				end if
	

		end repeat

		
			tell application "<!applicationName!>" to tell collection 1 to tell myRelation to set allMyViews to every view

			repeat with i from 1 to (count allMyViews) in allMyViews

				tell application "<!applicationName!>" to tell collection 1 to tell myRelation to set myView to view i

				tell application "<!applicationName!>" to tell collection 1 to tell myRelation to set theName to the name of myView
				tell application "<!applicationName!>" to tell collection 1 to tell myRelation to set therelationName to custom name of myView

				set relationNameProp to my jProp("customeName", therelationName)
				set nativeNameProp to my jProp("nativeName", theName)
				set propertyList to {relationNameProp, nativeNameProp}
				set appendedText to appendedText & my jObj(propertyList)

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
