
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
		
		-- <!endpointFilePath!>
	
	-- ----------------------------------------------------------------------
	
		if (driverLogFilePath = "") then
			set driverLogFilePath to "/tmp/hxDriverLog.txt" --"/dev/null"
		end if
	
	-- ----------------------------------------------------------------------
			
	tell collection 1
			
		set theProcessID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve

		do shell script "echo \"\nLogging to: " & driverLogFilePath & "   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" driver version:   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" accessing: " & myRelation & "/" & myView & "   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" systemParameters.driverHxAccessRecordCount " & driverHxAccessRecordCount & "   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" queryParameters.hxcPagedRecordOffset " & hxcPagedRecordOffset & "   [$(date)]\" >> " & driverLogFilePath
		do shell script "echo \" queryParameters.hxcPagedRecordCount " & hxcPagedRecordCount & "   [$(date)]\" >> " & driverLogFilePath
		
		-- ----------------------------------------------------------------------	
		-- SET CRITERION IF IT EXISTS
			
		if criterionView is not equal to "" then
			set criterionResult to utilize {myCollection, myUser, myPassword, criterionRelation, criterionView, criterionData} to store one record
			do shell script "echo \" CRITERION- " & criterionRelation & "/" & criterionView  & "?[" & criterionData & "] (optional)   [$(date)]\" >> " & driverLogFilePath
		end if
		
		-- ----------------------------------------------------------------------
		-- GET TOTAL RECORD COUNT
		
		set viewSummary to utilize {theProcessID} to get view summary --gets us {record count, field delimiter, record delimiter}
		set totalRecordsAvailable to record count of viewSummary
		
		do shell script "echo \" TOTAL RECORDS AVAILABLE- " & totalRecordsAvailable & "   [$(date)]\" >> " & driverLogFilePath
		
		-- ----------------------------------------------------------------------		
		-- RETURN IF THIS IS A METADATA CALL
				
		if (hxcReturnMetaDataOnly ≠ "") then
			set theClose to utilize theProcessID to close process
			do shell script "echo \"DONE: Returning totalRecordsAvailable" & totalRecordsAvailable & " (hxcReturnMetaDataOnly set)   [$(date)]\" >> " & driverLogFilePath
			return totalRecordsAvailable
		end if
		
		-- ----------------------------------------------------------------------	
		-- RETURN IF NO RECORDS ARE AVAILABLE
			
		if (totalRecordsAvailable = 0) then
			set theClose to utilize theProcessID to close process
			do shell script "echo \"DONE: No records found   [$(date)]\" >> " & driverLogFilePath
			return ""
		end if
		
		-- ----------------------------------------------------------------------
		-- PROCESS REQUEST
		-- ----------------------------------------------------------------------
		
		if (driverHxAccessRecordCount = "") then
			-- 'NO PROCESS MODE' GETS ALL DATA IN ONE CALL. HELIX CRAPS OUT IF TOO MANY RECORDS. DEFAULT FOR LEGACY.		
			
			do shell script "echo \" starting no process retrieval   [$(date)]\" >> " & driverLogFilePath
				set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
			do shell script "echo \" FINISHED: no process retrieval   [$(date)]\" >> " & driverLogFilePath
		
		else
			-- PROCESS MODE GETS DATA IN PAGES. WILL RETRIEVE ALL DATA.
			-- ALWAYS SPECIFY driverHxAccessRecordCount TO USE THIS. (5000 is a good value)
			-- Terminal: defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000
			
			-- ----------------------------------------------------------------------
			-- DEFINE WORKING PARAMETERS
			
			if (hxcPagedRecordOffset = "") then
				set recordOffset to "0"
			else
				set recordOffset to hxcPagedRecordOffset
			end if
			
			-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
			
			set totalRecordsAfterOffset to totalRecordsAvailable - recordOffset
			
			-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
			set noUserSpecifiedCount to ((hxcPagedRecordCount = 0) or (hxcPagedRecordCount > totalRecordsAfterOffset))
			
			if (noUserSpecifiedCount) then
				set remainingRecords to totalRecordsAfterOffset
			else
				set remainingRecords to hxcPagedRecordCount
			end if	
			
			-- ----------------------------------------------------------------------
			-- GET DATA BLOCKS
		
			set recordsSoFar to 0
			set theResult to {}
		
			do shell script "echo \" starting retrieval with process   [$(date)]\" >> " & driverLogFilePath
			do shell script "echo \" recordOffset " & recordOffset & "   [$(date)]\" >> " & driverLogFilePath
			
			-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 	
		
			repeat until (remainingRecords < driverHxAccessRecordCount)
				with timeout of 3600 seconds
					set tempResult to utilize {theProcessID, 2, recordOffset, driverHxAccessRecordCount, true} to get view data as string
				end timeout
				set theResult to theResult & tempResult
				
				set currRetrievedCount to length of tempResult
				set recordsSoFar to recordsSoFar + currRetrievedCount
				set remainingRecords to remainingRecords - currRetrievedCount
				set recordOffset to recordOffset + driverHxAccessRecordCount
				
				do shell script "echo \" recordsSoFar " & recordsSoFar & "   [$(date)]\" >> " & driverLogFilePath
				do shell script "echo \" remainingRecords " & remainingRecords & "   [$(date)]\" >> " & driverLogFilePath
			end repeat
		
			-- ----------------------------------------------------------------------
			-- GET FINAL DATA REMAINDER
		
			if (remainingRecords > 0) then
				do shell script "echo \" finalRemainingRecords " & remainingRecords & "   [$(date)]\" >> " & driverLogFilePath
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
		
			do shell script "echo \"DONE: " & recordsSoFar & " records sent   [$(date)]\" >> " & driverLogFilePath
			
			-- ----------------------------------------------------------------------
		
		end if
		
		set theClose to utilize theProcessID to close process
		
	end tell
	
	return theResult
end tell
	
-- ----------------------------------------------------------------------
	-- <!schemaName!>
-- ----------------------------------------------------------------------

-- defaults write com.qsatoolworks.helixrade HxAppleEventMaxGet 5000
-- defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000
-- defaults read com.qsatoolworks.helixrade HxAppleEventMaxGet
-- defaults read com.qsatoolworks.helixserver HxAppleEventMaxGet # -> 65000
