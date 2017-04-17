
var sequelize = require ('../sequelize');
var Sequelize = require ('sequelize');

var models = require('../../models');
var user = models.User;

// var user = sequelize.define('user', {
// 	id: {
// 		type: Sequelize.STRING,
// 		unique: true,
// 		primaryKey: true,
// 		validate: {
// 			notEmpty: true,
// 			isUnique: function(value, next) {
// 				user.find({
// 					where: {
// 						id: value
// 					}
// 				}).then(function (user) {
// 					if (user) {
// 						return next ('User already exists!');
// 					}
// 					return next ();
// 				}).catch(function (err) {
// 					return next (err);
// 				});
// 			}
// 		}
// 	},
// 	name: { type: Sequelize.STRING },
// 	email: { type: Sequelize.STRING },
// 	gender: { type: Sequelize.ENUM('Male', 'Female') },
// 	token: { type: Sequelize.STRING(511) },
// 	avatarId: { type: Sequelize.STRING },
// 	levelsSpent: { type: Sequelize.INTEGER }

// }, {
// 	instanceMethods: {
// 		toJSON: function () {
// 			var values = this.get();
// 			delete values.token;
// 			return values;
// 		}
// 	}
// });

/**
 * Set avatar
 * @param  uid
 * @param  newAvatarId 
 * @return {Promise}
 */
var setAvatar = function(uid, newAvatarId) {
	return user.findOne({
		where: {
			id: uid
		}
	}).then(function (result) {
		return result.update({
			avatarId: newAvatarId
		});
	});
}


/**
 * Get avatar id
 * @param  uid
 * @return {Promise}
 */
var getAvatarId = function (uid) {
	return user.findOne({
		where: {
			id: uid
		},
		attributes: ['avatarId']
	});
}

module.exports = user;
module.exports.setAvatar = setAvatar;
module.exports.getAvatarId = getAvatarId;