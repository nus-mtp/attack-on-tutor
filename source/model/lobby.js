/**
 * Server side code for the lobby, manages socket events and communication between clients within the lobby page.
 *
 * @module model/lobby
 * @type {*|exports|module.exports}
*/

var app = require ('../../app');
var io = require ('socket.io')();
var TutorialModule = require ('./Tutorial');
var LobbyModule = require ('../controller/lobby');
var lobbyio = io.of ('/lobby');

var lobbyList =  new LobbyList();

var listen = function (server) {
	io.listen (server);
	console.log('Server Started and Socket listened on ' + server);
}

/**
 * List to store the all the lobbies in use.
 * Each tutorial group within a module will have its own lobby inside this list.
 * 2-Dimensional hashmap used to store lobbies, first key being the moduleId, and the second key the tutorialId.
 *
 * @constructor
 */

function LobbyList () {
    this.lobbyCount = 0,
    this.lobbies = {}
}

/**
 * Add a lobby to the LobbyList.
 *
 * @param {roomData}
 *      roomData {
 *          moduleId : {string},
 *          tutorialId : {string},
 *          namespace : {string} concatenation of the form "[moduleId]/[tutorialId]"
 *      }
 * @returns {lobby}
 */
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

/**
 * Get the lobby for the given module and tutorial id.
 *
 * @param {String} moduleId
 * @param {String} tutorialId
 * @returns {lobby}
 */
LobbyList.prototype.getLobby = function (moduleId, tutorialId) {
    if (this.lobbies[moduleId])
        return this.lobbies[moduleId][tutorialId];
    else
        return null;
}

/**
 * Lobby object to store the required data for the tutorial session.
 *
 * @constructor
 */
function Lobby () {
    this.tutorialId = '';
    this.moduleId = '';
	this.namespace = '';
    
	this.groupCount = 0;
	this.groups = {};

    this.questions = {};
    
    this.numUsers = 0;

    this.payoutExperience = 300;
}

/**
 * Wrapper to emit the message key with the appropriate callback value to the clients within the lobby.
 * Emit sends the message to ALL clients within the lobby.
 *
 * @param {String} key
 * @param value
 */
Lobby.prototype.emitToLobby = function (key, value) {
    if (this.namespace.length > 0)
        lobbyio.in (this.namespace).emit (key, value);
}

/**
 * Wrapper to emit the message key with the appropriate callback value to the clients within a subgroup inside the lobby.
 * Emit sends the message to ALL clients within the group.
 *
 * @param {String} group
 * @param {String} key
 * @param {Function} value
 */
Lobby.prototype.emitToGroup = function (group, key, value) {
    if (this.namespace.length > 0) {
        if (this.groups[group]) {
            lobbyio.in (this.namespace + '/' + group).emit (key, value);
        } else if (this.namespace == group) {
            this.emitToLobby (key, value);
        }
    }
}

/**
 * Wrapper to broadcast the message key with the appropriate callback value to the clients inside the lobby.
 * Broadcast sends the message to all clients BUT the socket that sent the message within the lobby.
 *
 * @param {socket} socket
 *      Socket object from socket.io.
 * @param {String} key
 * @param {Function} value
 */
Lobby.prototype.broadcastToLobby = function (socket, key, value) {
    if (this.namespace.length > 0) {
        socket.broadcast.to(this.namespace).emit (key, value);
    }
}

/**
 * Wrapper to broadcast the message key with the appropriate callback value to the clients within the subgroup inside the lobby.
 * Broadcast sends the message to all clients BUT the socket that sent the message within the group.
 *
 * @param {socket} socket
 *      Socket object from socket.io.
 * @param {String} group
 * @param {String} key
 * @param {Function} value
 */
Lobby.prototype.broadcastToGroup = function (socket, group, key, value) {
    if (this.namespace.length > 0) {
        if (this.groups[group]) {
            socket.broadcast.to(this.namespace + '/' + group).emit (key, value);
        } else if (this.namespace == group) {
            this.broadcastToLobby (socket, key, value);
        }
    }
}

