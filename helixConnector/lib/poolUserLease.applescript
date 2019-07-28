
	
set myCollection to "<!collection!>"
set myRelation to "<!userPoolLeaseRelation!>"
set myView to "<!userPoolLeaseView!>"
set myUser to "<!user!>"
set myPassword to "<!password!>"	
	
tell application "<!applicationName!>"
	
set theRetrievedData to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
	
	
	set myLeasedUser to item 1 of helix record of item 1 of theRetrievedData
	set leasePassword to item 2 of helix record of item 1 of theRetrievedData
	
	set one to my jProp("leaseUserName", myLeasedUser)
	set two to my jProp("leasePassword", leasePassword)
	set json to my jObj({one, two})
	set result to text 1 thru -2 of json
	return result
	
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