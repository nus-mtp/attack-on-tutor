"use strict";

module.exports = function (sequelize, DataTypes) {

	var userAvatar = sequelize.define('userAvatar', {
		userId: {
			type: DataTypes.STRING,
			references: {
				model: 'user',
				key: 'id'
			}
		},
		avatarId: {
			type: DataTypes.STRING,
			references: {
				model: 'avatar',
				key: 'id'
			}
		}
	});

	return userAvatar;

}