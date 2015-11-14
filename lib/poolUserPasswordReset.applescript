

property userPoolUsers : {"hxConnect01", "hxConnect02", "hxConnect03", "hxConnect04", "hxConnect05", "hxConnect06", "hxConnect07", "hxConnect08", "hxConnect09", "hxConnectAdmin"}

tell application "Helix RADE"
	tell collection 1
		
		
		set newPass to "Your code here"
		
		
		
		repeat with i from 1 to (length of userPoolUsers)
			set thisUser to item i of userPoolUsers
			tell user thisUser
				set password to newPass
			end tell
		end repeat
		
	end tell
end tell