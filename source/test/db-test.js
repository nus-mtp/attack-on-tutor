var mocha = require ('mocha');
var chai = require ('chai');
var models = require('../../models');
var db = require ('../controller/db');
var chaiAsPromised = require ('chai-as-promised');
var async = require('async')

chai.use (chaiAsPromised);
var User = models.User
var Tutorial = models.Tutorial
var testModules = require('../testing/database/test_modules.json')
var testStudents = require('../testing/database/test_students.json')

var should = chai.should ();
var expect = chai.expect;

var testTut = {
		"id": "test1",
		"grouptype": "Tutorial",
		"name": "1",
		"courseid": "testcourse1",
		"coursecode": "TT1011",
		"coursename": "TEST COURSE 1",
		"week": "Every Week",
		"day": "Monday",
		"time": "1000 - 1200"
	}

describe ("Database Test", function () {
    before(function (done) {
        Tutorial.bulkCreate(testModules.modules, {ignoreDuplicates: true})
        .then(function (data) {
        User.bulkCreate(testStudents.students, {ignoreDuplicates: true})
        .then(function (students) {
        async.each(students,
            function (student, callback) {
                student.addAvatar('avatar-01').then(function () {
                student.addTutorial('general-chat', {role: 'tutor', exp: 0});
            }).then(function () {
                if (student.id === 'b0123456') {
                    student.addTutorial('test1', {role: 'tutor', exp: 0});
                } else {
                    student.addTutorial('test1', {role: 'student', exp: 0});
                }
                callback();
            })
            },
            function (err) {
                done();
            })
        })
        })
    })

	it ('Should return the tutor id of a tutorial', function () {
		var findTutor = db.findTutorialTutorID('test1');
		return findTutor.then(function (result) {
			(result.dataValues.userId).should.equal('b0123456');
		});
	});
    it('Should return the tutor id of a tutorial', function (done) {
        db.findTutorialTutorID('test1').then(function (data) {
            data.dataValues.userId.should.equal('b0123456')
            done()
        })
    })

	it ('Should return the tutorial info of a tutorial', function () {
		var findTutorial = db.findTutorialInfo('test1');
		return findTutorial.then(function (result) {
			var ans = result[0].dataValues;
			(ans.grouptype).should.equal(testTut.grouptype);
			(ans.name).should.equal(testTut.name);
			(ans.courseid).should.equal(testTut.courseid);
			(ans.coursecode).should.equal(testTut.coursecode);
			(ans.coursename).should.equal(testTut.coursename);
		});
	});
 
	it ('Should return the tutorial id from a coursecode and tutorial name', function () {
		var findTutorial = db.getTutorialByCoursecodeAndName('TT1011', '1');
		return findTutorial.then(function (result) {
			(result.dataValues.id).should.equal(testTut.id);
		});
	});

	it ('Should get all avatars currently in database', function () {
		return db.getAllAvatars().then(function (result) {
			(result.count).should.equal(6);
		});
	});

	it ('Should increase the exp of the userTutorial by 100', function () {
		return db.changeExp('c0123456', 'test1', 100).then(function (result) {
			models.userTutorial.findOne({
				where: {userId: 'c0123456', tutorialId: 'test1'}
			}).then(function (result) {
				(result.dataValues.exp).should.equal(100);
			});
		});
	});

	it ('Should increase the levels spent of the user by 1', function () {
		return db.increaseLevelsSpent('c0123456', 1).then(function (result) {
			models.User.findOne({
				where: {id: 'c0123456'}
			}).then(function (result) {
				(result.dataValues.levelsSpent).should.equal(1);
			});
		});
	});

	it ('Should add avatar-06 to the user', function () {
		return db.addAvatarToUser('b0123456', 'avatar-06').then(function (result) {
			models.userAvatar.findOne({
				where: { userId: 'b0123456', avatarId: 'avatar-06'}
			}).then(function (instance) {
				(instance).should.not.equal(undefined);
			});
		});
	})


});    after(function (done) {
        var modules = testModules.modules
        var ids = []
        for (i in modules) { ids.push(modules[i].id) }
        Tutorial.destroy({where: {'id': ids}}).then(function () {
            var students = testStudents.students
            var ids = []
            for (i in students) { ids.push(students[i].id) }
            User.destroy({where: {'id': ids}}).then(function () {
                done()
            })
        })
    })
