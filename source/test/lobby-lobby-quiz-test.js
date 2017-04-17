var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:8081/lobby';

var options = {
	transports: ['websocket'],
	'force new connection': true,
	query: 'namespace=/lobby'
};

var chatUser1 = {
    'userId' : 'b0123456',
    'username' : 'HAPPY STUDENT',
    'userRole' : 'tutor',
    'moduleId' : 'TT1011',
    'tutorialId' : '1',
    'tutorialUuid' : 'test1'
};
var chatUser2 = {
    'userId' : 'c0123456',
    'username' : 'SAD STUDENT',
    'userRole' : 'student',
    'moduleId' : 'TT1011',
    'tutorialId' : '1',
    'tutorialUuid' : 'test1'
};
var chatUser3 = {
    'userId' : 'd0123456',
    'username' : 'SMART STUDENT',
    'userRole' : 'student',
    'moduleId' : 'TT1011',
    'tutorialId' : '1',
    'tutorialUuid' : 'test1'
};
var chatUser4 = {
    'userId' : 'f0123456',
    'username' : 'BRIGHT STUDENT',
    'userRole' : 'student',
    'moduleId' : 'TT1011',
    'tutorialId' : '1',
    'tutorialUuid' : 'test1'
};

var groupNames = ['G01', 'G02'];

var getSocketId = function (socket) {
	return socket.nsp + '#' + socket.id;
};

describe ("Lobby Quiz Module Test", function() {
	it ('Should broadcast new questions to the selected group only', function (done) {
		var client1, client2, client3;
		var questionToSend = {
			'description' : "Do I need help?"
		};
		var questionCount = 0;

		var checkAddQuestion = function (socket) {
			socket.on ('add question', function (data) {
				chatUser1.username.should.equal (data.username);

				//Question was sent to a group with 1 person (chatUser2)
				data.groupmates.length.should.equal (1);
				chatUser2.username.should.equal (data.groupmates[0].username);

				questionToSend.description.should.equal (data.question.description);
				
				questionCount++;
				if (socket === client2) {
					setTimeout (function() {
						questionCount.should.equal (1);
						client1.disconnect();
						client2.disconnect();
						client3.disconnect();
						done();
					}, 100);
				}
			});
		};

		client1 = io.connect (socketURL, options);
		checkAddQuestion (client1);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect (socketURL, options);
			checkAddQuestion (client2);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);

				client3 = io.connect (socketURL, options);
				checkAddQuestion (client3);

				client3.on ('connect', function(data) {
					client3.emit('new connection', chatUser3);
				});

				client3.on ('login', function(data) {
					client1.emit ('edit group', {
			    		'groupname' : groupNames[0],
			    		'socketIds' : [getSocketId(client2)]
			    	});
				});
			});

			client2.on ('added group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.emit ('new question', {
					'question' : questionToSend,
					'groups' : [groupNames[0]]
				});
			});
		});
	});

	it ('Should update answers to a question only to others within the group', function (done) {
		var client1, client2, client3, client4;
		var questionToSend = {
			'description' : "Do I need help?"
		};
		var questionUUID = "";
		var questionCount = 0;
		var updateCount = 0;

		var checkAddQuestion = function (socket) {
			socket.on ('add question', function (data) {
				questionUUID = data.question.uuid;

				chatUser1.username.should.equal (data.username);
				questionToSend.description.should.equal (data.question.description);
				
				questionCount++;
				//All the questions have been received by the clients.
				if (questionCount === 3) {
					client2.emit ('update answer', {
			    		'uuid' : questionUUID,
			    		'answers' : [
							{
								'student' : {
									'username' : chatUser2.username,
									'userType' : chatUser2.userRole,
									'userId' : chatUser2.userId,
									'tutorialId' : chatUser2.tutorialUuid,
									'socketId' : getSocketId (client2)
								},
								'description' : 'Yes you do.',
								'selected' : true,
								'owned' : true,
								'selectedCount' : 0
							},
							{
								'student' : {
									'username' : chatUser3.username,
									'userType' : chatUser3.userRole,
									'userId' : chatUser3.userId,
									'tutorialId' : chatUser3.tutorialUuid,
									'socketId' : getSocketId (client3)
								},
								'description' : '',
								'selected' : false,
								'owned' : false,
								'selectedCount' : 0
							}
						]
			    	});
				}
			});
		};

		var checkUpdateAnswer = function (socket) {
			socket.on ('update answer', function (data) {
				questionUUID.should.equal (data.questionUuid);
				getSocketId(client2).should.equal (data.socketId);
				data.answer.should.equal ('Yes you do.');
				
				updateCount++;
				if (socket === client3) {
					setTimeout (function() {
						updateCount.should.equal (2);
						client1.disconnect();
						client2.disconnect();
						client3.disconnect();
						client4.disconnect();
						done();
					}, 100);
				}
			});
		};

		client1 = io.connect (socketURL, options);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect (socketURL, options);
			checkAddQuestion (client2);
			checkUpdateAnswer (client2);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);

				client3 = io.connect (socketURL, options);
				checkAddQuestion (client3);
				checkUpdateAnswer (client3);

				client3.on ('connect', function(data) {
					client3.emit('new connection', chatUser3);

					client4 = io.connect (socketURL, options);
					checkAddQuestion (client4);
					checkUpdateAnswer (client4);

					client4.on ('connect', function(data) {
						client4.emit('new connection', chatUser4);

						client4.on ('login', function(data) {
							client1.emit ('edit group', {
					    		'groupname' : groupNames[0],
					    		'socketIds' : [getSocketId(client2), getSocketId(client3)]
					    	});
					    	client1.emit ('edit group', {
					    		'groupname' : groupNames[1],
					    		'socketIds' : [getSocketId(client4)]
					    	});
						});
					});
				});
			});

			client2.on ('added group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.emit ('new question', {
					'question' : questionToSend,
					'groups' : [groupNames[0], groupNames[1]]
				});
			});
		});
	});
});