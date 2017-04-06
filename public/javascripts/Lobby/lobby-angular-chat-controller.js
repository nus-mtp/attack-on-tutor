angular.module('lobbyApp').controller ('chatCtrl', function ($scope, $window, socket) {
	$scope.socket = socket;

    $scope.chatMessage = "";
    $scope.selectedGroup = 0;
    $scope.defaultGroup = "";
	$scope.messages = {};
	$scope.typingMessages = [];
    
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
	var lastTypingTime;
    
    var typing = false;
	
	var username = $window.userId;

    //Socket listeners
    
    //Whenever the server emits 'login', log the login message
    socket.on ('login', function (data) {
        //Display the welcome message
        $scope.defaultGroup = data.defaultGroup;
        var message = "Welcome to the lobby!";
        logMessage ({
			'type' : 'log',
			'message': message
		}, data.defaultGroup);
        addParticipantsMessage (data);

        username = data.username;
    });

    //Whenever the server emits 'new message', update the chat body
    socket.on ('new message', function (data) {
        addChatMessage (data, data.group);
    });
	
	// Whenever the server emits 'user joined', log it in the chat body
    socket.on ('user joined', function (data) {
        logMessage ({
			'type' : 'log',
			'message' : data.username + ' joined'
		}, $scope.defaultGroup);
        addParticipantsMessage (data);
    });

    //Whenever the server emits 'user left', log it in the chat body
    socket.on ('user left', function (data) {
        logMessage ({
			'type' : 'log',
			'message' : data.username + ' left'
		}, $scope.defaultGroup);
        addParticipantsMessage (data);
        removeChatTyping (data);
    });

    //Whenever the server emits 'typing', show the typing message
    socket.on ('typing', function (data) {
        addChatTyping(data);
    });

    //Whenever the server emits 'stop typing', kill the typing message
    socket.on ('stop typing', function (data) {
        removeChatTyping(data);
    });

    socket.on ('update users', function (data) {
    	if (!$scope.messages[data.groupList[0]]) {
			$scope.messages[data.groupList[0]] = [];
    	}
        
    });

    socket.on ('added group', function (data) {
    	if (!$scope.messages[data]) {
    		$scope.messages[data] = [];
    	}
    });

    socket.on ('deleted group', function (data) {
    	$scope.selectedGroup = 0;
        delete $scope.messages[data];
    });
	
    //Scope functions.
    $scope.setSelectedGroup = function (index) {
    	$scope.selectedGroup = index;
    };

	//Sends a chat message
    $scope.sendMessage = function () {
        var message = $scope.chatMessage;
        //Prevent markup from being injected into the message
        message = cleanInput(message);
        //If there is a non-empty message
        if (message) {
            $scope.chatMessage="";
            
            addChatMessage({
                'username': username,
                'message': message
            }, socket.getSocketGroups()[$scope.selectedGroup]);
            
            //Tell server to execute 'new message' and send along one parameter
            socket.emit ('new message', {
            	'message' : message,
            	'group' : socket.getSocketGroups()[$scope.selectedGroup]
            });
        }
		
		socket.emit('stop typing');
		typing = false;
    };
	
	//Gets the color of a username through our hash function
    $scope.getUsernameColor = function (username) {
        //Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        
        //Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    };
	
	// Updates the typing event
    $scope.updateTyping = function () {
        if (!typing) {
            typing = true;
            socket.emit ('typing', socket.getSocketGroups()[$scope.selectedGroup]);
        }
        
        lastTypingTime = (new Date()).getTime();
        setTimeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit ('stop typing');
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    };
	
	//Private functions.
	
	//Prevents input from having injected markup
    var cleanInput = function (input) {
        return $('<div/>').text(input).text();
    };

    var logMessage = function (message, groupname) {
        if (!$scope.messages[groupname]) {
        	$scope.messages[groupname] = [];
        }
        $scope.messages[groupname].push(message);

        //$('.chat-area')[0].scrollTop = $('.chat-area')[0].scrollHeight;
    };
	
	var addParticipantsMessage = function (data) {
        var message = '';
        if (data.numUsers === 1) {
            message += "This is a lonely place.";
        } else {
            message += "There are " + data.numUsers + " players in the lobby";
        }
        logMessage ({
			'type' : 'log',
			'message' : message
		}, $scope.defaultGroup);
    };
	
    var addChatMessage = function (data, groupname) {
        logMessage ({
			'user' : data.username,
			'type' : 'chat',
			'message' : data.message
		}, groupname);
    };
	
    var addChatTyping = function (data) {
    	if (socket.getSocketGroups().indexOf (data.group) >= 0) {
        	$scope.typingMessages.push({
            	'user' : data.username,
            	'message' : 'is typing in : ' + data.group
            });
        }
    };

    var removeChatTyping = function (data) {
    	var indexToRemove = [];
    	$scope.typingMessages.forEach (function (value, i) {
	    	if (value.user == data.username) {
        		indexToRemove.push (i);
        	}
		});
		indexToRemove.forEach (function (value, i) {
	    	$scope.typingMessages.splice (value, 1);
		});
    };
});