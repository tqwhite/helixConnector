set myCollection to "<!collection!>"set myRelation to "<!relation!>"set myView to "<!view!>"set myUser to "<!user!>"set myPassword to "<!password!>"(*Tq wants a get view params, getting the 120 basically*)tell application "<!applicationName!>"	tell collection 1	--set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string --get view summary		set processID to utilize {myCollection, myUser, myPassword, myRelation, myView} to create process for retrieve	set theViewSum to utilize {processID} to get view summary	set theDisconnect to utilize {processID} to close process		--this is optional, but it's here...	set numRecords to record count of theViewSum	set delims to field delimiters of theViewSum	set recSeparator to record delimiters of theViewSum		--guessing you want to do stuff after this... 			--this is what you had before... with an added close, which I needed for testing - you may not		set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as string		set theDisconnect to close process	end tellend tell