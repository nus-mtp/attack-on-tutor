var app = require ('../../app');
var io = require ('socket.io')();
var lobbyio = io.of ('/lobby');

var users = {
    'A0125566B' : {
        'username' : 'Coral',
        'userType' : 'tutor'
    },
    'A0125566M' : {
        'username' : 'Melania',
        'userType' : 'student'
    },
    'A0125566C' : {
        'username' : 'Trumpet',
        'userType' : 'student'
    }
};

var listen = function (server) {
	io.listen (server);
	console.log('Server Started and Socket listened on ' + server);
}

var lobbyList =  new LobbyList();

function LobbyList () {
    this.lobbyCount = 0,
    this.lobbies = {}
}

LobbyList.prototype.addLobby = function (roomData) {
	if (!this.lobbies[roomData.moduleId]) {
		this.lobbies[roomData.moduleId] = {};
	}
	if (!this.lobbies[roomData.moduleId][roomData.tutorialId]) {
		this.lobbies[roomData.moduleId][roomData.tutorialId] = new Lobby();
		this.lobbies[roomData.moduleId][roomData.tutorialId].tutorialId = roomData.tutorialId;
		this.lobbies[roomData.moduleId][roomData.tutorialId].moduleId = roomData.moduleId;
		this.lobbies[roomData.moduleId][roomData.tutorialId].namespace = roomData.namespace;
		this.lobbyCount++;
	}
	return this.lobbies[roomData.moduleId][roomData.tutorialId];
}

LobbyList.prototype.getLobby = function (moduleId, tutorialId) {
    if (this.lobbies[moduleId])
        return this.lobbies[moduleId][tutorialId];
    else
        return null;
}

function Lobby () {
    this.tutorialId = '';
    this.moduleId = '';
	this.namespace = '';
    
	this.locked = false;
	this.tutors = {};
    
	this.groupCount = 0;
	this.groups = {};

    this.questions = [];
    
    this.numUsers = 0;
    
    //var defaultGroup = new Group ('default_group');
	//this.groups[defaultGroup.groupId] = defaultGroup;
}

Lobby.prototype.emitToLobby = function (key, value) {
    if (this.namespace.length > 0)
        lobbyio.in (this.namespace).emit (key, value);
}

Lobby.prototype.emitToGroup = function (group, key, value) {
    if (this.namespace.length > 0) {
        if (this.groups[group]) {
            lobbyio.in (this.namespace + '/' + group).emit (key, value);
        } else if (this.namespace == group) {
            this.broadcastToLobby (key, value);
        }
    }
}

Lobby.prototype.broadcastToLobby = function (socket, key, value) {
    if (this.namespace.length > 0) {
        socket.broadcast.to(this.namespace).emit (key, value);
    }
}

Lobby.prototype.broadcastToGroup = function (socket, group, key, value) {
    if (this.namespace.length > 0) {
        if (this.groups[group]) {
            socket.broadcast.to(this.namespace + '/' + group).emit (key, value);
        } else if (this.namespace == group) {
            this.broadcastToLobby (socket, key, value);
        }
    }
}

//Function to parse group name and append the namespace.
Lobby.prototype.getRoomName = function (group) {
    if (this.groups[group]) {
        return this.namespace + '/' + group;
    } else if (this.namespace == group) {
        return this.namespace;
    }
}

Lobby.prototype.getUsersInRoom = function (roomName) {
    var roomName = this.getRoomName (roomName);
    var userSockets = [];
    var socketsInRoom = lobbyio.adapter.rooms[roomName];
    if (socketsInRoom) {
        for (var socketId in socketsInRoom.sockets) {
            if (socketsInRoom.sockets.hasOwnProperty(socketId)) {
                if (lobbyio.connected[socketId]) {
                    userSockets.push ({
                        'username' : lobbyio.connected[socketId].username,
                        'userType' : lobbyio.connected[socketId].userType,
                        'socketId' : socketId
                    });
                }
            }
        }
    }
    return userSockets;
}

