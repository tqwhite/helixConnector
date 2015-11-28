tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myData to {<!dataString!>}
	
--<!processName!> - <!processIndicator!>
	
	tell collection 1
		
--		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
--		set viewSummary to utilize {theProcessID} to get view summary --gets us {record count, field delimiter, record delimiter}
--		set theClose to utilize theProcessID to close process
		
		set f to ASCII character 9
		set r to ASCII character 12
		
		
		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for store
		set saveStatus to utilize {theProcessID, myData} to store records
		set theClose to utilize theProcessID to close process

	end tell
	
	return
	
end tell