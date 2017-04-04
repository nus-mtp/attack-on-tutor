
var sequelize = require ('../sequelize');
var Sequelize = require ('sequelize');

var user = sequelize.define('user', {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		validate: {
			notEmpty: true,
			isUnique: function(value, next) {
				user.find({
					where: {
						id: value
					}
				}).then(function (user) {
					if (user) {
						return next ('User already exists!');
					}
					return next ();
				}).catch(function (err) {
					return next (err);
				});
			}
		}
	},
	name: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	gender: {
		type: Sequelize.ENUM('Male', 'Female')
	},
	token: {
		type: Sequelize.STRING(511)
	},
	avatarId: {
		type: Sequelize.STRING
	}

}, {
	instanceMethods: {
		toJSON: function () {
			var values = this.get();
			delete values.token;
			return values;
		}
	}
});

sequelize.sync({});

/**
 * Change user EXP
 * @param  uid
 * @param {int} amount [Amount of points to increase/decrease by]
 * @return {Promise}
 */
var changeExp = function (uid, amount) {
	return user.findOne({
		where: {
			id: uid
		}
	}).then(function (result) {
		return result.increment(['exp'], { by: amount });
	});
}

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
	})

}



module.exports = user;
module.exports.changeExp = changeExp;
module.exports.setAvatar = setAvatar;
module.exports.getAvatarId = getAvatarId;