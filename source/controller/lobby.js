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

	    var userId = user.id;
	    var moduleId = req.params.moduleId;
	    var tutorialId = req.params.tutorialId;
	    
	    res.render ('lobby/lobby', {
	        title: 'Lobby UI',
	        userId: userId,
	        moduleId: moduleId,
	        tutorialId: tutorialId
	    });

	} else {
		console.log('fail');
		res.send('Auth unsuccessful.')
	}
};

/**
 * Checks if user is allowed to enter lobby.
 * @param  req
 * @param  res
 * @param  next
 */
var enterLobby = function (req, res, next) {

	var user = req.body.auth.decoded;
	var userId = user.id;


	console.log(req.body);

	var courseId = req.body.courseid;
	var tutorialId = req.body.id;
	var moduleId = req.body.coursecode;
	var tutorialName = req.body.name; // TODO: fix naming in lobby.ejs to match database. 
	// Checks if user is in user list
	Tutorial.checkIfInTutorialUserList(userId, tutorialId).then(function (data) {
		if (data !== null) {
			res.json({ success: true })
			res.render ('lobby/lobby', {
				title: 'Lobby UI',
				userId: userId,
				courseId: courseId,
				tutId: tutorialId,
				moduleId: moduleId,
				tutorialId: tutorialName
			});
		} else {
			res.json({ success: false, message: 'Permission denied.'});
		}
	});
}

/**
 * Middleware if user is allowed to enter lobby.
 * @param  req
 * @param  res
 * @param  next
 */
var canEnterLobby = function (req, res, next) {

	var user = req.body.auth.decoded;
	var userId = user.id;

	console.log(req.params);
	
	var tut = req.body.tutorial;
	var courseId = tut.courseid;
	var tutorialId = tut.id;
	var moduleId = tut.coursecode;
	var tutorialName = tut.name; // TODO: fix naming in lobby.ejs to match database. 

	// Checks if user is in user list
	Tutorial.checkIfInTutorialUserList(userId, tutorialId).then(function (data) {
		if (data !== null) {
			res.render ('lobby/lobby', {
				title: 'Lobby UI',
				userId: userId,
				courseId: courseId,
				tutId: tutorialId,
				moduleId: moduleId,
				tutorialId: tutorialName
			});
		} else {
			res.json({ success: false, message: 'Permission denied.'});
		}
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
var getUsersInTutorial = function (res, req, next) {

	var tid = res.params.tutorialId;
	var users = {}
	var tutorId = '';
	Tutorial.findTutorialTutorID(tid).then(function (data) {
		tutorId = data.dataValues.userId;
		Tutorial.findAndCountAllUsersInTutorial(tid).then(function (data) {
			for (i = 0; i < data.rows.length; i++) {
				var user = data.rows[i].dataValues;
				var role = (user.id != tutorId) ? 'student' : 'tutor';
				var userObj = {
					username: user.name,
					userType: role
				}
				users[user.id] = userObj;
			}
			res.json({success: true, users: users});
		});
	});

}

getUsersInTutorial('test1');

module.exports.get = get;
module.exports.enterLobby = enterLobby;
module.exports.canEnterLobby = canEnterLobby;