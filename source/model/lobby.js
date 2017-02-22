var app = require ('../../app');
var io = require ('socket.io')();

var listen = function (server) {
	io.listen (server);
	console.log('Server Started and Socket listened on ' + server);
}

function LobbyList () {
    this.lobbyCount = 0,
    this.lobbies = {}
}

LobbyList.prototype.addLobby = function (roomData) {
    if (!this.lobbies[roomData.tutorialId]) {
        this.lobbies[roomData.tutorialId] = new Lobby();
        this.lobbies[roomData.tutorialId].tutorialId = roomData.tutorialId;
        this.lobbies[roomData.tutorialId].moduleId = roomData.moduleId;
        this.lobbyCount++;
    }
}

LobbyList.prototype.getLobby = function (tutorialId) {
    return this.lobbies[tutorialId];
}

var lobbyList =  new LobbyList();

function Lobby () {
    this.tutorialId = '';
    this.moduleId = '';
    
	this.locked = false;
	this.tutors = {};
    
	this.groupCount = 0;
	this.groups = {};
    
    this.numUsers = 0;
    
    //var defaultGroup = new Group ('default_group');
	//this.groups[defaultGroup.groupId] = defaultGroup;
}

Lobby.prototype.emit = function (key, value) {
    io.sockets.in ( this.tutorialId ).emit (key, value);
}

//On connection of each new client socket.
io.on ('connection', function (socket) {
    var addedUser = false;
    
    //Listen for new connections and create a lobby if one does not exist yet.
    socket.on ('new connection', function (data) {
        //Add a lobby to the lobbyList.
        lobbyList.addLobby ({
            'tutorialId' : data.tutorialId,
            'moduleId' : data.moduleId
        });
        socket.tutorialGroup = data.tutorialId;
        socket.join ( data.tutorialId );
        socket.userId = data.userId;
    });

    //Listen and execute broadcast of message on receiving 'new message' emission from the client.
    socket.on ('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.to(socket.tutorialGroup).emit ('new message', {
            username: socket.username,
            message: data
        });
    });

    //Listen and execute handling of new client socket on receiving 'add user' emission from the client.
    socket.on ('add user', function (username) {
        if (addedUser) {
            return;
        }
        var lobby = lobbyList.getLobby(socket.tutorialGroup);
        //Store the username in the socket session for this client.
        socket.username = username;
        lobby.numUsers++;
        addedUser = true;
        
        //Update the client that login is successful.
        socket.emit ('login', {
            numUsers: lobby.numUsers
        });
        
        //Update all clients whenever a user successfully joins the lobby.
        socket.broadcast.to(socket.tutorialGroup).emit ('user joined', {
            username: socket.username,
            numUsers: lobby.numUsers
        });
    });

    //Broadcast that the client is typing a message to other clients connected.
    socket.on ('typing', function () {
        socket.broadcast.to(socket.tutorialGroup).emit ('typing', {
            username: socket.username
        });
    });

    //Broadcast when the client stops typing a message to other clients connected.
    socket.on ('stop typing', function () {
        socket.broadcast.to(socket.tutorialGroup).emit ('stop typing', {
            username: socket.username
        });
    });

    //Listen to when the client disconnects and execute.
    socket.on ('disconnect', function () {
        if (addedUser) {
            var lobby = lobbyList.getLobby(socket.tutorialGroup);
            --lobby.numUsers;

            //Broadcast to other clients that this client has disconnected
            socket.broadcast.to(socket.tutorialGroup).emit ('user left', {
                username: socket.username,
                numUsers: lobby.numUsers
            });
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

        socket.broadcast.to(socket.tutorialGroup).emit ('battle created', {
            username: socket.username,
            gameId: gameId
        });
    });
});

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