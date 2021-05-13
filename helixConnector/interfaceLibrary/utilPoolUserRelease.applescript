
tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolReleaseRelation!>"
	set myView to "<!userPoolReleaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myLeasedUser to "<!leaseUserName!>"
	
-- <!schemaName!>
	
	try
		
		set theLeaseCount to 0
		set isItLeased to false
		
		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
		set theUser to object 1 of theResult as list
		on error errMsg number errNum
	end try
	
	try
		theResult
	on error
		return "Release Pool User is not supported here"
	end try
	
	repeat with i in theResult
		set isItLeased to item 4 of helix record of i
		if (isItLeased = yes) then
			set counter to 1
		else
			set counter to 0
		end if
		
		set theLeaseCount to (theLeaseCount + counter)
		
		
	end repeat
	
	set theMsg to (theLeaseCount & " users released")
	return theMsg
	
end tell

