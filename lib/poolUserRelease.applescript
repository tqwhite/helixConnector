
tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolReleaseRelation!>"
	set myView to "<!userPoolReleaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myLeasedUser to "<!poolUserId!>"
	
	set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for store
	set theResult to utilize {theProcessID, myLeasedUser} to store record
	set theClose to utilize theProcessID to close process
			
end tell