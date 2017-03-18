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

	console.log(req.body);

	var userId = user.id;
	var moduleId = req.body.courseId;
	var tutorialId = req.body.tutorialId;

	// Checks if user is in user list
	Tutorial.checkIfInTutorialUserList(userId, tutorialId).then(function (data) {
		if (data !== null) {
			res.render ('lobby/lobby', {
				title: 'Lobby UI',
				userId: userId,
				moduleId: moduleId,
				tutorialId: tutorialId
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

module.exports.get = get;
module.exports.enterLobby = enterLobby;