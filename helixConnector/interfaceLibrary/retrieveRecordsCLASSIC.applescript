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
-- <!schemaName!>

	
		set driverHxAccessRecordCount to "<!driverHxAccessRecordCount!>" as integer
		set driverLogFilePath to "<!driverLogFilePath!>"
		do shell script "echo \"\nLogging to: " & driverLogFilePath & "   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" driver version: -- CLASSIC DRIVER  [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" accessing: " & myRelation & "/" & myView & "   [$(date)]\" >> " & driverLogFilePath
		if criterionView is not equal to "" then
			do shell script "echo \" CRITERION- " & criterionRelation & "/" & criterionView  & "?[" & criterionData & "] (optional)   [$(date)]\" >> " & driverLogFilePath
		end if
	
	tell collection 1
		with timeout of 3600 seconds
			
			if criterionView is not equal to "" then
				set criterionResult to utilize {myCollection, myUser, myPassword, criterionRelation, criterionView, criterionData} to store one record
			end if
			
			set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
			
		end timeout
	end tell

	return theResult
end tell


-- deployPrograms hx_db2_schAqua --actions=code,restart