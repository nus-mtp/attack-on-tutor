var express = require('express');
var auth = require('../auth');
var rest = require('rest');
var app = require('../../app');
var User = require('../models/User');

var protocol = 'https';
var usehttps = app.get('use-https');
if (!usehttps) {
	protocol = 'http';
}


/**
 * Render dashboard page
 * returns HTML
 * @param req
 * @param res
 * @param next
 */
var get = function (req, res, next) {
	console.log(req.body);
	if (req.body.auth.success) {
		res.render('dashboard', {
			user: req.body.auth.decoded,
			ip: app.get('server-ip'),
			port: app.get('server-port'),
			urls: {
				// refreshTutorials: protocol + '://' + app.get('server-ip') + ':' + app.get('server-port') + '/api/dashboard/getAllUserTutorialSessions',
				// createSessions: protocol + '://' + app.get('server-ip') + ':' + app.get('server-port') + '/api/tutorial/createroom',
				// endSessions: protocol + '://' + app.get('server-ip') + ':' + app.get('server-port') + '/api/tutorial/deactivateroom'
			}
		});
	} else {
		console.log("auth unsuccessful")
	}

}

module.exports.get = get;