/**
 * Parse the group name and append the namespace to it, so different lobby rooms can have subgroups with the same name.
 * Uses the '/' character as a delimiter between namespace and group name to differentiate socket.io rooms.
 * Groups can be imagined as a sub-directory within a namespace, but technically they are all socket.io rooms.
 * e.g. TT2010/G20/GroupName1, TT2010/G20/GroupName2 are two socket.io rooms that share a namespace.
 *
 * @param {String} group
 * @returns {String}
 */
Lobby.prototype.getRoomName = function (group) {
    if (this.groups[group]) {
        return this.namespace + '/' + group;
    } else if (this.namespace == group) {
        return this.namespace;
    }
}

/**
 * Retrieves user data from all the sockets in a socket.io room.
 * User data is returned as an array of objects in the following form:
 *      [{
 *          username: {string},
 *          userType: {string} with value 'student' || 'tutor',
 *          userId: {string},
 *          tutorialId: {string},
 *          socketId: {string}
 *      }]
 *
 * @param {String} roomName
 *      roomName must be in the form "[moduleId]/[tutorialId]/[group]"
 * @returns {Array}
 */
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
                        'userId' : lobbyio.connected[socketId].userId,
                        'tutorialId' : lobbyio.connected[socketId].tutorialId,
                        'socketId' : socketId
                    });
                }
            }
        }
    }
    return userSockets;
}

/**
 * Retrieves user data from all the sockets in ALL the socket.io room within the lobby.
 * User data is returned as an array of objects with groupname as the key and an array of the following object as the values:
 *      {
 *          {string} groupname: [{
 *              username: {string},
 *              userType: {string} with value 'student' || 'tutor',
 *              userId: {string},
 *              tutorialId: {string},
 *              socketId: {string}
 *          }]
 *      }
 *
 * @param {String} roomName
 *      roomName must be in the form "[moduleId]/[tutorialId]/[group]"
 * @returns {Object}
 */
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

/**
 * Add a group to the lobby.
 *
 * @param {String} group
 */
Lobby.prototype.addGroup = function (group) {
    if (!this.groups[group]) {
        this.groups[group] = group;
        this.groupCount++;
    }
}

/**
 * Remove a group from the lobby.
 * Sockets connected to the socket.io room for that group are removed from the group before the group is removed from the lobby.
 *
 * @param {String} group
 */
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

/**
 * Get all the groups in the lobby, including the namespace.
 *
 * @returns {Array} allGroups
 */
Lobby.prototype.getAllGroupsInLobby = function () {
    var allGroups = [];
    //Push the namespace, which is effectively a group containing all users in the tutorial.
    allGroups.push (this.namespace);
    for (group in this.groups) {
        allGroups.push ( group );
    }
    return allGroups;
}

/**
 * Add the socket to the socket.io room of that group.
 *
 * @param {socket} socket
 *      Socket object from socket.io.
 * @param {String} group
 */
Lobby.prototype.addSocketToGroup = function (socket, group) {
    if (this.groups[group]) {
        if (socket.group.length > 0 && socket.userType == 'student') {
            //Remove the socket from the group it is currently inside.
            socket.emit ('deleted group', socket.group);
            this.removeSocketFromGroup (socket, socket.group);
        }
        socket.join (this.namespace + '/' + group );
        socket.group = group;
    }
}

/**
 * Remove the socket from the socket.io room of that group.
 *
 * @param {socket} socket
 *      Socket object from socket.io.
 * @param {String} group
 */