Lobby.prototype.getUsersInLobby = function () {
    //Group the users according to the room they are in.
    var rooms = {};
    //Start with the "namespace" room that contains all users in the current tutorial group.
    rooms[this.namespace] = this.getUsersInRoom (this.namespace);
    
    for (var group in this.groups) {
        rooms[group] = this.getUsersInRoom (group);
    }
    
    return rooms;
}

Lobby.prototype.addGroup = function (group) {
    if (!this.groups[group]) {
        this.groups[group] = group;
        this.groupCount++;
    }
}

Lobby.prototype.removeGroup = function (group) {
    if (this.groups[group]) {
        var groupname = this.namespace + '/' + group;
        var socketsInRoom = lobbyio.adapter.rooms[groupname];
        if (socketsInRoom) {
            for (var socketId in socketsInRoom.sockets) {
                if (socketsInRoom.sockets.hasOwnProperty(socketId)) {
                    if (lobbyio.connected[socketId]) {
                        lobbyio.connected[socketId].leave (groupname);
                    }
                }
            }
        }
        delete this.groups[group];
        this.groupCount--;
    }
}

Lobby.prototype.getAllGroupsInLobby = function () {
    var allGroups = [];
    //Push the namespace, which is effectively a group containing all users in the tutorial.
    allGroups.push (this.namespace);
    for (group in this.groups) {
        allGroups.push ( group );
    }
    return allGroups;
}

Lobby.prototype.addSocketToGroup = function (socket, group) {
    if (this.groups[group]) {
        socket.join (this.namespace + '/' + group);
    }
}

Lobby.prototype.removeSocketFromGroup = function (socket, group) {
    if (this.groups[group]) {
        socket.leave (this.namespace + '/' + group);
    }
}

