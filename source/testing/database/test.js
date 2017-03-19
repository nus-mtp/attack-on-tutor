var app = require('../../../app');

var sequelize = require('../../sequelize');
var Sequelize = require('sequelize');

var User = require('../../model/User');
var Tutorial = require('../../model/Tutorial');

var testModules = require('./test_modules.json');
var testStudents = require('./test_students.json');

var get = function(req, res, next) {

	var user = req.body.auth.decoded;

	if (app.get('test')) {
		console.log('Test mode is active.');
		makeTestModules();
		makeTestStudents();
		// TODO: Make the current user a tutor of TT1011 in a way thats NOT LIKE THIS, OMG.
		sequelize.query("INSERT INTO userTutorials VALUES ('tutor', 'test1', '"+user.id+"', current_timestamp(), current_timestamp())").then(
			function (data) {
				console.log(data);
			}
		);
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
	var modules = makeJSONArray(testModules);
	Tutorial.bulkCreate(modules, { ignoreDuplicates: true}).then(function (data) {
	});
}

/**
 * Populates db with 5 test students.
 * @return none
 */
var makeTestStudents = function () {
	var students = makeJSONArray(testStudents);students
	User.bulkCreate(students, { ignoreDuplicates: true}).then(function (data) {
	});
}

/**
 * Makes JSON into array
 * @param  JSON
 * @return JSON[]
 */
var makeJSONArray = function(items) {
	var itemArray = [];
	for (i = 0; i < Object.keys(items).length; i++) {
		itemArray.push(items[i]);
	}
	return itemArray;
}

module.exports.get = get
module.exports.makeTestModules = makeTestModules;