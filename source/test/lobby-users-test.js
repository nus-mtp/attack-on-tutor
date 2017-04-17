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

describe ("Users List Module Test", function() {
	it ('Should add client to group', function(done) {
		var client1, client2;
		var client1 = io.connect(socketURL, options);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect(socketURL, options);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);
			});

			client2.on ('login', function(data) {
				client1.emit ('edit group', {
		    		'groupname' : groupNames[0],
		    		'socketIds' : [getSocketId(client2)]
		    	});
			});

			client2.on ('added group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.disconnect();
				client2.disconnect();
				done();
			});
		});
	});

	it ('Should remove client from existing group when added to another group', function(done) {
		var changedGroup = false;
		var client1, client2;
		client1 = io.connect(socketURL, options);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect(socketURL, options);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);
			});

			client2.on ('login', function(data) {
				client1.emit ('edit group', {
		    		'groupname' : groupNames[0],
		    		'socketIds' : [getSocketId(client2)]
		    	});
			});

			client2.on ('added group', function (groupname) {
				if (!changedGroup) {
					groupname.should.equal (groupNames[0]);

					client1.emit ('edit group', {
			    		'groupname' : groupNames[1],
			    		'socketIds' : [getSocketId(client2)]
			    	});
			    	changedGroup = true;
				} else {
					groupname.should.equal (groupNames[1]);
					client1.disconnect();
					client2.disconnect();
					done();
				}
			});

			client2.on ('deleted group', function (groupname) {
				groupname.should.equal (groupNames[0]);
			});
		});
	});

	it ('Should remove client from group when the group is deleted', function(done) {
		var client1, client2;
		client1 = io.connect(socketURL, options);

		client1.on ('connect', function(data) {
			client1.emit('new connection', chatUser1);

			client2 = io.connect(socketURL, options);

			client2.on ('connect', function(data) {
				client2.emit('new connection', chatUser2);
			});

			client2.on ('login', function(data) {
				client1.emit ('edit group', {
		    		'groupname' : groupNames[0],
		    		'socketIds' : [getSocketId(client2)]
		    	});
			});

			client2.on ('added group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.emit ('delete group', {
        			'groupname' : groupNames[0]
        		});
			});

			client2.on ('deleted group', function (groupname) {
				groupname.should.equal (groupNames[0]);
				client1.disconnect();
				client2.disconnect();
				done();
			});
		});
	});
});