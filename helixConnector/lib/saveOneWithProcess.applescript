tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
	set responseRelation to "<!response.relation!>"
	set responseView to "<!response.view!>"
	
	set myData to {<!dataString!>}
	
	set theResult to ""
	
--HELLO <!processName!> - <!processIndicator!>
	
	tell collection 1
		
--		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
--		set viewSummary to utilize {theProcessID} to get view summary --gets us {record count, field delimiter, record delimiter}
--		set theClose to utilize theProcessID to close process
		
		set f to ASCII character 9
		set r to ASCII character 12
		
		
		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for store
		set saveStatus to utilize {theProcessID, myData} to store records
		
		if responseRelation is not equal to "" then
			set theResult to utilize {myCollection, myUser, myPassword, responseRelation, responseView} to retrieve records as string
		end if
		
		
		set theClose to utilize theProcessID to close process
		

	end tell
	
	return theResult
	
end tell