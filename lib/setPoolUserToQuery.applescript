tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myData to ("<!dataString!>")
	
--<!processName!> - <!callingProcess!>	
	
	tell collection 1

		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView, myData} to store one record
		
	end tell
end tell