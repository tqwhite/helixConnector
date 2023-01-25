--WORKS GREAT FOR SMALL VIEWS, BUSTED FOR MIRROR

tell application "<!applicationName!>"

	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
	set criterionRelation to "<!criterion.relation!>"
	set criterionView to "<!criterion.view!>"
	set criterionData to "<!criterion.dataString!>"
	
	-- ----------------------------------------------------------------------
	
	set hxcReturnMetaDataOnly to "<!hxcReturnMetaDataOnly!>"
	set hxcPagedRecordOffset to "<!hxcPagedRecordOffset!>" as integer
	set hxcPagedRecordCount to "<!hxcPagedRecordCount!>" as integer
	
	set driverHxAccessRecordCount to "<!driverHxAccessRecordCount!>" as integer
	--set driverHxAccessRecordCount to "500" as integer -- often useful for testing
	
	set driverLogFilePath to "<!driverLogFilePath!>"
	
	set retrievalProcessId to 0 --make sure this is in the global scope
	
	-- ----------------------------------------------------------------------
	
	set noProcessThreshold to 3000
	set extraDelayRecordThreshold to 50000
	
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

		my addToLog("\nLogging to: " & driverLogFilePath)
		my addToLog(" driver version: WORKS GREAT FOR SMALL VIEWS, BUSTED FOR MIRROR 011823.5")
		my addToLog(" accessing: " & myRelation & "/" & myView)
		my addToLog(" criterion: " & criterionRelation & "/" & criterionView  & "?[" & criterionData & "] (optional) ")
		my addToLog(" systemParameters.driverHxAccessRecordCount " & driverHxAccessRecordCount)
		my addToLog(" queryParameters.hxcPagedRecordOffset " & hxcPagedRecordOffset)
		my addToLog(" queryParameters.hxcPagedRecordCount " & hxcPagedRecordCount)
		
		-- ----------------------------------------------------------------------	
		if criterionView is not equal to "" then
			set criterionResult to utilize {myCollection, myUser, myPassword, criterionRelation, criterionView, criterionData} to store one record
		end if
		-- ----------------------------------------------------------------------	
		set viewSummaryProcessId to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
		my addToLog(" ----viewSummaryProcessId= " & viewSummaryProcessId & " OPENED (viewSummary)")
		set viewSummary to utilize {viewSummaryProcessId} to get view summary --gets us {record count, field delimiter, record delimiter}
		set theClose to utilize viewSummaryProcessId to close process
		my addToLog(" ----viewSummaryProcessId= " & viewSummaryProcessId & " CLOSED (viewSummary)")
		
		set totalRecordsAvailable to record count of viewSummary
		my addToLog(" View Summary says TOTALRECORDSAVAILABLE = " & totalRecordsAvailable & " records available")
		-- ----------------------------------------------------------------------	
		if (hxcReturnMetaDataOnly ≠ "") then
			my addToLog("DONE: Returning totalRecordsAvailable " & totalRecordsAvailable & " (hxcReturnMetaDataOnly set)")
			return totalRecordsAvailable
		end if
		-- ----------------------------------------------------------------------
		if (totalRecordsAvailable = 0) then
			my addToLog("DONE: No records found")
			return ""
		end if
		-- ----------------------------------------------------------------------
		
		my addToLog(" Use Process if totalRecordsAvailable:" & totalRecordsAvailable & " < noProcessThreshold:" & noProcessThreshold & " retrieval")
		if (driverHxAccessRecordCount = "" or totalRecordsAvailable < 25000) then
			-- NO PROCESS MODE GETS ALL DATA IN ONE CALL. HELIX CRAPS OUT IF TOO MANY RECORDS. DEFAULT FOR LEGACY.		
			
			my addToLog(" starting NO PROCESS retrieval")
			set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
			my addToLog(" FINISHED: no process retrieval")
			
		else
			-- PROCESS MODE GETS DATA IN PAGES. WILL RETRIEVE ALL DATA.
			-- ALWAYS SPECIFY driverHxAccessRecordCount TO USE THIS. (5000 is a good value)
			-- Terminal: defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 65000
			
			my addToLog(" starting retrieval WITH PROCESS")
			
			-- ----------------------------------------------------------------------	
			-- ----------------------------------------------------------------------	
			my waitAwhile(1, totalRecordsAvailable, 1) --seems to make the world a better place if I let helix take a beat for every relation
			my waitAwhile(10, totalRecordsAvailable, extraDelayRecordThreshold) -- big relations need extra time
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
			
			my addToLog(" recordOffset " & recordOffset)
			-- ----------------------------------------------------------------------
			
			my addToLog(" Use main loop if (remainingRecords:" & remainingRecords & " >= driverHxAccessRecordCount:" & driverHxAccessRecordCount & ")  ")
			repeat until (remainingRecords < driverHxAccessRecordCount)
				my addToLog(" START MAIN RETRIEVAL LOOP:  recordOffset " & recordOffset & " batchCount "  & driverHxAccessRecordCount)
		
				my waitAwhile(1, totalRecordsAvailable, extraDelayRecordThreshold) -- helix returns from applscript calls before it's done, this helps, I think
				
				try
					with timeout of 3600 seconds
			set retrievalProcessId to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve		
					my addToLog(" ----retrievalProcessId= " & retrievalProcessId & " OPENED (main loop)")
			my waitAwhile(10, totalRecordsAvailable, extraDelayRecordThreshold) -- big relations need extra time
						set tempResult to utilize {retrievalProcessId, 2, recordOffset, driverHxAccessRecordCount, true} to get view data as string
			set theClose to utilize retrievalProcessId to close process	
					my addToLog(" ----retrievalProcessId= " & retrievalProcessId & " CLOSED (main loop)")
					end timeout
				on error the errorMessage number the errorNumber
					set theClose to utilize retrievalProcessId to close process	
					my addToLog(" ----retrievalProcessId= " & retrievalProcessId & " CLOSED (error main loop)")
					my addToLog("HELIX APPLESCRIPT ERROR (main loop): " & errorNumber & " : " & errorMessage)
					error "HELIX APPLESCRIPT ERROR (main loop): " & errorNumber & " : " & errorMessage
				end try
				set theResult to theResult & tempResult
				
				set currRetrievedCount to length of tempResult
				set recordsSoFar to recordsSoFar + currRetrievedCount
				set remainingRecords to remainingRecords - currRetrievedCount
				set recordOffset to recordOffset + driverHxAccessRecordCount
				
				my addToLog(" recordsSoFar " & recordsSoFar)
				my addToLog(" remainingRecords " & remainingRecords)
			end repeat
			
			-- ----------------------------------------------------------------------

			my addToLog(" Use final retrieval if (remainingRecords:" & remainingRecords & " > 0" & ")")
			my waitAwhile(10, totalRecordsAvailable, extraDelayRecordThreshold) -- big relations need extra time
			if (remainingRecords > 0) then
				set finalBatchCount to remainingRecords
				my addToLog(" FINAL RETRIEVAL:  recordOffset " & recordOffset & " finalBatchCount "  & finalBatchCount)
				try
					with timeout of 3600 seconds
			set retrievalProcessId to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve		
					my addToLog(" ----retrievalProcessId= " & retrievalProcessId & " OPENED (final retrieve)")
			my waitAwhile(10, totalRecordsAvailable, extraDelayRecordThreshold) -- big relations need extra time
						set tempResult to utilize {retrievalProcessId, 2, recordOffset, finalBatchCount, true} to get view data as string
			set theClose to utilize retrievalProcessId to close process	
					my addToLog(" ----retrievalProcessId= " & retrievalProcessId & " CLOSED (final retrieve)")
					end timeout
				on error the errorMessage number the errorNumber
					set theClose to utilize retrievalProcessId to close process	
					my addToLog(" ----retrievalProcessId= " & retrievalProcessId & " CLOSED (error final retrieve)")
					my addToLog("HELIX APPLESCRIPT ERROR (final retrieve): " & errorNumber & " : " & errorMessage)
					error "HELIX APPLESCRIPT ERROR (final retrieve): " & errorNumber & " : " & errorMessage
				end try
				
				set theResult to theResult & tempResult
				
				-- the following values are not strictly necessary but it's nice to be able to confirm the math all worked.
				
				set currRetrievedCount to length of tempResult
				set recordsSoFar to recordsSoFar + (length of tempResult)
				set remainingRecords to remainingRecords - currRetrievedCount
				set recordOffset to recordOffset + currRetrievedCount
			end if
			
			my addToLog("DONE: " & recordsSoFar & " records sent")
			
			-- ----------------------------------------------------------------------
			
		end if
			
	end tell
	
	return theResult
end tell

-- ----------------------------------------------------------------------

on waitAwhile(delaySeconds, totalRecordsAvailable, extraDelayRecordThreshold)
	if (totalRecordsAvailable > extraDelayRecordThreshold) then
		delay delaySeconds
	end if
end waitAwhile

-- ----------------------------------------------------------------------

on addToLog(message)
	set driverLogFilePath to "<!driverLogFilePath!>"
	do shell script "echo \"" & message & " $(date)\" >> " & driverLogFilePath
end addToLog

-- ----------------------------------------------------------------------
	
-- ======================================================================
-- note: these are read dynamically and do not require program restart
-- defaults write com.qsatoolworks.helixrade HxAppleEventMaxGet 5000
-- defaults write com.qsatoolworks.helixserver HxAppleEventMaxGet 5000
-- defaults read com.qsatoolworks.helixrade HxAppleEventMaxGet
-- defaults read com.qsatoolworks.helixserver HxAppleEventMaxGet # -> 65000
-- deployPrograms hx_db2_schAqua --actions=code,restart
