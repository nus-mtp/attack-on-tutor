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

    $scope.redirect = function(tut) {
        $('#form').attr('action', 'lobby/'+tut.coursecode+'/'+tut.name)
    }

    $scope.getLeaderboard = function(tut) {
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
        tutObj.level = Math.floor(constant * Math.sqrt(exp));
        tutObj.currExp = exp - Math.floor(Math.pow((tutObj.level - 1)/constant, 2))
        tutObj.totalToNext = Math.floor(Math.pow((tutObj.level + 1)/constant, 2)) - Math.floor(Math.pow(tutObj.level/constant, 2));
        tutObj.percentage = Math.floor(tutObj.currExp/tutObj.totalToNext * 100);
    }
    return tutArray;
}


/**
 * Capitalization function
 * @param  {String}
 * @return {String}
 */
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}