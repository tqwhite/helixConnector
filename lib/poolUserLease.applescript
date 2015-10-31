
tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolLeaseRelation!>"
	set myView to "<!userPoolLeaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"	
	
	set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
	set theRetrievedData to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
	set theClose to utilize theProcessID to close process
	
	set theItem to item 1 of theRetrievedData
	set theDataArray to (get helix record of theItem)
	set myLeasedUser to item 1 of theDataArray
	set helixId to record id of theItem
	
	--all records come with helixId first
	return {helixId, myLeasedUser}
end tell


--_inertProcess:enterAllMaster is good because it deals with the update or insert problem