angular.module("dashboardApp", []);

angular.module("dashboardApp").controller ('userCtrl', function ($scope, $http) {

    $http({
        method: 'POST',
        url: '/api/dashboard/getUserInfo'
    }).then(function successCallback(response) {
        var userInfo = response.data.data;
        userInfo.tutorials = setLevelInfo(userInfo.tutorials);
        userInfo.name = toTitleCase(userInfo.name)
        $scope.userInfo = userInfo;
    }, function errorCallback(response) {
        console.log(response);
    });

});

angular.module("dashboardApp").controller ('moduleCtrl', function ($scope, $http, $q) {

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
            console.log(response);
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
        $scope.tuts = tuts;
    });

    $scope.leaderboardIsVisible = false;

    $scope.redirect = function(tut) {
        $('#form').attr('action', 'lobby/'+tut.coursecode+'/'+tut.name)
    }

    $scope.toggleLeaderboard = function(tut) {
        $scope.leaderboardIsVisible = !$scope.leaderboardIsVisible;
    }

});

/**
 * Calculates level-related user info
 * @param  user
 * @return user
 */
var setLevelInfo = function(tutArray) {
    var constant = 0.1;
    for (i = 0; i < tutArray.length; i++) {
        var tutObj = tutArray[i];
        var exp = tutObj.exp;
        tutObj.level = calculateLevel(exp);
        tutObj.currExp = exp - calculateExp(tutObj.level - 1);
        tutObj.totalToNext = calculateExp(tutObj.level + 1); - calculateExp(tutObj.level);
        tutObj.percentage = Math.floor(tutObj.currExp/tutObj.totalToNext * 100);
    }
    return tutArray;
}

var constant = 0.1;

/**
 * Calculates level based on exp
 * @param  {Integer} exp 
 * @return {Integer} level
 */
var calculateLevel = function (exp) {
    // Level = Constant * Sqrt(EXP)
    return Math.floor(constant * Math.sqrt(exp)) + 1;
}

/**
 * Calculates total exp needed to reach this level
 * @param  {Integer} level 
 * @return {Integer}       
 */
var calculateExp = function (level) {
    return Math.floor(Math.pow(level/constant, 2));
}


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
