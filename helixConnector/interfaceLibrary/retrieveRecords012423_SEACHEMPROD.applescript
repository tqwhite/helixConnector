--CURRENT PRODUCTION SEACHEM (definitely works for nightly, etc)


tell application "<!applicationName!>"

	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
	set criterionRelation to "<!criterion.relation!>"
	set criterionView to "<!criterion.view!>"
	set criterionData to "<!criterion.dataString!>"
	
	set hxcReturnMetaDataOnly to "<!hxcReturnMetaDataOnly!>"
	set hxcPagedRecordOffset to "<!hxcPagedRecordOffset!>" as integer
	set hxcPagedRecordCount to "<!hxcPagedRecordCount!>" as integer
	
	set driverHxAccessRecordCount to "<!driverHxAccessRecordCount!>" as integer
	set driverLogFilePath to "<!driverLogFilePath!>"
	
	-- ----------------------------------------------------------------------
	
	--	Use retrieveRecordsCLASSIC in this directory if you need a very simple driver script for debugging
	
	-- ----------------------------------------------------------------------

		-- <!processName!> - <!callingProcess!>
		-- <!schemaName!>
	
	-- ----------------------------------------------------------------------
	
		if (driverLogFilePath = "") then
			set driverLogFilePath to "/tmp/hxDriverLog.txt" --"/dev/null"
		end if
	
	-- ----------------------------------------------------------------------
			
	tell collection 1
			
		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve

		do shell script "echo \"\nLogging to: " & driverLogFilePath & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" driver version: -- CURRENT PRODUCTION SEACHEM (definitely works for nightly, etc)  [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" accessing: " & myRelation & "/" & myView & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" criterion: " & criterionRelation & "/" & criterionView  & "?[" & criterionData & "] (optional) $(date)\" >> " & driverLogFilePath
		do shell script "echo \" systemParameters.driverHxAccessRecordCount " & driverHxAccessRecordCount & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" queryParameters.hxcPagedRecordOffset " & hxcPagedRecordOffset & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" queryParameters.hxcPagedRecordCount " & hxcPagedRecordCount & " $(date)\" >> " & driverLogFilePath
		
		-- ----------------------------------------------------------------------		
		if criterionView is not equal to "" then
			do shell script "echo \" executing criterion " & criterionView & "/" & criterionData & " $(date)\" >> " & driverLogFilePath
			set criterionResult to utilize {myCollection, myUser, myPassword, criterionRelation, criterionView, criterionData} to store one record
		end if
		-- ----------------------------------------------------------------------		
		set viewSummary to utilize {theProcessID} to get view summary --gets us {record count, field delimiter, record delimiter}
		set totalRecordsAvailable to record count of viewSummary
		do shell script "echo \" View Summary says " & totalRecordsAvailable & " records available $(date)\" >> " & driverLogFilePath
		-- ----------------------------------------------------------------------		
		if (hxcReturnMetaDataOnly ≠ "") then
			set theClose to utilize theProcessID to close process
			do shell script "echo \"METADATA ONLY: Returning totalRecordsAvailable" & totalRecordsAvailable & " (hxcReturnMetaDataOnly set) $(date)\" >> " & driverLogFilePath
			return totalRecordsAvailable
		end if
		-- ----------------------------------------------------------------------
		if (totalRecordsAvailable = 0) then
			set theClose to utilize theProcessID to close process
			do shell script "echo \"DONE: No records found $(date)\" >> " & driverLogFilePath
			return ""
		end if
		-- ----------------------------------------------------------------------
		if (hxcPagedRecordOffset = "") then
			set recordOffset to "0"
		else
			set recordOffset to hxcPagedRecordOffset
		end if
		-- ----------------------------------------------------------------------
		set offsetRecordsAvailable to totalRecordsAvailable - recordOffset
		-- ----------------------------------------------------------------------
		if ((hxcPagedRecordCount = 0) or (hxcPagedRecordCount > offsetRecordsAvailable)) then
			set remainingRecords to offsetRecordsAvailable
		else
			set remainingRecords to hxcPagedRecordCount
		end if
		-- ----------------------------------------------------------------------
		
		set allowNoProcessMode to false --after testing, I found that noProcessMode appears to be 10% slower
		if (allowNoProcessMode and (driverHxAccessRecordCount = "" or remainingRecords < driverHxAccessRecordCount)) then
			-- NO PROCESS MODE GETS ALL DATA IN ONE CALL. HELIX CRAPS OUT IF TOO MANY RECORDS. DEFAULT FOR LEGACY.		
			
			do shell script "echo \" starting NO PROCESS, one call retrieval $(date)\" >> " & driverLogFilePath
				set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
			do shell script "echo \" FINISHED: no process retrieval sent " & remainingRecords & " records $(date)\" >> " & driverLogFilePath
		
		else
			-- PROCESS MODE GETS DATA IN PAGES. WILL RETRIEVE ALL DATA.
			-- ALWAYS SPECIFY driverHxAccessRecordCount TO USE THIS. (5000 is a good value)
			-- Terminal: defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000		
		
			set recordsSoFar to 0
			set theResult to {}
		
			do shell script "echo \" starting retrieval with process $(date)\" >> " & driverLogFilePath
			do shell script "echo \" recordOffset " & recordOffset & " $(date)\" >> " & driverLogFilePath
			-- ----------------------------------------------------------------------
		
			repeat until (remainingRecords < driverHxAccessRecordCount)
				with timeout of 3600 seconds
					set tempResult to utilize {theProcessID, 2, recordOffset, driverHxAccessRecordCount, true} to get view data as string
				end timeout
				set theResult to theResult & tempResult
				
				set currRetrievedCount to length of tempResult
				set recordsSoFar to recordsSoFar + currRetrievedCount
				set remainingRecords to remainingRecords - currRetrievedCount
				set recordOffset to recordOffset + driverHxAccessRecordCount
				
				do shell script "echo \" recordsSoFar " & recordsSoFar & " $(date)\" >> " & driverLogFilePath
				do shell script "echo \" remainingRecords " & remainingRecords & " $(date)\" >> " & driverLogFilePath
			end repeat
		
			-- ----------------------------------------------------------------------
		
			if (remainingRecords > 0) then
				do shell script "echo \" finalRemainingRecords " & remainingRecords & " $(date)\" >> " & driverLogFilePath
				set finalBatchCount to remainingRecords
				with timeout of 3600 seconds
					set tempResult to utilize {theProcessID, 2, recordOffset, finalBatchCount, true} to get view data as string
				end timeout
				set theResult to theResult & tempResult
			
				-- the following values are not strictly necessary but it's nice to be able to confirm the math all worked.

				set currRetrievedCount to length of tempResult
				set recordsSoFar to recordsSoFar + length of tempResult
				set remainingRecords to remainingRecords - currRetrievedCount
				set recordOffset to recordOffset + currRetrievedCount
			end if
		
			do shell script "echo \"DONE: " & recordsSoFar & " records sent $(date)\" >> " & driverLogFilePath
			
			-- ----------------------------------------------------------------------
		
		end if
		
		set theClose to utilize theProcessID to close process
		
	end tell
	
	return theResult
end tell

-- defaults write com.qsatoolworks.helixrade HxAppleEventMaxGet 50000
-- defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000
-- defaults read com.qsatoolworks.helixrade HxAppleEventMaxGet
-- defaults read com.qsatoolworks.helixserver HxAppleEventMaxGet # -> 65000
