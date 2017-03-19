var app = require ('../../app');
var io = require ('socket.io')();
var lobbyio = io.of ('/lobby');

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

    this.questions = {};
    
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
            this.emitToLobby (key, value);
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

        //Identify students and tutors.
        if (data.userRole == 'tutor') {
            //Add a lobby to the lobbyList if a tutor connects.
            lobby = lobbyList.addLobby ({
                'tutorialId' : data.tutorialId,
                'moduleId' : data.moduleId,
                'namespace' : data.moduleId + "/" + data.tutorialId 
            });
        } else if (data.userRole == 'student') {
            lobby = lobbyList.getLobby(data.moduleId, data.tutorialId);
            //The lobby is not open to the student yet.
            if (!lobby) {
                socket.emit ('invalid');
                return;
            }
        }
        
        socket.tutorialGroup = data.tutorialId;
		socket.moduleGroup = data.moduleId;
		socket.namespace = lobby.namespace;
        socket.userId = data.userId;
        socket.username = data.username;
        socket.userType = data.userRole;

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
            
            //TODO separate out the different listeners for tutors and students.

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

            socket.on ('new question', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);

                data.question.completed = false;
                data.question.graded = false;
                data.question.uuid = generateUUID();
                data.question.groups = data.groups;
                data.question.selectedAnswers = {};
                data.question.answers = {};

                lobby.questions[data.question.uuid] = data.question;
                data.groups.forEach (function (groupName, i) {
                    lobby.broadcastToGroup (socket, groupName, 'add question', {
                        'username': socket.username,
                        'groupmates': lobby.getUsersInRoom (groupName),
                        'question': data.question
                    });
                });
                //socket.broadcast.to(socket.namespace).emit ('add question', parsedData);
            });

            socket.on ('update answer', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var questionUuid = data.uuid;
                var question = lobby.questions[questionUuid];
                var answers = data.answers;
                var ownAnswer = getOwnAnswers (data.answers);

                //Save the user's answer or update if it already exists.
                if (!lobby.questions[questionUuid].answers[socket.id]) {
                    lobby.questions[questionUuid].answers[socket.id] = {
                        'description' : ownAnswer.description
                    };
                } else {
                    lobby.questions[questionUuid].answers[socket.id].description = ownAnswer.description;
                }

                //Save the user's selected answer (if any)
                for (var i = 0; i < answers.length; i++) {
                    if (answers[i].selected) {
                        lobby.questions[questionUuid].selectedAnswers[socket.id] = answers[i].student.socketId;
                        break;
                    }
                }
                
                //Count the selected answers from each user.
                var selectedCounts = {};
                for (var answerSocketId in lobby.questions[questionUuid].answers) {
                    if (lobby.questions[questionUuid].answers.hasOwnProperty (answerSocketId)) {
                        //Set the selected count for that specific answer to 0 for recounting.
                        lobby.questions[questionUuid].answers[answerSocketId].selectedCount = 0;

                        for (var selectedAnswerSocketId in lobby.questions[questionUuid].selectedAnswers) {
                            if (lobby.questions[questionUuid].selectedAnswers.hasOwnProperty (selectedAnswerSocketId)) {
                                if (lobby.questions[questionUuid].selectedAnswers[selectedAnswerSocketId] == answerSocketId) {
                                    lobby.questions[questionUuid].answers[answerSocketId].selectedCount++;
                                }
                            }
                        }

                        selectedCounts[answerSocketId] = lobby.questions[questionUuid].answers[answerSocketId].selectedCount;
                    }
                }

                console.log (lobby.questions[questionUuid])
                if (question) {
                    question.groups.forEach (function (groupName, i) {
                        lobby.emitToGroup (groupName, 'update answer', {
                            'socketId': socket.id,
                            'questionUuid': questionUuid,
                            'answer': ownAnswer.description,
                            'selectedCount': selectedCounts
                        });
                    });
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
});

function getOwnAnswers (answers) {
    for (var i = 0; i < answers.length; i++) {
        if (answers[i].owned) {
            return answers[i];
        }
    }
}

function updateUsers (lobby, socket) {
    lobby.emitToLobby ('update users', {
        'userList' : lobby.getUsersInLobby(),
        'groupList' : lobby.getAllGroupsInLobby()
    });
}

function generateUUID () {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

module.exports.listen = listen;