var models = require('../../models');
var User = models.User;
var Tutorial = models.Tutorial;
var Avatar = models.Avatar;


/**
 * Find and count all users in some tutorial
 * @param tid
 * @returns {Promise}
 */
var findAndCountAllUsersInTutorial = function(tid){
	return User.findAndCountAll({
		include:[{
			model: Tutorial,
			where: {id: tid}
		}],
		attributes:['id','name', 'avatarId']
	});
};


/**
 * Gets tutorials user is a part of 
 * @param  uid
 * @return Promise
 */
var getUserTutorials = function (uid) {
	return User.findAndCountAll({
		where: {
			id: uid
		},
		include: [{
			model: Tutorial
		}]
	});
}


module.exports.findAndCountAllUsersInTutorial =  findAndCountAllUsersInTutorial;
module.exports.getUserTutorials = getUserTutorials;