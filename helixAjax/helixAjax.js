#!/usr/local/bin/node
'use strict';

/*

	MacOS security throws an error (displays a user confirmation dialog) every time
	the initial file for an unsigned program is changed.

	This file serves as an unchanging intermediate. It simply forwards execution
	to a file that often changes.

	If you ever change this file, make sure you are able to go to the Mac UI to
	click OK on some dialog boxes.
	
	TQ White II, 9/23/21

*/

require('./helixAjaxActual.js');