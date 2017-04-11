angular.module('lobbyApp').controller ('studentCtrl', function($scope, socket) {
	$scope.socket = socket;
    $scope.questions = {};
    
    //Socket events

	//Receives questions composed and sent by tutor.
    socket.on ('add question', function (data) {
    	var answers = [];
    	var tutors = [];
    	//Extract the students and tutors in the groupmates list and create separate lists of their data.
    	data.groupmates.forEach (function (groupmate, i) {
    		if (groupmate.userType == 'tutor') {
    			tutors.push (groupmate);
    		} else if (groupmate.userType == 'student') {
    			var owned = false;
    			if (groupmate.socketId == socket.socketId()) {
    				owned = true;
    			}
    			answers.push ({
    				'student' : groupmate,
    				'description' : '',
    				'selected' : false,
    				'owned' : owned,
    				'selectedCount' : 0
    			});
    		}
    	});

    	if (!$scope.questions[data.question.uuid]) {
    		$scope.questions[data.question.uuid] = {
        		'description' : data.question.description,
        		'answers' : answers,
        		'tutors' : tutors,
        		'uuid' : data.question.uuid,
                'submitted' : false
    		};
    	}
    });

    //Update answers composed by other users.
    socket.on ('update answer', function (data) {
    	updateAnswerCounts (data.questionUuid, data.selectedCount);
    	updateOtherAnswer (data.questionUuid, data.socketId, data.answer);
    });

    //Someone has submitted the answer.
    socket.on ('submit answer', function (data) {
        $scope.questions[data.uuid].submitted = true;
    });

    //Someone has submitted the answer.
    socket.on ('grade question', function (data) {
        var question = $scope.questions[data.questionUuid];

        question.graded = true;
        question.groupNames = data.groupNames;
        question.groupAnswers = data.gradedAnswers;
        question.selectedGroup = data.groupNames[0];
    });

    //Scope functions.

    $scope.updateAnswer = function (uuid) {
    	socket.emit ('update answer', {
    		'uuid' : uuid,
    		'answers' : $scope.questions[uuid].answers
    	});
    };

    $scope.selectAnswer = function (questionUuid, index) {
    	if ($scope.questions[questionUuid]) {
    		$scope.questions[questionUuid].answers.forEach (function (answer, i) {
    			answer.selected = false;
    		});
    		if ( $scope.questions[questionUuid].answers[index] ) {
    			$scope.questions[questionUuid].answers[index].selected = true;
    		}
    	}
    };

    var updateOtherAnswer = function (questionUuid, socketId, answerDescription) {
    	if ($scope.questions[questionUuid]) {
    		for (var i = 0; i < $scope.questions[questionUuid].answers.length; i++) {
        		if ($scope.questions[questionUuid].answers[i].student.socketId == socketId) {
        			$scope.questions[questionUuid].answers[i].description = answerDescription;
        			return true;
        		}
        	}
    	}
    	return false;
    };

    var updateAnswerCounts = function (questionUuid, selectedCounts) {
    	if ($scope.questions[questionUuid]) {
    		for (var answerSocketId in selectedCounts) {
    			if (selectedCounts.hasOwnProperty (answerSocketId)) {
    				for (var i = 0; i < $scope.questions[questionUuid].answers.length; i++) {
                		if ($scope.questions[questionUuid].answers[i].student.socketId == answerSocketId) {
                			$scope.questions[questionUuid].answers[i].selectedCount = selectedCounts[answerSocketId];
                		}
                	}
    			}
    		}	
    	}
    };

    $scope.hasAllVotes = function (questionUuid) {
    	if ($scope.questions[questionUuid]) {
    		for (var i = 0; i < $scope.questions[questionUuid].answers.length; i++) {
    			//Check own answer if everyone has selected it.
        		if ($scope.questions[questionUuid].answers[i].owned) {
        			//Currently, this checks if the selected count for this client's answer is equivalent to the number of answers that the group has.
        			//As each answer would correspond to a member in the group.
        			return $scope.questions[questionUuid].answers[i].selectedCount == $scope.questions[questionUuid].answers.length;
        		}
        	}
    	}
    	return false;
    };

    $scope.submitAnswer = function (questionUuid) {
        if ($scope.questions[questionUuid]) {
            var ownAnswer = getOwnAnswer (questionUuid);

            socket.emit ('submit answer', {
                'uuid' : questionUuid,
                'answer' : ownAnswer,
                'socketId' : socket.socketId()
            });

            $scope.questions[questionUuid].submitted = true;
        }
    };

    //Private functions.
    var getOwnAnswer = function (uuid) {
    	var ownedAnswer =  $scope.questions[uuid].answers.filter (function (value){
            return value.owned;
        });

        return ownedAnswer[0];
    };
});