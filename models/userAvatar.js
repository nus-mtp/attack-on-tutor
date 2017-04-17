"use strict";

var models = require('./');

module.exports = function (sequelize, DataTypes) {

	var userAvatar = sequelize.define('userAvatar', {
		userId: {
			type: DataTypes.STRING,
			references: {
				model: models.User,
				key: 'id'
			}
		},
		avatarId: {
			type: DataTypes.STRING,
			references: {
				model: models.Avatar,
				key: 'id'
			}
		}
	});

	return userAvatar;

}