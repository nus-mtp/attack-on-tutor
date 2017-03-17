/**
 * @module models/Tutorial
 * @type {Sequelize|*|exports|module.exports}
 */

var sequelize = require ('../sequelize');
var Sequelize = require ('sequelize');
var User = require ('./User');
var rest = require ('rest');
var app = require ('../../app');

/**
 * Define tutorial model
 * @type {Model}
 */
var tutorial = sequelize.define ('tutorial', {
	id: {
		type: Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4,
		unique: true,
		primaryKey: true
	},
	grouptype: {
		type: Sequelize.STRING,
	},
	name: {
		type: Sequelize.STRING,
	},
	courseid: {
		type: Sequelize.STRING,
	},
	coursecode: {
		type: Sequelize.STRING
	},
	coursename: {
		type: Sequelize.STRING
	},
	week: {
		type: Sequelize.STRING
	},
	day: {
		type: Sequelize.STRING
	},
	time: {
		type: Sequelize.STRING
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

/**
 * Define user tutorial relation model
 * @type {Model}
 */
var userTutorial = sequelize.define ('userTutorial', {
	role: {
		type: Sequelize.ENUM,
		values: ['student', 'tutor'],
		allowNull: false
	},
	tutorialId: {
		type: Sequelize.UUID,
		references: {
			model: tutorial,
			key: 'id'
		}
	},
	userId: {
		type: Sequelize.STRING,
		references: {
			model: User,
			key: 'id'
		}
	}
}, {
	indexes: [
		{
			name: 'tutorialId',
			fields: ['tutorialId']
		},
		{
			name: 'userId',
			fields: ['userId']
		}
	]
});


User.belongsToMany (tutorial, {
	foreignKey: 'userId',
	through: 'userTutorial',
});

tutorial.belongsToMany (User, {
	foreignKey: 'tutorialId',
	through: 'userTutorial',
});

sequelize.sync ();

/**
 * Find tutorial by user ID and tutorial ID
 * @param uid
 * @param tid
 * @returns {Promise}
 */
var findTutorial = function (uid, tid) {
	return tutorial.findAndCountAll ({
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
	return tutorial.findAndCountAll ({
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
		attributes:['id','name','gender','email']
	});
};

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
			//console.log(courses);
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
			// Create tutorials in db
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
			return Promise.all (groups.map (function (group) {
				return tutorial.findOrCreate ({
					where: {
						name: group['GroupName'],
						courseid: group['CourseID']
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
				
				return relation['tutorial'].addUser(result.user, {role: role});
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

/**
 * Finds all tutorial info of a user's tutorials
 * @param uid
 * @returns [{tutinfo}, {tutinfo} ...] <- SHOULD RETURN PROMISE
 */

 var findAllTutorialInfoOfUser = function (uid) {

 	// return findTutorialSession(uid).then(function (data) {
 	// 	console.log(111);
 	// 	console.log(data);
 	// 	return tutorial.findAll({
 	// 		where: {
 	// 			id: {
 	// 				$in: data
 	// 			}
 	// 		}
 	// 	});
 	// });


 	return sequelize.query("SELECT * FROM tutorials WHERE id IN (SELECT tutorialId FROM userTutorials WHERE userId = '"+uid+"')").
 	spread(function (results, metadata) {
 		return results;
 	});

 	// TODO: SUBQUERIES??? 
 	// SELECT * FROM tutorials WHERE id IN (SELECT tutorialId FROM userTutorials WHERE userId = 'a0127127');
 	// return tutorial.findAll({
 	// 	where: {
 	// 		id: {
 	// 			$in: {

 	// 			}
 	// 		}
 	// 	}
 	// });
 }



module.exports = tutorial;
module.exports.forceSyncIVLE = forceSyncIVLE;
module.exports.findTutorial = findTutorial;
module.exports.findAndCountAllTutorials = findAndCountAllTutorials;
module.exports.findTutorialSession = findTutorialSession;
module.exports.findTutorialInfo = findTutorialInfo;
module.exports.findTutorialTutorID = findTutorialTutorID;
module.exports.checkIfInTutorialUserList = checkIfInTutorialUserList;
module.exports.findAndCountAllUsersInTutorial = findAndCountAllUsersInTutorial;
module.exports.findAllTutorialInfoOfUser = findAllTutorialInfoOfUser;