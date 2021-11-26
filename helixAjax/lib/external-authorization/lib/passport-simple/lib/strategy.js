
//Note: this is based on the module passport-local and follows 
//that module's idea of the correct interface to passport.
//I have not verified if that is true, only that it works as modified.
//tqii, 11/1/21

const qt = require('qtools-functional-library');
const passport = require('passport-strategy');

function Strategy(options, verify) {
	if (typeof options == 'function') {
		verify = options;
		options = {};
	}
	if (!verify) {
		throw new TypeError('LocalStrategy requires a verify callback');
	}

	this._usernameField = options.usernameField || 'username';
	this._passwordField = options.passwordField || 'password';

	passport.Strategy.call(this);
	this.name = 'simple';
	this._verify = verify;
	this._passReqToCallback = options.passReqToCallback;
}  

 Strategy.prototype.authenticate = function(req, options) {
	options = options || {};

	let username = req.body.qtGetSurePath(this._usernameField);
	username = username ? username : req.query.qtGetSurePath(this._usernameField);
	username = username ? username : req.qtGetSurePath(this._usernameField);

	let password = req.body.qtGetSurePath(this._passwordField);
	password = password ? password : req.query.qtGetSurePath(this._passwordField);
	password = password ? password : req.qtGetSurePath(this._passwordField);

	if (!username || !password) {
		return this.error(
			{ message: options.badRequestMessage || 'Missing credentials' },
			400
		);
	}

	var self = this;

	function verified(err, user, info) {
		if (err) {
			return self.error(err);
		}
		if (!user) {
			return self.fail(info);
		}
		self.success(user, info);
	}

	try {
		if (self._passReqToCallback) {
			this._verify(req, username, password, verified);
		} else {
			this._verify(username, password, verified);
		}
	} catch (ex) {
		return self.error(ex);
	}
};

module.exports = Strategy;
