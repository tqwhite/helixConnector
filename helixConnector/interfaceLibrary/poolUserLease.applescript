
	
set myCollection to "<!collection!>"
set myRelation to "<!userPoolLeaseRelation!>"
set myView to "<!userPoolLeaseView!>"
set myUser to "<!user!>"
set myPassword to "<!password!>"	

set driverLogFilePath to "<!driverLogFilePath!>"
	
-- <!schemaName!>
	
tell application "<!applicationName!>"
	
	--do shell script "echo \"\nRequesting new pool user   [$(date)]\" >> " & driverLogFilePath
	
	--do shell script "echo \" myRelation " & myRelation & "   [$(date)]\" >> " & driverLogFilePath
	--do shell script "echo \" myView " & myView & "   [$(date)]\" >> " & driverLogFilePath
	--do shell script "echo \" myUser " & myUser & "   [$(date)]\" >> " & driverLogFilePath
	--do shell script "echo \" myPassword " & myPassword & "   [$(date)]\" >> " & driverLogFilePath
		
	set theRetrievedData to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
	
	try
		set poolCount to length of theRetrievedData
	on error
		set poolCount to 0
	end try
	
	if (poolCount = 0) then
		set one to my jProp("error", "No pool users found in Helix")
		set json to my jObj({one})
		set errorMessage to text 1 thru -2 of json
		return errorMessage
	end if
	
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