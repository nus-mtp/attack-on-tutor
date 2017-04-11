angular.module('lobbyApp').controller ('tutorCtrl', function($scope, socket) {
	$scope.socket = socket;
    $scope.health = 100;
    $scope.maxHealth = 100;
	$scope.selectedGroups = [];
    $scope.composerQuestion = {
        'description' : ''
    };
    $scope.questions = {};

    socket.on ('login', function (data) {
        if (data.userType == 'tutor') {
            socket.on ('submit answer', function (data) {
                var question = $scope.questions[data.uuid];
                if (question) {
                    var groupAnswer = question.groupAnswers[data.answer.groupName];
                    if (groupAnswer) {
                        groupAnswer.answered = true;
                        groupAnswer.student = data.answer.student.username;
                        groupAnswer.description = data.answer.description;
                    }
                }
            });

            socket.on ('log question', function (data) {
                //Object to store the answers receieved from students later.
                var groupAnswers = {};
                data.question.groups.forEach (function (value) {
                    groupAnswers[value] = {
                        'student' : '',
                        'description' : '',
                        'explanation' : '',
                        'experience' : 0,
                        'answered' : false
                    };
                });

                $scope.questions[data.question.uuid] = {
                    'uuid' : data.question.uuid,
                    'description' : data.question.description,
                    'graded' : false,
                    'groupNames' : data.question.groups,
                    'groupAnswers' : groupAnswers,
                    'selectedGroup' : data.question.groups[0]
                };
            });

            socket.on ('reset health', function (data) {
                $scope.health = $scope.maxHealth;
            });
        }
    });

    $scope.inSelectedGroups = function (index) {
		return ($scope.selectedGroups.indexOf (index) > -1);
	};

	$scope.toggleSelectedGroup = function (index) {
		if ($scope.inSelectedGroups(index)) {
			delete $scope.selectedGroups[$scope.selectedGroups.indexOf (index)];
		} else {
            if (index == 0) {
                $scope.selectedGroups = [];
            }
            else
            {
                if ($scope.inSelectedGroups(0)) {
                    delete $scope.selectedGroups[$scope.selectedGroups.indexOf (0)];
                }
            }
			$scope.selectedGroups.push (index);
		}
	};

    $scope.setSelectedGroup = function (uuid, index) {
        var question = $scope.questions[uuid];

        if (index < question.groupNames.length && index >= 0) {
            question.selectedGroup = question.groupNames[index];
        }
    };

	$scope.sendQuestion = function () {
		var groupNames = [];
		$scope.selectedGroups.forEach (function (value) {
            if ($scope.socket.getSocketGroups()[value]) {
                groupNames.push ($scope.socket.getSocketGroups()[value]);
            }
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

    $scope.isQuestionAnswered = function (uuid) {
        var question = $scope.questions[uuid];

        for (var group in question.groupAnswers) {
            if (question.groupAnswers.hasOwnProperty (group)) {
                if (!question.groupAnswers[group].answered) {
                    return false;
                }
            }
        }
        return true;
    };

    $scope.gradeQuestion = function (uuid) {
        var question = $scope.questions[uuid];
        question.graded = true;

        healthLeft = $scope.health;
        for (var group in question.groupAnswers) {
            if (question.groupAnswers.hasOwnProperty (group)) {
                healthLeft = $scope.health - question.groupAnswers[group].experience;
                socket.emit ('damage shoutout', {
                    'group' : group,
                    'experience' : question.groupAnswers[group].experience
                });
            }
        }

        if (healthLeft > 0) {
            $scope.health = healthLeft;
        } else {
            $scope.health = 0;
            socket.emit ('experience payout');
        }

        socket.emit ('update health', $scope.health);

        socket.emit ('grade question', question);
    };
});