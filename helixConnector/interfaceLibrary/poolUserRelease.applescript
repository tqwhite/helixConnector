-- NEW for 8.5. No Tell Blocks. 8/3/24
-- poolUserRelease.applescript
--<!processName!> - <!callingProcess!>
-- <!schemaName!>
-- <!annotation!>
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolReleaseRelation!>"
	set myView to "<!userPoolReleaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myLeasedUser to "<!leaseUserName!>"
	
	
	tell application "<!applicationName!>" to set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView, myLeasedUser} to store one record

			
