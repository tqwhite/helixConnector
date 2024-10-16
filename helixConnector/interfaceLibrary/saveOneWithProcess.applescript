-- NEW for 8.5. No Tell Blocks. 8/3/24


	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
	set responseRelation to "<!response.relation!>"
	set responseView to "<!response.view!>"
	
	set myData to { ¬
	<!dataString!> ¬
	}
	
	set theResult to ""
	
	-- <!processName!> - <!processIndicator!>
	-- <!schemaName!>

	-- <!endpointFilePath!>
	

		with timeout of 3600 seconds
		
--		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
--		set viewSummary to utilize {theProcessID} to get view summary --gets us {record count, field delimiter, record delimiter}
--		set theClose to utilize theProcessID to close process
		
		set f to ASCII character 9
		set r to ASCII character 12
		
		
		tell application "<!applicationName!>" to tell collection 1 to set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for store
		tell application "<!applicationName!>" to tell collection 1 to set saveStatus to utilize {theProcessID, myData} to store records
		
		if responseRelation is not equal to "" then
			tell application "<!applicationName!>" to tell collection 1 to set theResult to utilize {myCollection, myUser, myPassword, responseRelation, responseView} to retrieve records as string
		end if
		
		
		tell application "<!applicationName!>" to tell collection 1 to set theClose to utilize theProcessID to close process
		
		end timeout


	
	return theResult
	
