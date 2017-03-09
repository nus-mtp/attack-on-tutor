/**
 * @module models/Tutorial
 * @type {Sequelize|*|exports|module.exports}
 */

var sequelize = require ('../sequelize');
var Sequelize = require ('sequelize');
var User = require ('./User');
var rest = require ('rest');
var app = require ('../../app');
//var Room = require('./Room');

/**
 * Define tutorial model
 * @type {Model}
 */
var tutorial = sequelize.define ('tutorial', {
	id: {
		type: Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4,
		unique: true,
		primaryKey: true
	},
	grouptype: {
		type: Sequelize.STRING,
	},
	name: {
		type: Sequelize.STRING,
	},
	courseid: {
		type: Sequelize.STRING,
	},
	coursecode: {
		type: Sequelize.STRING
	},
	coursename: {
		type: Sequelize.STRING
	},
	week: {
		type: Sequelize.STRING
	},
	day: {
		type: Sequelize.STRING
	},
	time: {
		type: Sequelize.STRING
	}
}, {
	indexes: [
		{
			name: 'name',
			fields: ['name']
		},
		{
			name: 'courseid',
			fields: ['courseid']
		}
	]
});

/**
 * Define user tutorial relation model
 * @type {Model}
 */
var userTutorial = sequelize.define ('userTutorial', {
	role: {
		type: Sequelize.ENUM,
		values: ['student', 'tutor'],
		allowNull: false
	},
	tutorialId: {
		type: Sequelize.UUID,
		references: {
			model: tutorial,
			key: 'id'
		}
	},
	userId: {
		type: Sequelize.STRING,
		references: {
			model: User,
			key: 'id'
		}
	}
}, {
	indexes: [
		{
			name: 'tutorialId',
			fields: ['tutorialId']
		},
		{
			name: 'userId',
			fields: ['userId']
		}
	]
});


User.belongsToMany (tutorial, {
	foreignKey: 'userId',
	through: 'userTutorial',
});

tutorial.belongsToMany (User, {
	foreignKey: 'tutorialId',
	through: 'userTutorial',
});

sequelize.sync ();

/**
 * Private function, fetch IVLE user modules, return promise
 * @param token
 * @returns {Promise}
 */
var fetchIVLEUserModules = function (token) {
	return rest ('https://ivle.nus.edu.sg/api/Lapi.svc/Modules?APIKey=' + app.get ('api-key') + '&AuthToken=' + token + '&Duration=0&IncludeAllInfo=false');
}

/**
 * Private function, fetch IVLE tutorial groups, return promise
 * @param token
 * @param course
 * @returns {Promise}
 *
var fetchIVLETutorialGroups = function (token, course) {
	return rest ('https://ivle.nus.edu.sg/API/Lapi.svc/GroupsByUserAndModule?APIKey=' + app.get ('api-key') + '&AuthToken=' + token + '&CourseID=' + course['ID'] + '&AcadYear=' + course['AcadYear'] + '&Semester=' + course['semester']).then (function (response) {
		return {tutorialGroup: JSON.parse (response.entity).Results, course: course};
	});
}
*/
