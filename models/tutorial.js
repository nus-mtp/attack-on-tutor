"use strict";

module.exports = function (sequelize, DataTypes) {
	var Tutorial = sequelize.define ('Tutorial', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			unique: true,
			primaryKey: true
		},
		grouptype: {
			type: DataTypes.STRING,
		},
		name: {
			type: DataTypes.STRING,
		},
		courseid: {
			type: DataTypes.STRING,
		},
		coursecode: {
			type: DataTypes.STRING
		},
		coursename: {
			type: DataTypes.STRING
		},
		week: {
			type: DataTypes.STRING
		},
		day: {
			type: DataTypes.STRING
		},
		time: {
			type: DataTypes.STRING
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
	}, {
		classMethods: {
			associate: function (models) {
				Tutorial.belongsToMany(models.User, {
					foreignKey: 'tutorialId',
					through: 'userTutorial'
				});
			}
		}
	});

	return Tutorial;
}