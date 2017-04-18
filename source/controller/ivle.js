var models = require ('../../models');
var User = models.User;
var Tutorial = models.Tutorial;
var userTutorial = models.userTutorial;

var rest = require ('rest');
var app = require ('../../app');


/**
 * Find tutorial by user ID and tutorial ID
 * @param uid
 * @param tid
 * @returns {Promise}
 */
var findTutorial = function (uid, tid) {
	return Tutorial.findAndCountAll ({
		where: {
			id: tid
		},
		include: [{
			model: User,
			attributes: ['id'],
			where: {id: uid}
		}]
	})
};

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
 * Find and count all tutorials of one user
 * @param uid
 * @returns {Promise}
 */
var findAndCountAllTutorials = function (uid) {
	return Tutorial.findAndCountAll ({
		include: [{
			model: User,
			attributes: ['id'],
			where: {id: uid}
		}]
	});
};

/**
 * Find and count all user in some tutorial
 * @param tid
 * @returns {Promise}
 */
var findAndCountAllUsersInTutorial = function(tid){
	return User.findAndCountAll({
		include:[{
			model: tutorial,
			where: {id: tid}
		}],
		attributes:['id','name', 'avatarId']
	});
};


/**
 * Find tutorial ids of tutorials under a user
 * @param uid
 * @returns {Promise}
 */
var findTutorialSession = function (uid) {
	return userTutorial.findAll ({
		attributes: ['tutorialId'],
		where: {
			userId: uid
		}
	});
};


/**
 * Finds all tutorial info of a user's tutorials
 * @param uid
 * @returns {Promise}
 */
 var findAllTutorialInfoOfUser = function (uid) {
 	return Tutorial.findAndCountAll({
 		include: [{
 			model: userTutorial,
 			attributes: ['userId', 'tutorialId'],
 			where: {
 				userId: uid
 			}
 		}]
 	});

 }


/**
 * Private function, fetch IVLE user modules, return promise
 * @param token
 * @returns {Promise}
 */
var fetchIVLEUserModules = function (token) {
	//console.log('https://ivle.nus.edu.sg/api/Lapi.svc/Modules?APIKey=' + app.get ('api-key') + '&AuthToken=' + token + '&Duration=0&IncludeAllInfo=false');
	return rest ('https://ivle.nus.edu.sg/api/Lapi.svc/Modules?APIKey=' + app.get ('api-key') + '&AuthToken=' + token + '&Duration=0&IncludeAllInfo=false');
}

/**
 * Private function, fetch IVLE tutorial groups, return promise
 * @param token
 * @param course
 * @returns {Promise}
 */
var fetchIVLETutorialGroups = function (token, course) {
	return rest ('https://ivle.nus.edu.sg/API/Lapi.svc/GroupsByUserAndModule?APIKey=' + app.get ('api-key') + '&AuthToken=' + token + '&CourseID=' + course['ID'] + '&AcadYear=' + course['AcadYear'] + '&Semester=' + course['semester']).then (function (response) {
		return {tutorialGroup: JSON.parse (response.entity).Results, course: course};
	});
}

/**
 * Force Synchronize user's IVLE account and import all data into system database
 * @param uid
 * @return Promise
 */
var forceSyncIVLE = function (uid) {
	return new Promise(function (fulfill, reject) {
		User.findOne( {
			where: {
				id: uid
			}
		}).then (function (user) {
			return fetchIVLEUserModules(user.token).then( function (response) {
				return [response, JSON.parse(response.entity).Results, user];
			});
		}).spread (function (response, courses, user) {
			if (courses.length == 0 && (response.status.code != 200)) {
				reject ('Sync Module Failed');
			}
			return Promise.all (courses.map (function (course) {
				//console.log(course);
				return fetchIVLETutorialGroups (user.token, course)
			})).then (function (result) {
				//console.log(result);
				if (result.length == 0) {
					return reject ('Sync Groups By User And Module Failed');
				}
				return [result, user];
			});
		}).spread (function (result, user) {
			var groups = [];
			for (var resultIndex in result) {
				for (var groupIndex in result[resultIndex]['tutorialGroup']) {
					if (result[resultIndex]['tutorialGroup'][groupIndex]['GroupTypeCode'] === 'T') {
						var group = result[resultIndex]['tutorialGroup'][groupIndex];
						group['CourseName'] = result[resultIndex]['course']['CourseName'];
						group['Permission'] = result[resultIndex]['course']['Permission'];
						groups.push (group);
					}
				}
			}
			groups = removeDuplicateTuts(groups);
			return Promise.all (groups.map (function (group) {
				return Tutorial.findOrCreate ({
					where: {
						courseid: group['CourseID'],
						name: group['GroupName']
					},
					defaults: {
						grouptype: group['GroupType'],
						coursecode: group['ModuleCode'],
						coursename: group['CourseName'],
						week: group['Week'],
						day: group['Day'],
						time: group['Time']
					}
				}).spread (function (tutorial, created) {
					console.log('created: ' + created);
					return tutorial;
				});
			})).then (function (tutorials) {
				return {tutorials: tutorials, user: user, groups: groups};
			}).catch(function(err){
				reject ('Sync Failed: ' + err.stack);
			})
		}).then(function (result) {

			// Create user-tutorial relation
			var tutorials = result.tutorials;
			var groups = result.groups;	
			if (tutorials.length != groups.length) {
				return reject ('Database Error!');
			}
			var relations = [];
			for (var groupIndex in groups) {
				var relation = {};
				relation['tutorial'] = tutorials[groupIndex];
				relation['permission'] = groups[groupIndex]['Permission'];
				relations.push (relation);
			}

			return Promise.all (relations.map (function (relation) {
				var role = 'student';
				if (relation['permission'] === 'M') {
					role = 'tutor';
				}
				return userTutorial.findOrCreate({
					where: {
						UserId: result.user.id,
						TutorialId: relation['tutorial'].dataValues.id
					},
					defaults: {
						role: role,
						tutorialId: relation['tutorial'].dataValues.id,
						userId: result.user.id,
						exp: 0
					}
				});

			}));

		}).then(function (result) {
			if (result) {
				fulfill (true);
			}	
		}).catch(function (err) {
			reject ('Sync Failed: ' + err.stack);
		})
	});

};

/**
 * Gets user info by uid
 * @param  uid
 * @return Promise
 */
var getUserInfo = function (uid) {
	return User.findOne({
		where: {
			id: uid
		}
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
 * Removes duplicate tutorials from the IVLE object (which mysteriously
 * returns duplicates, for some reason)
 * @param  objArray
 * @return Array
 */
var removeDuplicateTuts = function (objArray) {
	var dupes = {};
	objArray.forEach(function (o) { dupes[o.CourseID] = o; });
	var results = Object.keys(dupes).map(function (k) { return dupes[k]; });
	return results;

}

module.exports.forceSyncIVLE = forceSyncIVLE;
