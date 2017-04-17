"use strict";

var models = require('./');

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
		classMethods: {
			associate: function (models) {
				Tutorial.belongsToMany(models.User, {
					through: 'userTutorial'
				});
			}
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

	return Tutorial;
}