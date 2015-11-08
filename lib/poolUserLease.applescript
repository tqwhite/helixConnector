
tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolLeaseRelation!>"
	set myView to "<!userPoolLeaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"	
	
--<!processName!> - <!callingProcess!>
	
	set theRetrievedData to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list

	
	set theItem to item 1 of theRetrievedData
	set theDataArray to (get helix record of theItem)
	set myLeasedUser to item 1 of theDataArray
	set leasePasswordEncrypted to item 5 of theDataArray
	set helixId to record id of theItem
	
	--all records come with helixId first
	return {helixId, myLeasedUser, leasePasswordEncrypted}
end tell


--_inertProcess:enterAllMaster is good because it deals with the update or insert problem