tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
--<!processName!> - <!callingProcess!>	
	
	tell collection 1

		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
		
	end tell
	
	return theResult
end tell