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
 
 var errorMessage = "";
 
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
		//res.render('\error', {title: '404: File Not Found'});
		//res.redirect('/error');
		
		//errorMessage = "Failure to Authenticate";
		/*var drinks = [
			{ name: 'Bloody Mary', drunkness: 3 },
			{ name: 'Martini', drunkness: 5 },
			{ name: 'Scotch', drunkness: 10 }
		];
		var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";*/

		/*res.render('error.ejs', {
			errorMessage: errorMessage
			//drinks: drinks,
			//tagline: tagline
		});*/
		
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
		
		/*errorMessage = "Permission denied.";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});*/
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
		
		/*errorMessage = "Permission denied.";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});*/
	}
}

var syncUser = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		User.getExpAndAvatar(user.id).then(function (data) {
			res.json({success: true, message: 'Success', data: data});
		});
	} else {
		res.send("Permission denied");
		
		/*errorMessage = "Permission denied.";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});*/
	}
}

module.exports.get = get;
module.exports.forceSyncIVLE = forceSyncIVLE;
module.exports.getTutorials = getTutorials;
module.exports.syncUser = syncUser;