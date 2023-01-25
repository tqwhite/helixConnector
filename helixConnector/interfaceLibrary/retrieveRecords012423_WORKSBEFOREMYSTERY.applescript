--LAST VERSION BEFORE SEACHEM MEETING

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
	
	set noProcessThreshold to 25000
	
	set noProcessThreshold to 3000
	--set driverHxAccessRecordCount to "1000" as integer
	
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

		do shell script "echo \"\nLogging to: " & driverLogFilePath & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" driver version: -- LAST VERSION BEFORE SEACHEM MEETING  [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" accessing: " & myRelation & "/" & myView & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" criterion: " & criterionRelation & "/" & criterionView  & "?[" & criterionData & "] (optional) $(date)\" >> " & driverLogFilePath
		do shell script "echo \" systemParameters.driverHxAccessRecordCount " & driverHxAccessRecordCount & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" queryParameters.hxcPagedRecordOffset " & hxcPagedRecordOffset & " $(date)\" >> " & driverLogFilePath
		do shell script "echo \" queryParameters.hxcPagedRecordCount " & hxcPagedRecordCount & " $(date)\" >> " & driverLogFilePath
		
		-- ----------------------------------------------------------------------	
		if criterionView is not equal to "" then
			set criterionResult to utilize {myCollection, myUser, myPassword, criterionRelation, criterionView, criterionData} to store one record
		end if
		-- ----------------------------------------------------------------------	
		set viewSummaryProcessId to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		do shell script "echo \" ----viewSummaryProcessId= " & viewSummaryProcessId & " OPENED $(date)\" >> " & driverLogFilePath
		set viewSummary to utilize {viewSummaryProcessId} to get view summary --gets us {record count, field delimiter, record delimiter}
		set theClose to utilize viewSummaryProcessId to close process
		do shell script "echo \" ----viewSummaryProcessId= " & viewSummaryProcessId & " CLOSED $(date)\" >> " & driverLogFilePath
		
		set totalRecordsAvailable to record count of viewSummary
		do shell script "echo \" View Summary says TOTALRECORDSAVAILABLE = " & totalRecordsAvailable & " records available $(date)\" >> " & driverLogFilePath
		-- ----------------------------------------------------------------------	
		if (hxcReturnMetaDataOnly ≠ "") then
			do shell script "echo \"DONE: Returning totalRecordsAvailable " & totalRecordsAvailable & " (hxcReturnMetaDataOnly set) $(date)\" >> " & driverLogFilePath
			return totalRecordsAvailable
		end if
		-- ----------------------------------------------------------------------
		if (totalRecordsAvailable = 0) then
			do shell script "echo \"DONE: No records found $(date)\" >> " & driverLogFilePath
			return ""
		end if
		-- ----------------------------------------------------------------------
		
		do shell script "echo \" Decision values (use process) " & totalRecordsAvailable & " < " & noProcessThreshold & " retrieval $(date)\" >> " & driverLogFilePath
		if (driverHxAccessRecordCount = "" or totalRecordsAvailable < noProcessThreshold) then
			-- NO PROCESS MODE GETS ALL DATA IN ONE CALL. HELIX CRAPS OUT IF TOO MANY RECORDS. DEFAULT FOR LEGACY.		
			
			do shell script "echo \" starting NO PROCESS retrieval $(date)\" >> " & driverLogFilePath
			set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
			do shell script "echo \" FINISHED: no process retrieval $(date)\" >> " & driverLogFilePath
			
		else
			-- PROCESS MODE GETS DATA IN PAGES. WILL RETRIEVE ALL DATA.
			-- ALWAYS SPECIFY driverHxAccessRecordCount TO USE THIS. (5000 is a good value)
			-- Terminal: defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000
			
			do shell script "echo \" starting retrieval WITH PROCESS $(date)\" >> " & driverLogFilePath
			
			-- ----------------------------------------------------------------------	
			set retrievalProcessId to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve	
			do shell script "echo \" ----retrievalProcessId= " & retrievalProcessId & " OPENED $(date)\" >> " & driverLogFilePath
			
				do shell script "echo \" Waiting one second for ALL $(date)\" >> " & driverLogFilePath
				delay 1			
			if (totalRecordsAvailable > 100000) then
				do shell script "echo \" Waiting one second for large datasetl $(date)\" >> " & driverLogFilePath
				delay 1
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
			
			set recordsSoFar to 0
			set theResult to {}
			
			do shell script "echo \" recordOffset " & recordOffset & " $(date)\" >> " & driverLogFilePath
			-- ----------------------------------------------------------------------
			
			do shell script "echo \" Decision values (main loop) " & remainingRecords & " < " & driverHxAccessRecordCount & " $(date)\" >> " & driverLogFilePath
			repeat until (remainingRecords < driverHxAccessRecordCount)
				do shell script "echo \" main retrieval loop:  recordOffset " & recordOffset & " batchCount "  & driverHxAccessRecordCount & " $(date)\" >> " & driverLogFilePath
				with timeout of 3600 seconds
					set tempResult to utilize {retrievalProcessId, 2, recordOffset, driverHxAccessRecordCount, true} to get view data as string
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
				set finalBatchCount to remainingRecords
				do shell script "echo \" final retrieval:  recordOffset " & recordOffset & " finalBatchCount "  & finalBatchCount & " $(date)\" >> " & driverLogFilePath
				with timeout of 3600 seconds
					set tempResult to utilize {retrievalProcessId, 2, recordOffset, finalBatchCount, true} to get view data as string
				end timeout
				set theResult to theResult & tempResult
				
				-- the following values are not strictly necessary but it's nice to be able to confirm the math all worked.
				
				set currRetrievedCount to length of tempResult
				set recordsSoFar to recordsSoFar + (length of tempResult)
				set remainingRecords to remainingRecords - currRetrievedCount
				set recordOffset to recordOffset + currRetrievedCount
			end if
			
			do shell script "echo \"DONE: " & recordsSoFar & " records sent $(date)\" >> " & driverLogFilePath
			
			-- ----------------------------------------------------------------------
			set theClose to utilize retrievalProcessId to close process	
		do shell script "echo \" ----retrievalProcessId= " & retrievalProcessId & " CLOSED $(date)\" >> " & driverLogFilePath
			
		end if
			
	end tell
	
	return theResult
end tell

-- defaults write com.qsatoolworks.helixrade HxAppleEventMaxGet 5000
-- defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000
-- defaults read com.qsatoolworks.helixrade HxAppleEventMaxGet
-- defaults read com.qsatoolworks.helixserver HxAppleEventMaxGet # -> 65000
-- deployPrograms hx_db2_schAqua --actions=code,restart
