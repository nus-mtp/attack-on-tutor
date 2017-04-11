var express = require('express');
var Tutorial = require('../model/Tutorial');
var lobby = require('../model/lobby');
var app = require('../../app');

/**
 * Render lobby session page
 * return HTML
 * @param req
 * @param res
 * @param next
 */
 
var get = function (req, res, next)
{

	if (req.body.auth.success) {

		var user = req.body.auth.decoded;
		console.log(req.body);
	    var userId = user.id;
	    var moduleId = req.params.moduleId;
	    var tutorialId = req.params.tutorialId;
	    var tid = req.body.tut.id;
	    
	    res.render ('lobby/lobby', {
	        title: 'Lobby UI',
	        userId: userId,
	        moduleId: moduleId,
	        tutorialId: tutorialId,
	        tid: tid,
	        userRole: req.body.userRole,
	        username: user.name
	    });

	} else {
		//console.log('fail');
		//res.send('Auth unsuccessful 2.');
		var errorMessage = "Unsuccessful Authentication (E1C)";
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
	}
};

/**
 * Middleware to check if user is allowed to enter lobby.
 * @param  req
 * @param  res
 * @param  next
 */
var enterLobby = function (req, res, next) {

	var user = req.body.auth.decoded;
	var userId = user.id;
	var coursecode = req.params.moduleId;
	var tutorialName = req.params.tutorialId;
	//var tutorialId = req.body['tut-id'];

	Tutorial.getTutorialByCoursecodeAndName(coursecode, tutorialName).then(function (result) {
		var tutId = result.dataValues.id;
		Tutorial.checkIfInTutorialUserList(userId, tutId).then(function (data) {
			if (data !== null) {
				Tutorial.findTutorialTutorID(tutId).then( 						// Get tutor ID
					function (data) {
						console.log(data == null);
						if (data != null) {
							var tutorId = data.dataValues.userId;
							var userRole = (tutorId == userId) ? 'tutor' : 'student'; 	// Check if user is tutor
							Tutorial.findTutorialInfo(tutId).then( 				// Get tutorial info
								function(data) {
									var tut = data[0].dataValues;
									req.body.tut = tut;
									req.body.userRole = userRole;
									return next();
								});
						} else {
							var errorMessage = "The tutor of this tutorial class has not registered with the system.";
							res.render('error.ejs', {
								success: false,
								errorMessage: errorMessage
							});
						}	
					}); 
			} else {
				var errorMessage = "You are not a member of this tutorial.";
				res.render('error.ejs', {
					errorMessage: errorMessage
				});
			}
		});
	});

}

/**
 * Check if user is a tutor of class.
 * @param  uid
 * @param  tid
 
 * @return boolean
 */
var userIsTutorOfClass = function (uid, tid) {
	Tutorial.findTutorialTutorID(tid).then(function (data) {
		if (data !== null) {
			return uid == data.dataValues.userId;
		} else {
			return false;
		}
	});
}

/**
 * Gets users in tutorial
 * @param  res
 * @oaram  req
 * @param  next
 */
var getUsersInTutorial = function (req, res, next) {
	var tid = req.body.tutorialId;
	var users = {}
	var tutorId = '';
	Tutorial.findAndCountAllUsersInTutorial(tid).then(function (data) {
		var returnObj = processLobbyUsers(data);
		res.json({ success: true, data: returnObj });
	});
}

/**
 * Processes db query for use in lobby
 * @return {JSON} processed data
 */
var processLobbyUsers = function (data) {
	var returnObj = {};
	var students = [];
	for (i = 0; i < data.rows.length; i++) {
		var studentObj = {};
		var student = data.rows[i].dataValues;
		var userTut = student.tutorials[0].userTutorial.dataValues;
		if (userTut.role != 'student') {
			returnObj.tutor = student;
		} else {
			studentObj.name = student.name;
			studentObj.id = student.id;
			studentObj.avatarId = student.avatarId;
			studentObj.exp = userTut.exp;
			students.push(studentObj);
		}
	}
	returnObj.students = students;
	return returnObj;
}

module.exports.get = get;
module.exports.enterLobby = enterLobby;
module.exports.getUsersInTutorial = getUsersInTutorial;