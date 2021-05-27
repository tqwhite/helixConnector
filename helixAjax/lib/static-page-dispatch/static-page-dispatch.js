'use strict';
var qtools = require('qtools'),
	qtools = new qtools(module),
	events = require('events'),
	util = require('util'),
	fs = require('fs');
const path = require('path');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args) {
	events.EventEmitter.call(this);
	this.forceEvent = forceEvent;
	this.args = args;
	this.metaData = {};
	this.addMeta = function(name, data) {
		this.metaData[name] = data;
	};

	qtools.validateProperties({
		subject: args || {},
		targetScope: this, //will add listed items to targetScope
		propList: [
			{
				name: 'router',
				optional: false
			},
			{
				name: 'filePathList',
				optional: false
			},
			{
				name: 'suppressLogEndpointsAtStartup',
				optional: true
			}
		]
	});

	var self = this,
		forceEvent = function(eventName, outData) {
			this.emit(eventName, {
				eventName: eventName,
				data: outData
			});
		};

	const supportedMimeTypes = {
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		css: 'text/css',
		js: 'text/javascript',
		ico: 'image/x-icon',
		json: 'application/json'
	};

	//LOCAL FUNCTIONS ====================================
	var helixConfigPath = process.env.helixConfigPath,
		config = require(helixConfigPath),
		adminPagesAccessData = config.getAdminPagesAccessData();

	var helixParms = config.getHelixParms();

	var sendTestInputPage = function(req, res, next) {
		//snyk worries about denial of service attacks. express-rate-limit was added to helixAjax.js for throttling.
		var pageIndex = escape(req.path.match(/(\w+).*$/)[1]);

		if (!self.pageList[pageIndex]) {
			res.status('404').send(new Buffer('req.path not found'));
			return;
		}

		(fileName = self.pageList[pageIndex].fileName),
			(fileDirectoryPath = self.pageList[pageIndex].fileDirectoryPath);

		adminPagesAccessData.instanceId = helixParms.instanceId;
		if (adminPagesAccessData.preventAutoTokenInjection) {
			adminPagesAccessData = {
				adminPagesInstructions:
					'adminPagesAccessData.preventAutoTokenInjection set to -> true. You must add your own userId and token to request date from hxConnector.'
			};
		} else if (
			adminPagesAccessData.injectIntoLocalhostOnly &&
			req.hostname != 'localhost'
		) {
			adminPagesAccessData = {
				adminPagesInstructions:
					'adminPagesAccessData.injectIntoLocalhostOnly (localhost, not 127.0.0.1) set to true. You must add your own userId and token to request date from hxConnector.'
			};
		} else if (adminPagesAccessData.injectIntoLocalhostOnly) {
			adminPagesAccessData.adminPagesInstructions =
				'adminPagesAccessData.injectIntoLocalhostOnly is -> true. You will not be able to use this page from outside computers.';
		} else {
			adminPagesAccessData.adminPagesInstructions =
				'Token and userID injected by staticPageDispatch. adminPagesAccessData.preventAutoTokenInjection and adminPagesAccessData.injectIntoLocalhostOnly are both set to -> false.';
		}

		var html = qtools.fs.readFileSync(
			fileDirectoryPath + '/' + fileName + '.html'
		); //snyk is wrong: fileDirectoryPath is result of a lookup using req.path as an index. req.path is not part of the resulting file path.
		
		html = qtools.templateReplace({
			template: html.toString(),
			replaceObject: adminPagesAccessData
		});

		res.set('Content-Type', 'text/html');
		res.status('200').send(new Buffer(html));

		//		res.status('200').sendFile(fileDirectoryPath + '/'+fileName + '.html');
	};

	var sendOtherFileType = function(req, res, next) {
		//snyk worries about denial of service attacks. express-rate-limit was added to helixAjax.js for throttling.
		var pageIndex = escape(req.path.match(/(\w+.\w+)$/)[1]);
		if (!self.pageList[pageIndex]) {
			res.status('404').send(new Buffer('req.path not found'));
			return;
		}

		(fileName = self.pageList[pageIndex].fileName),
			(fileDirectoryPath = self.pageList[pageIndex].fileDirectoryPath);

		const extension = path.extname(fileName).replace(/\./, '');

		var html = qtools.fs.readFileSync(fileDirectoryPath + '/' + fileName);
		//snyk is wrong: fileDirectoryPath is result of a lookup using req.path as an index. req.path is not part of the resulting file path.

		res.set('Content-Type', supportedMimeTypes[extension]);
		res.status('200').send(new Buffer(html));

		//		res.status('200').sendFile(fileDirectoryPath + '/'+fileName + '.html');
	};

	self.pageList = {};

	for (var i = 0, len = self.filePathList.length; i < len; i++) {
		var fileDirectoryPath = self.filePathList[i];

		fileDirectoryPath = fileDirectoryPath.replace(/.*\/\.js$/, '');
		var files = fs.readdirSync(fileDirectoryPath);

		self.suppressLogEndpointsAtStartup || qtools.logMilestone(`Web Pages:`);
		self.suppressLogEndpointsAtStartup && qtools.logMilestone(`Turn on web page list from staticPageDispatch.js by setting system.suppressLogEndpointsAtStartup=false in config`);

		for (var j = 0, len2 = files.length; j < len2; j++) {
			var element = files[j];
			if (element.match(/.html$/)) {
				var fileName = element.replace(/\.html$/, '');
				self.pageList[fileName] = {
					fileName: fileName,
					fileDirectoryPath: fileDirectoryPath
				};

				self.suppressLogEndpointsAtStartup || qtools.logMilestone(`\t/${fileName}`);

				self.router.get(new RegExp('/' + fileName+'$'), function(req, res, next) {
					sendTestInputPage(req, res, next);
					return;
				});
			}
			const extension = path.extname(element).replace(/\./, '');
			if (supportedMimeTypes[extension]) {
				var fileName = element;
				self.pageList[fileName] = {
					fileName: fileName,
					fileDirectoryPath: fileDirectoryPath
				};
				self.suppressLogEndpointsAtStartup || qtools.logMilestone(`\t/${fileName}`);

				self.router.get(new RegExp('/' + fileName), function(req, res, next) {
					sendOtherFileType(req, res, next);
					return;
				});
			}
		}
	}

	//METHODS AND PROPERTIES ====================================

	//INITIALIZATION ====================================

	return this;
};

//END OF moduleFunction() ============================================================

util.inherits(moduleFunction, events.EventEmitter);
module.exports = moduleFunction;

