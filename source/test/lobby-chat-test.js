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

var groupNames = ['G01', 'G02'];

var getSocketId = function (socket) {
	return socket.nsp + '#' + socket.id;
};

describe ("Chat Module Test", function() {
	it ('Should broadcast new user to all users except the new user', function(done) {
		var client1 = io.connect(socketURL, options);

		client1.on ('connect', function(data) {
			client1.emit ('new connection', chatUser1);

			var client2 = io.connect (socketURL, options);

			client2.on ('connect', function(data) {
				client2.emit ('new connection', chatUser2);
			});

			client2.on ('login', function(data) {
				client2.disconnect();
			});
		});

		client1.on ('user joined', function(data) {
			data.username.should.equal (chatUser2.username);
			client1.disconnect();
			done();
		});
	});

	it ('Should broadcast a message to all users in a group', function(done) {
		var client1, client2, client3;
		var message = "Help.";
		var messageCount = 0;

		var checkMessage = function (socket) {
			socket.on ('new message', function(data){
				data.message.should.equal (message);
				data.username.should.equal (chatUser1.username);
				socket.disconnect();

				messageCount++;
				if (messageCount === 2) {
					done();
				}
			});
		};

		client1 = io.connect (socketURL, options);
		checkMessage (client1);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect (socketURL, options);
			checkMessage (client2);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);

				client3 = io.connect (socketURL, options);
				checkMessage (client3);

				client3.on ('connect', function(data) {
					client3.emit('new connection', chatUser3);
				});

				client3.on ('login', function(data) {
					client1.emit ('edit group', {
			    		'groupname' : groupNames[0],
			    		'socketIds' : [getSocketId(client2), getSocketId(client3)]
			    	});
				});
			});

			client2.on ('added group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.emit ('new message', {
	            	'message' : message,
	            	'group' : groupNames[0]
	            });
			});
		});
	});

	it ('Should broadcast a message to all users in a group and not to those outside the group', function(done) {
		var client1, client2, client3;
		var message = "Help.";
		var messageCount = 0;

		var checkMessage = function (socket) {
			socket.on ('new message', function(data){
				data.message.should.equal (message);
				data.username.should.equal (chatUser1.username);
				
				messageCount++;
				if (socket === client2) {
					setTimeout (function() {
						messageCount.should.equal (1);
						client1.disconnect();
						client2.disconnect();
						client3.disconnect();
						done();
					}, 100);
				}
			});
		};

		client1 = io.connect (socketURL, options);
		checkMessage (client1);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect (socketURL, options);
			checkMessage (client2);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);

				client3 = io.connect (socketURL, options);
				checkMessage (client3);

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
				client1.emit ('new message', {
	            	'message' : message,
	            	'group' : groupNames[0]
	            });
			});
		});
	});

	it ('Should broadcast when a user is typing and stops typing to other users', function(done) {
	    var FADE_TIME = 50; //ms
	    var TYPING_TIMER_LENGTH = 100; //ms
		var lastTypingTime;

		var client1, client2, client3;
		var message = 'is typing in: ' + groupNames[0];
		var typingCount = 0;
		var stopTypingCount = 0;

		var checkTyping = function (socket) {
			socket.on ('typing', function(data) {
				data.group.should.equal (groupNames[0]);
				data.username.should.equal (chatUser1.username);
				
				typingCount++;
				if (typingCount === 2) {
					typingCount.should.equal (2);
				}
			});
		};
		var checkStopTyping = function (socket) {
			socket.on ('stop typing', function(data) {
				data.username.should.equal (chatUser1.username);
				
				stopTypingCount++;
				if (stopTypingCount === 2) {
					stopTypingCount.should.equal (2);
					client1.disconnect();
					client2.disconnect();
					client3.disconnect();
					done();
				}
			});
		};

		client1 = io.connect (socketURL, options);
		checkTyping (client1);
		checkStopTyping(client1);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect (socketURL, options);
			checkTyping (client2);
			checkStopTyping(client2);


			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);

				client3 = io.connect (socketURL, options);
				checkTyping (client3);
				checkStopTyping(client3);

				client3.on ('connect', function(data) {
					client3.emit('new connection', chatUser3);
				});

				client3.on ('login', function(data) {
					client1.emit ('edit group', {
			    		'groupname' : groupNames[0],
			    		'socketIds' : [getSocketId(client2), getSocketId(client3)]
			    	});
				});
			});

			client2.on ('added group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.emit ('typing', groupNames[0]);

		        lastTypingTime = (new Date()).getTime();
		        setTimeout(function () {
		            var typingTimer = (new Date()).getTime();
		            var timeDiff = typingTimer - lastTypingTime;
		            if (timeDiff >= TYPING_TIMER_LENGTH) {
		                client1.emit ('stop typing');
		            }
		        }, TYPING_TIMER_LENGTH);
			});
		});
	});
});