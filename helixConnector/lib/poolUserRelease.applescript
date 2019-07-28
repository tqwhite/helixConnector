
tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolReleaseRelation!>"
	set myView to "<!userPoolReleaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myLeasedUser to "<!leaseUserName!>"
	
--<!processName!> - <!callingProcess!>
	
	set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView, myLeasedUser} to store one record

			
end tell