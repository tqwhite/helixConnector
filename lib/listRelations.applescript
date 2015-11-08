tell application "<!applicationName!>"
	
	set myCollection to "<!collection!>"
	set myRelation to "<!relation!>"
	set myView to "<!view!>"
	set myUser to "<!user!>"
	set myPassword to "<!password!>"
	
--<!processName!> - <!callingProcess!>
	
	tell collection myCollection
		set appendedText to ""
		
		login myUser password myPassword -- without modifying allowed (this last part not needed)
		set allMyRelations to the name of every relation
		
		repeat with i from 1 to (length of allMyRelations)
			set theString to item i of allMyRelations
			set fullString to ("helix record id:" & i & ", " & "helix record:" & theString & ", ")
			set appendedText to (appendedText & fullString)
			set theLength to ((length of appendedText) - 2)
			set appendedTextFinal to (text of characters 1 thru theLength of appendedText) as string
		end repeat
		
	end tell
end tell