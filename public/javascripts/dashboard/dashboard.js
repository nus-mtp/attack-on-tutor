angular.module("dashboardApp", []);

angular.module("dashboardApp").controller ('userCtrl', function ($scope, $http) {

    $http({
        method: 'POST',
        url: '/api/dashboard/getUserInfo'
    }).then(function successCallback(response) {
        var userInfo = response.data.data;
        userInfo.name = toTitleCase(userInfo.name)
        $scope.userInfo = userInfo;
    }, function errorCallback(response) {
        console.log(response);
    });

    $http({
        method: 'POST',
        url: '/api/lobby/getUsersInTutorial',
        data: { tutorialId: 'test2' }
    }).then(function successCallback(response) {
        console.log(response);
    }, function errorCallback(response) {
        console.log(response);
    });


});

angular.module("dashboardApp").controller ('moduleCtrl', function ($scope, $http, $q, $window) {

    var promises = [];
    var tuts = [];

    promises.push($http({

        method: 'POST',
        url: '/api/dashboard/forceSyncIVLE'

    }).then(function successCallback(response) {

    }, function errorCallback(response) {
        console.log('Error: ' + response.message);
    }));

    promises.push(
        $http({
            method: 'POST', 
            url: '/api/dashboard/getTutorials'
        }, function successCallback(response) {
            //console.log(response);
        }, function errorCallback(response) {
            console.log('Error: ' + response.message);
        })
    );

    $q.all(promises).then(function (responseArray) {
        if (responseArray.length == 1) { // if we aren't syncing with ivle
            tuts = responseArray[0].data.data.rows;
        } else {
            tuts = responseArray[1].data.data.rows;
        }
        for (i = 0; i < tuts.length; i++) { // set leaderboard visibility to false
            tuts[i].leaderboardIsVisible = false;
            tuts[i].index = i;
        }
        $scope.tuts = tuts;
    });

    $scope.redirect = function(tut) {
        $window.location.href = 'lobby/'+tut.coursecode+'/'+tut.name;
    }

    $scope.toggleLeaderboard = function(tut) {
        if (!$scope.tuts[tut.index].leaderboardIsVisible) {
            getTopStudents(tut);
        }
        $scope.tuts[tut.index].leaderboardIsVisible = !$scope.tuts[tut.index].leaderboardIsVisible;
    }

    var getTopStudents = function(tut) {
        $http({
                method: 'POST',
                url: '/api/dashboard/getTopUsers',
                data: { tid: tut.id }
        }).then( function successCallback(response) {
                $scope.tuts[tut.index].students = response.data.data;
                console.log(tuts[tut.index]);   
                console.log($scope.tuts[tut.index].students);
            }, function errorCallback(response) {
                console.log('Error: ' + response.message);
            });
    }

});



/**
 * Capitalization function
 * @param  {String}
 * @return {String}
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var logoutConfirmation = "Would You Like to Log Out?";
	
$("#logout").on
(
	"click",
	function(event)
	{
		Cookies.remove('token');
		location.reload();
	}
);
