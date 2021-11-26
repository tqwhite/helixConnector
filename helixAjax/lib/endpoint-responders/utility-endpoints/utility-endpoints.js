#!/usr/bin/env node
'use strict';
const qtoolsGen = require('qtools');
const qtools = new qtoolsGen(module, { updatePrototypes: true });

const qt = require('qtools-functional-library');

const path = require('path');
const os = require('os');

//START OF moduleFunction() ============================================================

const moduleFunction = function() {
	
	
	const ping = ({ staticPageDispatchConfig, hxcVersion, bootTime }) => (
		req,
		res,
		next
	) => {
		res.status('200');
		let showPort = staticPageDispatchConfig.port;
		if (req.protocol == 'https') {
			showPort = staticPageDispatchConfig.sslPort;
		}

		const dirName = (module.path ? module.path : module.filename)
			.replace(new RegExp(process.env.HOME), '')
			.replace(/system.*$/, '');
		const identifier = dirName
			.replace(path.dirname(dirName), '')
			.replace(/\//g, '');

		res.send(
			`hxConnector (${hxcVersion}) is alive since ${bootTime} and responded to ${escape(
				req.protocol
			)}://${escape(req.hostname)}:${showPort}/${escape(
				req.path
			)} using ${identifier}`
		);
	};
	
	//---------------------------------------------------------------------------------
	
	const hxDetails = ({ summarizeConfig, newConfig }) => (req, res, next) => {
		res.send(
			summarizeConfig({ newConfig })
				.relationsAndViews({
					resultFormat: 'jsObj' //not jsObj
				})
				.map(item => item.endpointName)
		); //this is labeled as Relations and Views on the management page
	};
	
	//---------------------------------------------------------------------------------
	
	const hxConnectorCheck = ({ staticPageDispatchConfig }) => (
		req,
		res,
		next
	) => {
		const getHx = `

set everyProcess to {}
try
with timeout of 10 seconds
tell application "System Events"
set everyProcess to name of every process as list
end tell
end timeout
on error errMsg number errNum
end try
if ("Helix RADE" is in everyProcess) then
return "{" & quote & "hxAppName" & quote & ":" & quote & "Helix RADE" & quote & "}"
end if
if ("Helix Server" is in everyProcess) then
return "{" & quote & "hxAppName" & quote & ":" & quote & "Helix Server" & quote & "}"
end if
return "{" & quote & "hxAppName" & quote & ":false}"

`;

		const { execSync } = require('child_process');
		const tmp = execSync(`osascript << SCCRIPT\n${getHx}\nSCCRIPT`);

		const serverStatus = JSON.parse(tmp.toString());
		const showServer = serverStatus.hxAppName
			? `${serverStatus.hxAppName} is UP`
			: 'SERVER INACTIVE';

		const lastRestartTime = new Date().toLocaleString();
		res.status('200');
		let showPort = staticPageDispatchConfig.port;
		if (req.protocol == 'https') {
			showPort = staticPageDispatchConfig.sslPort;
		}

		res.send(
			`<div class='connectorStatus'>hxConnector on host <span style='color:green;'>${os.hostname()}:${showPort}</span><br/>
			hxConnector status: <span class='connectorStatus'>hxConnector on host <span style='color:green;'>${os.hostname()}:${showPort}</span><br/>
			last restart: <span style='color:green;'>${lastRestartTime}</span> <br/>
			helix database status: <span style='color:gray;'>${showServer}</span>
			</div>`
		);
	};
	
	//---------------------------------------------------------------------------------
	
	
	
	return { ping, hxDetails, hxConnectorCheck };
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction();
//moduleFunction().workingFunction().qtDump();

