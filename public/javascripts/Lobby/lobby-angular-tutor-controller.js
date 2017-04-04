angular.module('lobbyApp').controller ('tutorCtrl', function($scope, socket) {
	$scope.socket = socket;
	$scope.selectedGroups = [];
    $scope.composerQuestion = {
        'description' : ''
    };

    $scope.inSelectedGroups = function (index) {
		return ($scope.selectedGroups.indexOf (index) > -1);
	};

	$scope.toggleSelectedGroup = function (index) {
		if ($scope.inSelectedGroups(index)) {
			delete $scope.selectedGroups[$scope.selectedGroups.indexOf (index)];
		} else {
			$scope.selectedGroups.push (index);
		}
	};

	$scope.sendQuestion = function () {
		var groupNames = [];
		$scope.selectedGroups.forEach (function (value) {
			groupNames.push ($scope.socket.getSocketGroups()[value]);
		});
		socket.emit ('new question', {
			'question' : $scope.composerQuestion,
			'groups' : groupNames
		});
		$scope.composerQuestion = {
			'description' : ''
		};
		$scope.selectedGroups = [];
	};
});