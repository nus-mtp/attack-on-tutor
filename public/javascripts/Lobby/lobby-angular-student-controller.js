/**
 * Controller for the student functionalities within the lobby.
 * Front-end javascript code inside public folder.
 *
 * @module javascripts/lobby/lobby-angular-student-controller
 */
angular.module('lobbyApp').controller ('studentCtrl', function($scope, socket) {
	$scope.socket = socket;
    $scope.tutorInfo = {
        'imgSrc' : '',
        'username' : ''
    }
    $scope.health = 100;
    $scope.maxHealth = 100;

    $scope.userInfo = {
        'imgSrc' : '',
        'exp' : 0
    };
    
    $scope.questions = {};
    
    /*
     *   Listeners for student client.
     */

    //Listen for login response from server before initialising everything else.
    socket.on ( 'login', function (data) { 
        
        $scope.userInfo.imgSrc = data.userAvatar;
        $scope.userInfo.exp = data.experience;
        $scope.userInfo.level = $scope.calculateLevel($scope.userInfo.exp);
        $scope.userInfo.expToNext = $scope.expToNextLevel($scope.userInfo.level + 1);

        $scope.tutorInfo.imgSrc = data.tutorAvatar;
        $scope.tutorInfo.username = data.tutorName;

        //Ensure the user logged in is a student, otherwise do not initialise all these socket listeners.
        if (data.userType == 'student') {
            //Receives questions composed and sent by tutor
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

            //Update answers composed by other students.
            socket.on ('update answer', function (data) {
            	updateAnswerCounts (data.questionUuid, data.selectedCount);
            	updateOtherAnswer (data.questionUuid, data.socketId, data.answer);
            });

            //Someone has submitted the answer.
            socket.on ('submit answer', function (data) {
                $scope.questions[data.uuid].submitted = true;
            });

            //Show the grades from the tutor for the answers provided by each group.
            socket.on ('grade question', function (data) {
                var question = $scope.questions[data.questionUuid];

                question.graded = true;
                question.groupNames = data.groupNames;
                question.groupAnswers = data.gradedAnswers;
                question.selectedGroup = data.groupNames[0];
            });

            socket.on ('update health', function (data) {
                $scope.health = data;
            });

            socket.on ('experience payout', function (data) {
                $scope.userInfo.exp += data.exp;
                $scope.userInfo.level = $scope.calculateLevel($scope.userInfo.exp);
                $scope.userInfo.expToNext = $scope.expToNextLevel($scope.userInfo.level + 1);
            });

            socket.on ('damage shoutout', function (data) {
                $scope.userInfo.exp += data.experience;
                $scope.userInfo.level = $scope.calculateLevel($scope.userInfo.exp);
                $scope.userInfo.expToNext = $scope.expToNextLevel($scope.userInfo.level + 1);
            });
        }
    });

    /*
     *  Scope functions used by angular in the DOM.
     */

     /**
     * Send the updates from this student's answers to the server.
     *
     * @param {String} uuid
     */
    $scope.updateAnswer = function (uuid) {
    	socket.emit ('update answer', {
    		'uuid' : uuid,
    		'answers' : $scope.questions[uuid].answers
    	});
    };

    /**
     * Select the answer with the given index for voting.
     *
     * @param {String} questionUuid
     * @param {Integer} index
     */
    $scope.selectAnswer = function (questionUuid, index) {
    	if ($scope.questions[questionUuid]) {
            //Remove the vote from the other answers if any.
    		$scope.questions[questionUuid].answers.forEach (function (answer, i) {
    			answer.selected = false;
    		});
    		if ( $scope.questions[questionUuid].answers[index] ) {
    			$scope.questions[questionUuid].answers[index].selected = true;
    		}
    	}
    };

    /**
     * Calculate the student's level given the experience.
     *
     * @param {Integer} exp
     * @returns {Integer}
     */
    $scope.calculateLevel = function (exp) {
        return Math.floor(0.1 * Math.sqrt(exp)) + 1;
    };

    /**
     * Calculate the experience needed to reach the next level.
     *
     * @param {Integer} level
     * @returns {Integer}
     */
    $scope.expToNextLevel = function (level) {
        return Math.pow ( ((level - 1) / 0.1 ), 2);
    };

    /**
     * Update the answers given by the other students in the group.
     *
     * @param {String} questionUuid
     * @param {String} socketId
     * @param {String} answerDescription
     * @returns {Boolean}
     */
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

    /**
     * Update the votes given by the other students in the group.
     *
     * @param {String} questionUuid
     * @param {Object} selectedCounts
     *      Hash map with socketId of the student as key and number of votes for said student's answer as the value.
     */
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

    /**
     * Check if this student's answer received all the other students votes.
     *
     * @param {String} questionUuid
     * @returns {Boolean}
     */
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

    /**
     * Send this student's answer to the server.
     *
     * @param {String} questionUuid
     */
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

    /*
     *  Private functions used within the controller.
     */

    /**
     * Get this student's answer.
     *
     * @param {String} uuid
     * @returns {Object}
     */
    var getOwnAnswer = function (uuid) {
    	var ownedAnswer =  $scope.questions[uuid].answers.filter (function (value){
            return value.owned;
        });

        return ownedAnswer[0];
    };
});