tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set criterionRelation to "<!criterion.relation!>"
	set criterionView to "<!criterion.view!>"
	set criterionData to "<!criterion.dataString!>"
	
--<!processName!> - <!callingProcess!>	
	
	tell collection 1
	
		if criterionView is not equal to "" then
			set criterionResult to utilize {myCollection, myUser, myPassword, criterionRelation, criterionView, criterionData} to store one record
		end if

		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
		
	end tell
	
	return theResult
end tell
