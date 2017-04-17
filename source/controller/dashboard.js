var express = require('express');
var auth = require('../auth');
var rest = require('rest');
var app = require('../../app');
var level = require('./level');
var db = require('./db');

var tutorial = require('../model/Tutorial');

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
 			}
 		});
	} else {
		//res.send('Auth unsuccessful');
		
		var errorMessage = "Unsuccessful Authentication (E1B)";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
	}

}


var forceSyncIVLE = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		tutorial.forceSyncIVLE(user.id).catch(function (err) {
			res.json({success: false, message: err});
		}).then(function() {
			res.json({success: true, result: 'Synchronization Complete'});
		}); 
	} else {
		//res.send("Permission denied");
		
		var errorMessage = "Permission Denied (E2)";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
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
		tutorial.findAndCountAllTutorials(user.id).then(function (data) {
			for (i = 0; i < data.rows.length; i++) {
				tuts.push(data.rows[i].dataValues);
			}
			res.json({success: true, message: 'Success', data: data});
		});
	} else {
		var errorMessage = "Permission Denied (E2B)";
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
	}
}

var getUserInfo = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		db.getUserInfo(user.id).then(function (result) {
			userTuts = processUserInfo(result);
			res.json({success: true, message: 'Success', data: userTuts});
		});
	} else {
		//res.send("Permission denied");
		var errorMessage = "Permission Denied (E2D)";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
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
	console.log(user.Avatars);
	returnObject.imgSrc = "images/avatars/" + user.avatarId + ".png";
	var tuts = user.Tutorials;
	var tutArray = [];
	for (i = 0; i < tuts.length; i++) {
		var tut = tuts[i];
		if (tut.userTutorial.role == "student") {
			tutArray.push ({
				coursecode: tut.coursecode,
				coursename: tut.coursename,
				exp: tut.userTutorial.exp,
				level: level.calculateLevel(tut.userTutorial.exp)
			});
		}
	}
	var totalLevels = 0;
	for (i = 0; i < tutArray.length; i++) {
		totalLevels += tutArray[i].level;
	}
	returnObject.totalLevels = totalLevels - user.levelsSpent;
	returnObject.tutorials = level.setLevelInfo(tutArray);
	return returnObject;
}

/**
 * Get top users in tutorial for leaderboard
 * @param  req
 * @param  res
 * @param  next
 * @return JSON
 */
var getTopUsers = function (req, res, next) {
	var tid = req.body.tid;
	db.findAndCountAllUsersInTutorial(tid).then(function (result) {
		var result = processTopUsers(result);
		res.json({success: true, message: 'Success', data: result});
	});
}

/**
 * Process JSON for UI usage
 * @param  JSON  data
 * @return JSON     
 */
var processTopUsers = function (data) {
	var userArray = [];
	for (i = 0; i < data.rows.length; i++) {
		var user = data.rows[i];
		if (user.dataValues.Tutorials[0].userTutorial.role == "student") {
			var exp = user.dataValues.Tutorials[0].userTutorial.exp;
			userArray.push({
				name: user.dataValues.name,
				exp: exp,
				level: level.calculateLevel(exp)
			});
		}
	}
	userArray.sort(sort_by('exp', true, parseInt));
	console.log(userArray);
	return userArray;
}

/**
 * JSON object sorting function
 */
var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}

module.exports.get = get;
module.exports.forceSyncIVLE = forceSyncIVLE;
module.exports.getTutorials = getTutorials;
module.exports.getUserInfo = getUserInfo;
module.exports.getTopUsers = getTopUsers;