Lobby.prototype.removeSocketFromGroup = function (socket, group) {
    if (this.groups[group]) {
        socket.leave (this.namespace + '/' + group);
        socket.group = "";
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
        socket.tutorialId = data.tutorialUuid;
		socket.moduleGroup = data.moduleId;
		socket.namespace = lobby.namespace;
        socket.userId = data.userId;
        socket.username = data.username;
        socket.userType = data.userRole;
        socket.group = "";

        //Join the main tutorial group room.
        socket.join ( lobby.namespace );
        socket.namespace = lobby.namespace;

        lobby.numUsers++;
        addedUser = true;
        
        //Update the client that login is successful after retrieving the neccessary data from the database.
        TutorialModule.findAndCountAllUsersInTutorial(socket.tutorialId).then(function (data) {
            var returnObj = LobbyModule.processLobbyUsers(data);
            if (socket.userType == 'student') {
                var studentAvatar = "";
                var studentExp = 0;
                //Get this socket's data from the list of students retrieved by the database call.
                for (var i = 0; i < returnObj.students.length; i++) {
                    if (returnObj.students[i].id == socket.userId) {
                        studentAvatar = returnObj.students[i].avatarId;
                        studentExp = returnObj.students[i].exp;
                        break;
                    }
                }

                socket.emit ('login', {
                    'tutorAvatar' : "/images/avatars/" + returnObj.tutor.avatarId + ".png",
                    'tutorName' : returnObj.tutor.name,
                    'userAvatar' : "/images/avatars/" + studentAvatar + ".png",
                    'experience' : studentExp,
                    'userType': socket.userType,
                    'username': socket.username,
                    'numUsers': lobby.numUsers,
                    'defaultGroup': lobby.namespace
                });
            } else {
                socket.emit ('login', {
                    'userAvatar' : "/images/avatars/" + returnObj.tutor.avatarId + ".png",
                    'userType': socket.userType,
                    'username': socket.username,
                    'numUsers': lobby.numUsers,
                    'defaultGroup': lobby.namespace
                });
            }

            //Update the active users list in the other clients.
            updateUsers (lobby, socket);
        
            //Update all clients whenever a user successfully joins the lobby.
            socket.broadcast.to(socket.namespace).emit ('user joined', {
                'username': socket.username,
                'numUsers': lobby.numUsers
            });
        });

        //Initialise the other listeners
        if (addedUser) {
            socket.on ('new message', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                lobby.broadcastToGroup (socket, data.group, 'new message', {
                    'username': socket.username,
                    'message': data.message,
                    'group': data.group
                });
            });

            socket.on ('typing', function (data) {
                socket.broadcast.to(socket.namespace).emit ('typing', {
                    'username': socket.username,
                    'group': data
                });
            });

            socket.on ('stop typing', function () {
                socket.broadcast.to(socket.namespace).emit ('stop typing', {
                    'username': socket.username
                });
            });
            
            //Add or remove sockets from groups.
            socket.on ('edit group', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var socketIds = data.socketIds;
                var groupname = data.groupname;
                lobby.addGroup (groupname);
                for (var index in socketIds) {
                    if (lobbyio.connected[socketIds[index]]) {
                        lobby.addSocketToGroup (lobbyio.connected[socketIds[index]], groupname);
                        //Tell that socket they have been added to a group to update chat channels.
                        lobbyio.to(socketIds[index]).emit ('added group', groupname);
                    }
                }
                //Update active users list for all connected sockets.
                updateUsers (lobby, socket);
            });

            socket.on ('delete group', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var groupname = data.groupname;
                var usersInGroup = lobby.getUsersInRoom(groupname);
                usersInGroup.forEach (function (value, i) {
                    //Tell socket to remove chat channel of that group.
                    lobbyio.to(value.socketId).emit ('deleted group', groupname);
                });
                lobby.removeGroup (groupname);
                updateUsers (lobby, socket);
            });

            //Parse tutor's question to be sent to all student clients.
            socket.on ('new question', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);

                data.question.completed = false;
                data.question.graded = false;
                data.question.uuid = generateUUID();
                data.question.groups = data.groups;
                data.question.selectedAnswers = {};
                data.question.answers = {};
                data.question.sourceSocket = socket.id;

                lobby.questions[data.question.uuid] = data.question;

                //Send the parsed question back to the source socket so they can log the question parameters. (uuid)
                socket.emit ('log question', {
                    'question' : data.question
                });

                //Send this question to all the other sockets in the groups that were selected by the tutor.
                data.groups.forEach (function (groupName, i) {
                    lobby.broadcastToGroup (socket, groupName, 'add question', {
                        'username': socket.username,
                        'groupmates': lobby.getUsersInRoom (groupName),
                        'question': data.question
                    });
                });
            });

            //Send tutor's graded answers/experience to the students.
            socket.on ('grade question', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                lobby.questions[data.uuid]['groupAnswers'] = data.groupAnswers;

                //Send each group's answers to all the other groups.
                lobby.questions[data.uuid].groups.forEach (function (groupName, i) {
                    lobby.broadcastToGroup (socket, groupName, 'grade question', {
                        'username': socket.username,
                        'questionUuid': data.uuid,
                        'groupNames' : lobby.questions[data.uuid].groups,
                        'gradedAnswers': lobby.questions[data.uuid].groupAnswers
                    });
                });

                //Assign the experience points to each student member of the group.
                lobby.questions[data.uuid].groups.forEach (function (groupName, i) {
                    var socketsInGroup = lobby.getUsersInRoom (groupName);
                    socketsInGroup.forEach (function (socketClient, i) {
                        if (socketClient.userType == 'student') {
                            TutorialModule.changeExp (socketClient.userId, socketClient.tutorialId, lobby.questions[data.uuid].groupAnswers[groupName].experience);
                        }
                    });
                });
            });

            //Send group answer to tutor for grading.
            socket.on ('submit answer', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var question = lobby.questions[data.uuid];

                //Get the group name of this socket so the tutor knows which group the answer belongs to.
                data.answer['groupName'] = socket.namespace;
                if (socket.group.length > 0) {
                    var groupIndex = question.groups.indexOf (socket.group);
                    if (groupIndex > -1) {
                        data.answer['groupName'] = socket.group;
                    }
                }
                lobby.emitToGroup (data.answer['groupName'], 'submit answer', data);
            });

            //Update the answer and votes given by one student for the other students in the group.
            socket.on ('update answer', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                var questionUuid = data.uuid;
                var question = lobby.questions[questionUuid];
                var answers = data.answers;
                var ownAnswer = getOwnAnswers (data.answers);

                //Save the user's answer or update if it already exists on the server side.
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

                if (question) {
                    if (socket.group.length > 0) {
                        lobby.emitToGroup (socket.group, 'update answer', {
                            'socketId': socket.id,
                            'questionUuid': questionUuid,
                            'answer': ownAnswer.description,
                            'selectedCount': selectedCounts
                        });
                    } else { //The socket has no group and the question was addressed to the whole class.
                        lobby.emitToGroup (socket.namespace, 'update answer', {
                            'socketId': socket.id,
                            'questionUuid': questionUuid,
                            'answer': ownAnswer.description,
                            'selectedCount': selectedCounts
                        });
                    }
                }
            });

            //Send to the whole lobby including the source socket whenever the tutor receives damage (i.e. grades a question.)
            socket.on ('damage shoutout', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                lobby.emitToLobby ('damage shoutout', data);
            });

            //Grant experience to all students in the lobby when the tutor's health is reduced to 0.
            socket.on ('experience payout', function (uuid) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);

                lobby.questions[uuid].groups.forEach (function (groupName, i) {
                    var socketsInGroup = lobby.getUsersInRoom (groupName);
                    socketsInGroup.forEach (function (socketClient, i) {
                        if (socketClient.userType == 'student') {
                            TutorialModule.changeExp (socketClient.userId, socketClient.tutorialId, lobby.payoutExperience);
                        }
                    });
                });


                lobby.emitToLobby ( 'experience payout', {
                    'exp' : lobby.payoutExperience,
                    'message': "The mighty fall, and " + socket.username + " has lost one of their many lives. " + lobby.payoutExperience + " experience points for all!"
                });

                socket.emit ('reset health');
            });

            //Update student clients with the tutor's health.
            socket.on ('update health', function (data) {
                var lobby = lobbyList.getLobby(socket.moduleGroup, socket.tutorialGroup);
                lobby.broadcastToLobby (socket, 'update health', data);
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

/**
 * Get the student's answers from a list of answers recieved from student client.
 *
 * @param {Array} answers
 *      Array of answer objects defined on client side.
 * @returns {Object} answer
 */
function getOwnAnswers (answers) {
    for (var i = 0; i < answers.length; i++) {
        if (answers[i].owned) {
            return answers[i];
        }
    }
}

/**
 * Update all clients connected to the lobby with the latest grouping and users.
 *
 * @param {Object} lobby
 *      Lobby object
 * @param {Object} socket
 *      Socket object from socket.io
 */
function updateUsers (lobby, socket) {
    lobby.emitToLobby ('update users', {
        'userList' : lobby.getUsersInLobby(),
        'groupList' : lobby.getAllGroupsInLobby()
    });
}

/**
 * Generate a UUID.
 *
 * @returns {String} uuid
 */
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