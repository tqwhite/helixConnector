property collectionName : "<!collection!>"

--THIS DOES NOT WORK

--test entry type template
property theRelation : "<!relation!>"
property theView : "<!view!>"

--test list type template
--property theRelation : "upTest1"
--property theView : "retrieve_testFormCountOnTextField" --"upTest1_RetrieveAll" -- --


property myUser : "<!user!>"
property myPass : "<!password!>"


tell application id "<!applicationName!>"
	
	tell collection 1
		--for use with server
		login myUser password myPass with modifying allowed
		set thisView to view theView of relation theRelation
		
		set thisTemplate to the view template of thisView
		set thePageRect to the page rectangle of thisTemplate
		set allMyRectangles to every template rectangle of thePageRect
		
		set allDataRectangles to "record id: 1"
		repeat with i from 1 to (count allMyRectangles)
			set theRectangle to item i of allMyRectangles
			if (class of theRectangle is data rectangle) then
				set theField to the field icon of theRectangle
				set theAbacus to the abacus icon of theRectangle
				
				if (theField is not null object id 0) then
					set thefieldName to the name of theField
					set theFieldType to the data type of theField
					set theData to (thefieldName & tab & theFieldType & tab & "RepeatNo")
					
				else if ((theField is null object id 0) and (theAbacus is not null object id 0)) then
					set theAbacusName to the name of theAbacus
					set theAbacusType to the data type of theAbacus
					set theData to (theAbacusName & tab & theAbacusType & tab & "RepeatNo")
				end if
				
				set allDataRectangles to (allDataRectangles & return & theData)
				
				--else if (class of theRectangle is group rectangle) then
				--	set allGroupRects to every template rectangle of theRectangle
				--	if (class of theRectangle is data rectangle) then
				--		copy theRectangle to the end of allDataRectangles
				--	end if
			else if (class of theRectangle is repeat rectangle) then
				set allRepeatRects to every template rectangle of theRectangle
				
				repeat with h from 1 to (count allRepeatRects)
					set theRectangle to item h of allRepeatRects
					if (class of theRectangle is data rectangle) then
						set theField to the field icon of theRectangle
						set theAbacus to the abacus icon of theRectangle
						
						if (theField is not null object id 0) then
							set thefieldName to the name of theField
							set theFieldType to the data type of theField
							set theData to (thefieldName & tab & theFieldType & tab & "RepeatYes")
							
						else if ((theField is null object id 0) and (theAbacus is not null object id 0)) then
							set theAbacusName to the name of theAbacus
							set theAbacusType to the data type of theAbacus
							set theData to (theAbacusName & tab & theAbacusType & tab & "RepeatYes")
						end if
					end if
					set allDataRectangles to (allDataRectangles & return & theData)
				end repeat
			end if
		end repeat
		logout
		return allDataRectangles
	end tell
end tell


