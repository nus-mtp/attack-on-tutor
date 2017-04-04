var express = require('express');
var auth = require('../auth');
var rest = require('rest');
var app = require('../../app');
var User = require('../model/User');
var Tutorial = require('../model/Tutorial');

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

/**
 * Gets all tutorials of current user.
 * @param uid
 * @returns JSON
 */
var getTutorials = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		var tuts = [];
		Tutorial.findAndCountAllTutorials(user.id).then(function (data) {
			for (i = 0; i < data.rows.length; i++) {
				tuts.push(data.rows[i].dataValues);
			}
			res.json({success: true, message: 'Success', data: data});
		});

	} else {
		res.send("Permission denied");
	}
}

var syncUser = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		Tutorial.getUserInfo(user.id).then(function (data) {
			res.json({success: true, message: 'Success', data: data});
		});
	} else {
		res.send("Permission denied");
	}
}

var getUserInfo = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		Tutorial.getUserTutorials(user.id).then(function (result) {
			userTuts = processUserInfo(result);
			console.log(userTuts);
			res.json({success: true, message: 'Success', data: userTuts});
		});
	} else {
		res.send("Permission denied");
	}
}

/**
 * Processes the user info object for use in UI
 * @param  result
 * @return JSON
 */
var processUserInfo = function (result) {
	var user = result.rows[0].dataValues;
	var returnObject = {}
	returnObject.name = user.name;
	returnObject.avatarId = user.avatarId;
	returnObject.imgSrc = "images/avatars/" + user.avatarId + ".png";
	var tuts = user.tutorials;
	var tutArray = [];
	for (i = 0; i < tuts.length; i++) {
		var tut = tuts[i];
		if (tut.userTutorial.role == "student") {
			tutArray.push ({
				coursecode: tut.coursecode,
				coursename: tut.coursename,
				exp: tut.userTutorial.exp
			});
		}
	}
	console.log(tutArray);
	returnObject.tutorials = tutArray;
	return returnObject;
}


module.exports.get = get;
module.exports.forceSyncIVLE = forceSyncIVLE;
module.exports.getTutorials = getTutorials;
module.exports.syncUser = syncUser;
module.exports.getUserInfo = getUserInfo;