//On connection of each new client socket.
lobbyio.on ('connection', function (socket) {
    var addedUser = false;

    //Listen for new connections and create a lobby if one does not exist yet.
    socket.on ('new connection', function (data) {
        if (addedUser) {
            return;
        }

        var userId = data.userId;
        var lobby;
        //Temp measure to identify students and tutors.
        //TODO: Make this connect to the db.
        if (users[userId]) {
            if (users[userId].userType == 'tutor') {
                //Add a lobby to the lobbyList if a tutor connects.
                lobby = lobbyList.addLobby ({
                    'tutorialId' : data.tutorialId,
                    'moduleId' : data.moduleId,
                    'namespace' : data.moduleId + "/" + data.tutorialId 
                });
            } else if (users[userId].userType == 'student') {
                lobby = lobbyList.getLobby(data.moduleId, data.tutorialId);
                //The lobby is not open to the student yet.
                if (!lobby) {
                    socket.emit ('invalid');
                    return;
                }
            }
        } else {
            socket.emit ('invalid');
            return;
        }
        
        socket.tutorialGroup = data.tutorialId;
		socket.moduleGroup = data.moduleId;
		socket.namespace = lobby.namespace;
        socket.userId = data.userId;
        socket.username = users[userId].username;;
        socket.userType = users[userId].userType;

        //Join the main tutorial group room.
        socket.join ( lobby.namespace );

        lobby.numUsers++;
        addedUser = true;
        
        //Update the client that login is successful.
        socket.emit ('login', {
            'userType': socket.userType,
            'username': socket.username,
            'numUsers': lobby.numUsers,
            'defaultGroup': lobby.namespace
        });

        console.log (lobby.questions);

        updateUsers (lobby, socket);
        
        //Update all clients whenever a user successfully joins the lobby.
        socket.broadcast.to(socket.namespace).emit ('user joined', {
            'username': socket.username,
            'numUsers': lobby.numUsers
        });

        //Initialise the socket
        if (addedUser) {
            //Listen and execute broadcast of message on receiving 'new message' emission from the client.
            socket.on ('new message', function (data) {
                // we tell the client to execute 'new message'
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                lobby.broadcastToGroup (socket, data.group, 'new message', {
                    'username': socket.username,
                    'message': data.message,
                    'group': data.group
                });
            });

            //Broadcast that the client is typing a message to other clients connected.
            socket.on ('typing', function (data) {
                socket.broadcast.to(socket.namespace).emit ('typing', {
                    'username': socket.username,
                    'group': data
                });
            });

            //Broadcast when the client stops typing a message to other clients connected.
            socket.on ('stop typing', function () {
                socket.broadcast.to(socket.namespace).emit ('stop typing', {
                    'username': socket.username
                });
            });
            
            //Listen and execute broadcast of message on receiving 'new message' emission from the client.
            //TODO separate out the different listeners for tutors and students.
            socket.on ('new question', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                data.question.completed = false;
                data.question.graded = false;
                lobby.questions.push (data.question);
                data.groups.forEach (function (groupName, i) {
                    lobby.broadcastToGroup (socket, groupName, 'add question', {
                        'username': socket.username,
                        'groupmates': lobby.getUsersInRoom (groupName),
                        'question': data.question
                    });
                });
                //socket.broadcast.to(socket.namespace).emit ('add question', parsedData);
            });

            socket.on ('edit group', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var socketIds = data.socketIds;
                var groupname = data.groupname;
                lobby.addGroup (groupname);
                for (var index in socketIds) {
                    if (lobbyio.connected[socketIds[index]]) {
                        lobby.addSocketToGroup (lobbyio.connected[socketIds[index]], groupname);
                        lobbyio.to(socketIds[index]).emit ('added group', groupname);
                    }
                }
                updateUsers (lobby, socket);
                //socket.broadcast.to(socket.namespace).emit ('add question', parsedData);
            });

            socket.on ('delete group', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var groupname = data.groupname;
                var usersInGroup = lobby.getUsersInRoom(groupname);
                usersInGroup.forEach (function (value, i) {
                    lobbyio.to(value.socketId).emit ('deleted group', groupname);
                });
                lobby.removeGroup (groupname);
                updateUsers (lobby, socket);
                //socket.broadcast.to(socket.namespace).emit ('add question', parsedData);
            });

            //Listen and execute broadcast of message on receiving 'new message' emission from the client.
            socket.on ('submit answer', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                if (data.index >= 0 && data.index < lobby.questions.length) {
                    var questionToCheck = lobby.questions[data.index];
                    if (data.options.length == questionToCheck.options.length) {
                        for (var optionIterator = 0; optionIterator < questionToCheck.options.length; optionIterator++) {
                            if (data.options[optionIterator].selected != questionToCheck.options[optionIterator].isCorrect) {
                                socket.emit ('wrong answer', data.index);
                                return;
                            }
                        }
                        socket.emit ('correct answer', data.index);
                    }
                }
            });
        }
    });

    //Listen to when the client disconnects and execute.
    socket.on ('disconnect', function () {
        if (addedUser) {
            var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
            --lobby.numUsers;

            //Broadcast to other clients that this client has disconnected
            socket.broadcast.to(socket.namespace).emit ('user left', {
                username: socket.username,
                numUsers: lobby.numUsers
            });

            updateUsers (lobby, socket);
        }
    });
    

    //When the client starts a battle
    socket.on ('start battle', function () {
        var gameId = (Math.random()+1).toString(36).slice(2, 18);
        
        console.log("Game Created by "+ socket.username + " w/ " + gameId);
        
        gameCollection.gameList.gameId = gameId
        gameCollection.gameList.gameId.playerOne = socket.username;
        gameCollection.gameList.gameId.open = true;
        gameCollection.totalGameCount ++;

        socket.broadcast.to(socket.namespace).emit ('battle created', {
            username: socket.username,
            gameId: gameId
        });
    });
});

function updateUsers (lobby, socket) {
    lobby.emitToLobby ('update users', {
        'userList' : lobby.getUsersInLobby(),
        'groupList' : lobby.getAllGroupsInLobby()
    });
}

//Join a Game
function joinGame(username, game) {
    if (game.player2 !== null) {
        game.player2 = username;
    } 
    else {
        alert ("Game "+game.id+ " Already Has Max Players" )
    }
}

module.exports.listen = listen;