var app = require('../../../app');

var sequelize = require('../../sequelize');
var Sequelize = require('sequelize');

var User = require('../../model/User');
var Tutorial = require('../../model/Tutorial');

var testModules = require('./test_modules.json');


/**
 * Populates db with 5 test modules.
 * @return none
 */
var makeTestModules = function () {

	var modules = makeTestModArray(testModules);
	Tutorial.bulkCreate(modules, { ignoreDuplicates: true}).then(function (data) {
		console.log(data);
	});

}

/**
 * Puts test modules into array
 * @param  JSON
 * @return JSON[]
 */
var makeTestModArray = function(mods) {
	var modules = [];
	for (i = 0; i < Object.keys(mods).length; i++) {
		modules.push(mods[i]);
	}
	return modules;
}

if (app.get('test')) {
	console.log('Test mode is active.');
} else {
	console.log('Test mode is inactive.');
}

module.exports.makeTestModules = makeTestModules;