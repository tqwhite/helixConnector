-- NEW for 8.5. No Tell Blocks. 8/3/24
-- poolUserReleaseAll.applescript
	
	set myCollection to "<!collection!>"
	set myRelation to "<!userPoolReleaseRelation!>"
	set myView to "<!userPoolReleaseView!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myLeasedUser to "<!leaseUserName!>"
	
-- <!schemaName!>

set myRelation to "userpool global"
set myView to "reset user pool"
set myCountingView to "reset user pool no post"


	set countTotal to 0
	set inUseCount to 0
	set inUseCountAfter to 0
	set inUse to false
	
	
	--get the count of inUse
	try
		tell application "<!applicationName!>" to set theResult to utilize {myCollection, myUser, myPassword, myRelation, myCountingView} to retrieve records as list
		repeat with x in theResult
			set theUser to x
			tell application "<!applicationName!>" to set theUserName to item 1 of helix record of theUser
			tell application "<!applicationName!>" to set inUse to item 2 of helix record of theUser as boolean
			if (inUse) then
				set inUseCount to (inUseCount + 1)
			end if
			if (theUserName starts with "web") then
				set countTotal to (countTotal + 1)
			end if
		end repeat
		
	on error errMsg number errNum
	end try
	
	--now retrieve and post to not inUse
	try
		tell application "<!applicationName!>" to set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView} to retrieve records as list
		
	on error errMsg number errNum
	end try
	
	try
		tell application "<!applicationName!>" to set theResult to utilize {myCollection, myUser, myPassword, myRelation, myCountingView} to retrieve records as list
		repeat with x in theResult
			set theUser to x
			tell application "<!applicationName!>" to set inUse to item 2 of helix record of theUser as boolean
			if (inUse) then
				set inUseCountAfter to (inUseCountAfter + 1)
			end if
			
		end repeat
		
	end try
	
	
	return "There were " & inUseCount & " users in use." & " There are now " & inUseCountAfter & " users in use, of a total of " & countTotal & "."
	
