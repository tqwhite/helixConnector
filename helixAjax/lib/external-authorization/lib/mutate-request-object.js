#!/usr/bin/env node
'use strict';
const qt = require('qtools-functional-library');
const moduleFunction = function(req, propertyName, value) {
	req.qtPutSurePath(propertyName, value);
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction