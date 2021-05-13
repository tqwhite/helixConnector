tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myData to ("<!dataString!>")
	
--<!processName!> - <!callingProcess!>
-- <!schemaName!>
	
	tell collection 1
		with timeout of 3600 seconds
		--set myProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		--log (myProcessID)
		--set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to get view summary
		
		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView, myData} to store one record
		
		end timeout
	end tell
end tell