var models = require('../../models');
var User = models.User;
var Tutorial = models.Tutorial;
var Avatar = models.Avatar;


/**
 * Change user EXP
 * @param  uid
 * @param {int} amount [Amount of points to increase/decrease by]
 * @return {Promise}
 */
var changeExp = function (uid, tid, amount) {
	return userTutorial.findOne({
		where: {
			userId: uid,
			tutorialId: tid
		}
	}).then(function (result) {
		return result.increment(['exp'], { by: amount });
	});
}


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
 * Gets user info along with tutorials and avatars
 * @param  uid
 * @return Promise
 */
var getUserInfo = function (uid) {
	return User.findAndCountAll({
		where: {
			id: uid
		},
		include: [
			{ model: Tutorial },
			{ model: Avatar }
		]
	});
}

/**
 * Gets tutorial by coursecode and name
 * @param  {String} coursecode 
 * @param  {String} name    
 * @return Promise   
 */
var getTutorialByCoursecodeAndName = function (coursecode, name) {
	return tutorial.findOne({
		attributes: ['id'],
		where: {
			coursecode: coursecode,
			name: name
		}
	});
}

/**
 * Check if user is in tutorial
 * @param uid
 * @param tid
 * @returns {Promise}
 */
var checkIfInTutorialUserList = function (uid, tid) {
	return userTutorial.find (
		{
			where: {
				tutorialId: tid,
				userId: uid
			}
		}
	);
}


/**
 * Find tutorial tutor's ID by tutorial ID
 * @param tid
 * @returns {Promise}
 */
var findTutorialTutorID = function (tid) {
	return userTutorial.find (
		{
			attributes: ['userId'],
			where: {
				tutorialId: tid,
				role: 'tutor'
			}
		}
	);
};


/**
 * Find tutorial info by tutorial id
 * @param tid
 * @returns {Promise}
 */
var findTutorialInfo = function (tid) {
	return tutorial.findAll({
		where: {
			id: tid
		}
	});
}



module.exports.changeExp = changeExp;
module.exports.findAndCountAllUsersInTutorial =  findAndCountAllUsersInTutorial;
module.exports.getUserInfo = getUserInfo;
module.exports.getTutorialByCoursecodeAndName = getTutorialByCoursecodeAndName;
module.exports.checkIfInTutorialUserList = checkIfInTutorialUserList;
module.exports.findTutorialTutorID = findTutorialTutorID;
module.exports.findTutorialInfo = findTutorialInfo;