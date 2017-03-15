var express = require('express');
var auth = require('../auth');
var rest = require('rest');
var app = require('../../app');
var User = require('../models/User');
var Tutorial = require('../models/Tutorial');

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

 	if (req.body.auth.success) {
 		console.log(req.body.auth.decoded);
 		res.render('dashboard', {
 			user: req.body.auth.decoded,
 			ip: app.get('server-ip'),
 			port: app.get('server-port'),
 			urls: {
 				getModules: protocol + '://' + app.get('server-ip')+ ':' + app.get('server-port') + '/api/dashboard/getModules'
 			// 	refreshTutorials: protocol + '://' + app.get('server-ip') + ':' + app.get('server-port') + '/api/dashboard/getAllUserTutorialSessions'
 			// 	//createSessions: protocol + '://' + app.get('server-ip') + ':' + app.get('server-port') + '/api/tutorial/createroom',
 			// 	//endSessions: protocol + '://' + app.get('server-ip') + ':' + app.get('server-port') + '/api/tutorial/deactivateroom'
 			}
 		});
	} else {
		res.send('Auth unsuccessful');
	}

}


var forceSyncIVLE = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		Tutorial.forceSyncIVLE(user.id).catch(function (err) {
			res.json({success: false, message: err});
		}).then(function() {
			res.json({success: true, result: 'Synchronization Complete'});
		}); 
	} else {
		res.send("Permission denied");
	}
}

// Query methods

// Returns JSON object containing users tutorial sessions and roles
var getTutorials = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		console.log(user.id);
		Tutorial.getTutorialsession(user.id).catch(function (err) {
			res.json({success: false, message: err});
		}).then(function (data) {
			res.json({success: true, result: 'Found tutorials'});
			console.log(data[0].dataValues);
		});
	} else {
		res.send("Permission denied");
	}
}


module.exports.get = get;
module.exports.forceSyncIVLE = forceSyncIVLE;
module.exports.getTutorials = getTutorials;