
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
	},
	exp: {
		type: Sequelize.INTEGER
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
	user.findOne({
		where: {
			id: uid
		}
	}).then(function (result) {

		result.increment(['exp'], { by: amount }).then(function (result) {
			console.log(result);
		});
	});
}

/**
 * Set avatar
 * @param  uid
 * @param  avatarId 
 * @return {Promise}
 */
var setAvatar = function(uid, avatarId) {
}
module.exports = user;
module.exports.changeExp = changeExp;
module.exports.setAvatar = setAvatar;