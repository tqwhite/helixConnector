tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
	
--<!leaseUserName!>	
	
	tell collection 1
		--set myProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		--log (myProcessID)
		--set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to get view summary
		
		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
		
	end tell
	
	return theResult
end tell