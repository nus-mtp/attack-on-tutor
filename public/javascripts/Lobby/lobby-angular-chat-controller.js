/**
 * Controller for the chat functionalities within the lobby.
 * Front-end javascript code inside public folder.
 *
 * @module javascripts/lobby/lobby-angular-chat-controller
 */
angular.module('lobbyApp').controller ('chatCtrl', function ($scope, $window, socket) {
	$scope.socket = socket;

    $scope.chatMessage = "";
    $scope.selectedGroup = 0;
    $scope.defaultGroup = "";
	$scope.messages = {};
	$scope.typingMessages = [];
    
    //Fade timer for the typing messages.
    var FADE_TIME = 150; //ms
    var TYPING_TIMER_LENGTH = 400; //ms

    //Colors for the usernames.
    var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
	var lastTypingTime;
    
    var typing = false;
	
	var username = $window.userId;

    /*
     *   Listeners for chat client.
     */
    
    //Whenever the server emits 'login', log the login message.
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

    //Add the new group to this client's chat channels.
    socket.on ('update users', function (data) {
    	if (!$scope.messages[data.groupList[0]]) {
			$scope.messages[data.groupList[0]] = [];
    	}
    });

    //Open this chat channel when this client has been added to a chat channel.
    socket.on ('added group', function (data) {
    	if (!$scope.messages[data]) {
    		$scope.messages[data] = [];
    	}
    });

    //Clear the chat channel's data when this client has been removed from the group.
    socket.on ('deleted group', function (data) {
    	$scope.selectedGroup = 0;
        delete $scope.messages[data];
    });

    socket.on ('damage shoutout', function (data) {
        var message = data.group + " doth dealt " + data.experience + " damage to the great beast.";
        for (var i = 0; i < socket.getSocketGroups().length; i++) {
            logMessage ({
                'type' : 'damagelog',
                'message' : message
            }, socket.getSocketGroups()[i]);
        }
    });

    socket.on ('experience payout', function (data) {
        //Display the welcome message
        $scope.defaultGroup = data.defaultGroup;
        for (var i = 0; i < socket.getSocketGroups().length; i++) {
            logMessage ({
                'type' : 'damagelog',
                'message' : data.message
            }, socket.getSocketGroups()[i]);
        }
    });
	
    /*
     *  Scope functions used by angular in the DOM.
     */

     /**
     * Set the group with the given index as the selected chat channel.
     *
     * @param {Integer} index
     */
    $scope.setSelectedGroup = function (index) {
    	$scope.selectedGroup = index;
    };

     /**
     * Send a message to the server.
     */
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

    /**
    * Get the color of a username through a hash function
    *
    * @param {String} username
    * @returns {String} color
    */
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
	
	/**
    * Update the server whenever this client starts/stops typing.
    */
    $scope.updateTyping = function () {
        if (!typing) {
            typing = true;
            //Send the typing event to other users with the group name of the chat channel this user is typing into.
            socket.emit ('typing', socket.getSocketGroups()[$scope.selectedGroup]);
        }
        
        //Timer to track when was the last keystroke by the user in the input field.
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
	
	/*
     *  Private functions used within the controller.
     */
	
	/**
    * Prevents input from having injected markup.
    *
    * @param {String} input
    * @returns {String} parsed
    */
    var cleanInput = function (input) {
        return $('<div/>').text(input).text();
    };

    /**
    * Insert message into chat log.
    *
    * @param {String} message
    * @param {String} groupname
    */
    var logMessage = function (message, groupname) {
        if (!$scope.messages[groupname]) {
        	$scope.messages[groupname] = [];
        }
        $scope.messages[groupname].push(message);

        //Scroll chat window to the last received message.
        $('.chat-area')[0].scrollTop = $('.chat-area')[0].scrollHeight;
    };
	
    /**
    * Wrapper for logMessage used for logging participants entering/leaving lobby.
    *
    * @param {Object} data
    */
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
	
    /**
    * Wrapper for logMessage to log messages from users.
    *
    * @param {Object} data
    * @param {String} groupname
    */
    var addChatMessage = function (data, groupname) {
        logMessage ({
			'user' : data.username,
			'type' : 'chat',
			'message' : data.message
		}, groupname);
    };
	
    /**
    * Wrapper for logMessage used for "[user] is typing" messages.
    *
    * @param {Object} data
    */
    var addChatTyping = function (data) {
        //Display only if this socket client is a member of a group that the message is being typed in.
    	if (socket.getSocketGroups().indexOf (data.group) >= 0) {
        	$scope.typingMessages.push({
            	'user' : data.username,
            	'message' : 'is typing in: ' + data.group
            });
        }
    };

    /**
    * Remove "[user] is typing" message belonging to a specific user.
    *
    * @param {Object} data
    */
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