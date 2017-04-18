var mocha = require ('mocha');
var chai = require ('chai');
var models = require('../../models');
var db = require ('../controller/db');
var chaiAsPromised = require ('chai-as-promised');

chai.use (chaiAsPromised);

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

	it ('Should return the tutor id of a tutorial', function () {
		var findTutor = db.findTutorialTutorID('test1');
		return findTutor.then(function (result) {
			(result.dataValues.userId).should.equal('b0123456');
		});
	});

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

	after(function () {
		// clean up
		db.changeExp('c0123456', 'test1', -100);
		db.increaseLevelsSpent('c0123456', -1);
		models.userAvatar.findOne({ where: { userId: 'b0123456', avatarId: 'avatar-06'}}).then(function (instance) {
			instance.destroy();
		});
	})

});