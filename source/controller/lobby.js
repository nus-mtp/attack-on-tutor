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


var enterLobby = function (req, res, next) {

	var user = req.body.auth.decoded;

	var userId = user.id;
	var moduleId = 'CS3247';
	var tutorialId = '4';

	res.json({success: true});

	// res.render ('lobby/lobby', {
	// 	title: 'Lobby UI',
	// 	userId: userId,
	// 	moduleId: moduleId,
	// 	tutorialId: tutorialId
	// });
}

/**
 * Check if user belongs to tutorial class.
 * 
 * @param  uid
 * @param  tid
 * @return boolean
 */
var userBelongsToTutorialClass = function (uid, tid) {

	Tutorial.checkIfInTutorialUserList(uid, tid).then(function (data) {
		return data == null ? false : true;
	});

}

/**
 * Check if user is a tutor of class.
 * 
 * @param  uid
 * @param  tid
 * @return boolean
 */
userIsTutorOfClass = function (uid, tid) {

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