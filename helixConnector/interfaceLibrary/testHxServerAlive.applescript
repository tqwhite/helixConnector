
set everyProcess to {}

-- <!schemaName!>

try
	with timeout of 10 seconds
		
		tell application "System Events"
			set everyProcess to name of every process as list
		end tell
	end timeout
	
on error errMsg number errNum
end try


if ("<!applicationName!>" is in everyProcess) then
	
	return "{\"databaseAlive\":true}"
	
end if


return "{\"databaseAlive\":false}"