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
		Tutorial.forceSyncIVLE(user.id).catch(function (err) {
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
		Tutorial.findAndCountAllTutorials(user.id).then(function (data) {
			for (i = 0; i < data.rows.length; i++) {
				tuts.push(data.rows[i].dataValues);
			}
			res.json({success: true, message: 'Success', data: data});
		});

	} else {
		//res.send("Permission denied");
		
		var errorMessage = "Permission Denied (E2B)";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
	}
}

var syncUser = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		Tutorial.getUserInfo(user.id).then(function (data) {
			res.json({success: true, message: 'Success', data: data});
		});
	} else {
		//res.send("Permission denied");
		
		var errorMessage = "Permission Denied (E2C)";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
	}
}

var getUserInfo = function (req, res, next) {
	if (req.body.auth.success) {
		var user = req.body.auth.decoded;
		Tutorial.getUserTutorials(user.id).then(function (result) {
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
	returnObject.tutorials = setLevelInfo(tutArray);
	return returnObject;
}

var getTopUsers = function (req, res, next) {
	var tid = req.body.tid;
	Tutorial.findAndCountAllUsersInTutorial(tid).then(function (result) {
		var result = processTopUsers(result);
		res.json({success: true, message: 'Success', data: result});
	});
}

var processTopUsers = function (data) {
	var userArray = [];
	for (i = 0; i < data.rows.length; i++) {
		var user = data.rows[i];
		if (user.dataValues.tutorials[0].userTutorial.role == "student") {
			var exp = user.dataValues.tutorials[0].userTutorial.exp;
			userArray.push({
				name: user.dataValues.name,
				exp: exp,
				level: calculateLevel(exp)
			});
		}
	}
	userArray.sort(sort_by('exp', true, parseInt));
	return userArray;
}

/**
 * Calculates level-related user info
 * @param  user
 * @return user
 */
var setLevelInfo = function(tutArray) {
    var constant = 0.1;
    for (i = 0; i < tutArray.length; i++) {
        var tutObj = tutArray[i];
        var exp = tutObj.exp;
        tutObj.level = calculateLevel(exp);
        tutObj.currExp = exp - calculateExp(tutObj.level - 1);
        tutObj.totalToNext = calculateExp(tutObj.level + 1); - calculateExp(tutObj.level);
        tutObj.percentage = Math.floor(tutObj.currExp/tutObj.totalToNext * 100);
    }
    return tutArray;
}

var constant = 0.1;

/**
 * Calculates level based on exp
 * @param  {Integer} exp 
 * @return {Integer} level
 */
var calculateLevel = function (exp) {
    // Level = Constant * Sqrt(EXP)
    return Math.floor(constant * Math.sqrt(exp)) + 1;
}

/**
 * Calculates total exp needed to reach this level
 * @param  {Integer} level 
 * @return {Integer}       
 */
var calculateExp = function (level) {
    return Math.floor(Math.pow(level/constant, 2));
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
module.exports.syncUser = syncUser;
module.exports.getUserInfo = getUserInfo;
module.exports.getTopUsers = getTopUsers;