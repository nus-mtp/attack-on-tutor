var app = require('../../../app');

var sequelize = require('../../sequelize');
var Sequelize = require('sequelize');

var models = require('../../../models');
var User = models.User;
var Tutorial = models.Tutorial;
var userTutorial = models.userTutorial;

var testModules = require('./test_modules.json');
var testStudents = require('./test_students.json');

var get = function(req, res, next) {

	var user = req.body.auth.decoded;

	if (app.get('test')) {
		console.log('Test mode is active.');
		makeTestModules();
		makeTestStudents();
		res.send('Database populated.');
	} else {
		console.log('Test mode is inactive.');
		res.send('Test mode is inactive.');
	}

}


/**
 * Populates db with 5 test modules.
 * @return none
 */
var makeTestModules = function () {
	var modules = testModules.modules;
	Tutorial.bulkCreate(modules, { ignoreDuplicates: true}).then(function (data) {
	});
}

/**
 * Populates db with 5 test students.
 * @return none
 */
var makeTestStudents = function () {
	var students = testStudents.students;
	User.bulkCreate(students, { ignoreDuplicates: true}).then(function (data) {
		for (var i in data) {
			data[i].addAvatar('avatar-01');
			data[i].addTutorial('general-chat', { role: 'tutor', exp: 0});
			i == 0 ? data[i].addTutorial('test1', { role: 'tutor', exp: 0}) : data[i].addTutorial('test1', { role: 'student', exp: 0});
		}
	});
}


module.exports.get = get
module.exports.makeTestModules = makeTestModules;