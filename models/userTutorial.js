'use strict';

module.exports = function (sequelize, DataTypes) {

	var userTutorial = sequelize.define('userTutorial', {
		role: {
			type: DataTypes.ENUM,
			values: ['student', 'tutor'],
			allowNull: false
		},
		tutorialId: {
			type: DataTypes.UUID,
			references: {
				model: 'tutorial',
				key: 'id'
			}
		},
		userId: {
			type: DataTypes.STRING,
			references: {
				model: 'user',
				key: 'id'
			}
		},
		exp: {
			type: DataTypes.INTEGER
		}
	});

	return userTutorial;

}