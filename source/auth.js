var fs = require ('fs');
var express = require ('express');
var app = require ('../app');
var user = require ('./models/User.js');
var jwt = require ('jsonwebtoken');

// Basic JSON web token verification

var verify = function (token, callback) {
	jwt.verify(token, app.get('jwt-secret'), function (err, decoded) {
		callback (err, decoded);
	})
}

// ensureAuth is a middleware that ensures the JSON web token has been verified.

var ensureAuth = function (req, res, next) {

	// Get token from body or query or headers
	var token = req.body.token || req.query.token || req.headers['token'] || req.cookies.token;
	if (token) {
		return jwt.verify (token, app.get('jwt-secret'), function (err, decoded) {
			if (err) {
				req.body.auth = {
					success: false,
					message: 'Invalid'
				};
				return next();
			} else {
				req.body.auth = {
					success: true,
					decoded: decoded
				};
				return next();
			}
		});
	} else {
		req.body.auth = {
			success: false,
			message: 'Null'
		};
		return next();
	}

}


module.exports.verify = verify;
module.exports.ensureAuth = ensureAuth;