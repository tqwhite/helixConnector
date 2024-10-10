-- NEW for 8.5. No Tell Blocks. 8/3/24
-- used as internal endpoint in helixConnector.js line 109, probably no longer used

	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	set myData to ("<!dataString!>")

	--<!processName!> - <!callingProcess!>
	-- <!schemaName!>

	-- <!endpointFilePath!>

		with timeout of 3600 seconds

			tell application "<!applicationName!>" to tell collection 1 to set theResult to utilize {myCollection, myUser, myPassword, myRelation, myView, myData} to store one record

		end timeout