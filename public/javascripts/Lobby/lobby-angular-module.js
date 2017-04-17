angular.module('lobbyApp', ['ngSanitize']);

//Factory for wrapping socketio as listeners are async and require manually updating angular.
angular.module('lobbyApp').factory('socket', function ($rootScope, $window) {
	var connect = function (namespace) {
	    return io.connect(namespace, {
	       query: 'namespace=' + namespace
	    });
	}

	var connectionStates = [
		'pending',
		'invalid',
		'connected'
	];
	var connectionState = connectionStates[0];

	var socket = connect('/' + 'lobby');
	var userType = '';

	var socketGroups = [];
	var allSocketGroups = [];
	
	return {
		//Connection State functions
		getConnectionState: function () {
			return connectionState;
		},
		setConnectionState: function (value) {
			connectionState = value;
		},
		PENDING: function() {
			return connectionStates[0];
		},
		INVALID: function() {
			return connectionStates[1];
		},
		CONNECTED: function () {
			return connectionStates[2];
		},
		//User Type functions
		getUserType: function () {
			return userType;
		},
		setUserType: function (type) {
			userType = type;
		},
		//Socket Group functions
		addSocketGroup: function (groupName) {
			socketGroups.push (groupName);
		},
		removeSocketGroup: function (groupName) {
			var index = socketGroups.indexOf (groupName);
			if (index > -1) {
				socketGroups.splice(index, 1);
			}
		},
		getSocketGroups: function () {
			return socketGroups;
		},
		setAllSocketGroups: function (allGroups) {
			allSocketGroups = allGroups;
		},
		getAllSocketGroups: function () {
			return allSocketGroups;
		},
		socketId: function () {
			return socket.nsp + '#' + socket.id;
		},
		//Wrappers for Socket IO client functions.
		on: function (eventName, callback) {
			socket.on (eventName, function () {  
				var args = arguments;
				$rootScope.$apply (function () {
					callback.apply (socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply (function () {
					if (callback) {
						callback.apply (socket, args);
					}
				});
			})
		}
	};	
});

//Directive for calling function on enter key
//Usage:
//		ng-enter="functionName()"
angular.module('lobbyApp').directive ('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if (event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
});