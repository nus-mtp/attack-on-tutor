'use strict';

var models = require('./');

module.exports = function (sequelize, DataTypes) {

	var userTutorial = sequelize.define('userTutorial', {
		role: {
			type: DataTypes.ENUM,
			values: ['student', 'tutor'],
			allowNull: false
		},
		// tutorialId: {
		// 	type: DataTypes.UUID,
		// 	references: {
		// 		model: models.Tutorial,
		// 		key: 'id'
		// 	}
		// },
		// userId: {
		// 	type: DataTypes.STRING,
		// 	references: {
		// 		model: models.User,
		// 		key: 'id'
		// 	}
		// },
		exp: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	});

	return userTutorial;

}