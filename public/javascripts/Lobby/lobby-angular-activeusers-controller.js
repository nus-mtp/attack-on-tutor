/**
 * Controller for users list and group management functionalities on client side.
 * Front-end javascript code inside public folder.
 *
 * @module javascripts/lobby/lobby-angular-activeusers-controller
 */
angular.module('lobbyApp').controller ('activeUsersCtrl', function($scope, socket) {
	$scope.socket = socket;

	$scope.newGroupName = '';
	$scope.selectedGroup = 0;
	$scope.selectedUsers = [];

    $scope.users = {};
    
    /*
     *   Listeners for active users list.
     */

    socket.on ('update users', function (data) {
        $scope.users = data.userList;
        $scope.socket.setAllSocketGroups (data.groupList);
        if ( $scope.socket.getSocketGroups().length == 0) {
        	$scope.socket.addSocketGroup (data.groupList[0]);
        }
    });

    socket.on ('added group', function (data) {
    	$scope.socket.addSocketGroup ( data );
    });

    socket.on ('deleted group', function (data) {
    	$scope.socket.removeSocketGroup ( data );
    });

    /*
     *  Scope functions used by angular in the DOM.
     */

    /**
    * Set the active users list to display the users in the selected group.
    *
    * @param {Integer} index
    */
    $scope.setSelectedGroup = function (index) {
    	$scope.selectedGroup = index;
    };

    /**
    * Select the current user given by their socket id in the active users list.
    *
    * @param {String} socketId
    */
    $scope.selectUser = function (socketId) {
    	var index = $scope.selectedUsers.indexOf (socketId);
    	if ( index < 0) {
    		$scope.selectedUsers.push (socketId);
    	} else {
    		$scope.selectedUsers.splice (index, 1);
    	}
    }

    /**
    * Check if there is a groupname and users selected before making the group.
    *
    */
    $scope.isValidGroupParams = function () {
    	var groupName = cleanInput ($scope.newGroupName);
    	return (groupName.length > 0 && $scope.selectedUsers.length > 0);
    }

    /**
    * Create or edit the group with the selected users and group name.
    *
    */
    $scope.createGroup = function () {
    	if ($scope.selectedUsers.indexOf (socket.socketId()) < 0) {
    		$scope.selectedUsers.push (socket.socketId());
    	}
    	socket.emit ('edit group', {
    		'groupname' : cleanInput ($scope.newGroupName),
    		'socketIds' : $scope.selectedUsers
    	});
    	$scope.selectedUsers = [];
    	$scope.newGroupName = '';
    };

    /**
    * Delete the group.
    *
    */
    $scope.deleteGroup = function () {
    	//Ensure the group to delete is not the default group.
    	if ($scope.selectedGroup > 0) {
    		
        	socket.emit ('delete group', {
        		'groupname' : cleanInput ($scope.socket.getAllSocketGroups()[$scope.selectedGroup])
        	});
        	$scope.selectedGroup = 0;
    	}
    };

    /**
    * Prevents input from having injected markup.
    *
    * @param {String} input
    * @returns {String} parsed
    */
    var cleanInput = function (input) {
        return $('<div/>').text(input).text();
    };
});