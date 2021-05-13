set myCollection to "<!collection!>"
set myRelation to "<!relation!>"
set myView to "<!view!>"
set myUser to "<!user!>"
set myPassword to "<!password!>"

(*Tq wants a get view params, getting the 120 basically*)

tell application "<!applicationName!>"
	tell collection 1
	--set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string --get view summary
	
	set processID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve
	set theViewSum to utilize {processID} to get view summary
	set theDisconnect to utilize {processID} to close process
	
	--this is optional, but it's here...
	set numRecords to record count of theViewSum
	set fieldSeparator to field delimiters of theViewSum
	set recordSeparator to record delimiters of theViewSum
	
	--guessing you want to do stuff after this... 
	--https://discussions.apple.com/thread/1988268
	set encodedRecordSeparator to do shell script "/usr/bin/python -c 'import sys, urllib; print urllib.quote(sys.argv[1])' " & quoted form of recordSeparator
	set encodedFieldSeparator to do shell script "/usr/bin/python -c 'import sys, urllib; print urllib.quote(sys.argv[1])' " & quoted form of fieldSeparator
	
	--this is what you had before... with an added close, which I needed for testing - you may not
	
	set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string
	
	
	
	set theDisconnect to close process
	
	return {numRecords:numRecords, encodedRecordSeparator:encodedRecordSeparator, encodedFieldSeparator:encodedFieldSeparator}
	end tell

end tell