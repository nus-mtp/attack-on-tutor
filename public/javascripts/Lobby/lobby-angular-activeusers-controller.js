angular.module('lobbyApp').controller ('activeUsersCtrl', function($scope, socket) {
	$scope.socket = socket;

	$scope.newGroupName = '';
	$scope.selectedGroup = 0;
	$scope.selectedUsers = [];

    $scope.users = {};
    
    //Socket events

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

    //Scope Functions

    $scope.setSelectedGroup = function (index) {
    	$scope.selectedGroup = index;
    };

    $scope.selectUser = function (socketId) {
    	var index = $scope.selectedUsers.indexOf (socketId);
    	if ( index < 0) {
    		$scope.selectedUsers.push (socketId);
    	} else {
    		$scope.selectedUsers.splice (index, 1);
    	}
    }

    $scope.isValidGroupParams = function () {
    	var groupName = cleanInput ($scope.newGroupName);
    	return (groupName.length > 0 && $scope.selectedUsers.length > 0);
    }

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

    $scope.deleteGroup = function () {
    	//Ensure the group to delete is not the default group.
    	if ($scope.selectedGroup > 0) {
    		
        	socket.emit ('delete group', {
        		'groupname' : cleanInput ($scope.socket.getAllSocketGroups()[$scope.selectedGroup])
        	});
        	$scope.selectedGroup = 0;
    	}
    };

    //Prevents input from having injected markup
    var cleanInput = function (input) {
        return $('<div/>').text(input).text();
    };
});