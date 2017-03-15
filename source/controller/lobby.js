var express = require('express');
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
    var userId = req.params.userId;
    var moduleId = req.params.moduleId;
    var tutorialId = req.params.tutorialId;
    
    res.render ('lobby/lobby', {
        title: 'Lobby UI',
        userId: userId,
        moduleId: moduleId,
        tutorialId: tutorialId
    });
};

module.exports.get = get;