tell application "Helix RADE"
	
	set myCollection to "helixConnectTest02"
	set myRelation to "simpleTest"
	set myView to "simpleOne"
	set myUser to "hxConnectAdmin"
	set myPassword to "1234"
	set myData to ("undefined")
	
	
	
	tell collection 1
		--set myProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		--log (myProcessID)
		--set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to get view summary
		
		--set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView, myData} to retrieve records as list
		
		--set myProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for store
		
		utilize {4} to close process
		
	end tell
	
	return myProcessID
	
end tell