angular.module("dashboardApp", []);

// angular.module("dashboardApp").factory ('ivle', function ($rootScope) {
//     var tutorials = [];
//     var userInfo = {};

//     var syncIVLE = function () {
//         $.ajax({
//             method:'POST',
//             url:'/api/dashboard/forceSyncIVLE',
//             dataType:'json',
//             success: function(data){
//                 if (data.success){
//                     console.log("Successful Sync");
//                     getTutorials();
//                 }
//                 else {  
//                     console.log('Failed Sync, Error: ' + data.message);
//                 }
//             }
//         });
//     };

//     var getTutorials = function () {
//         $.ajax({
//             type: 'POST',
//             url: '/api/dashboard/getTutorials',
//             data: { },
//             dataType: 'json',
//             success: function(data) {
//                 tutorials = data.data.rows;
//                 $rootScope.$apply();
//             }
//         });
//     };

//     var syncUser = function() {
//         $.ajax({
//             method: 'POST',
//             url: '/api/dashboard/syncUser',
//             dataType: 'json',
//             success: function(data) {
//                 if (data.success) {
//                     userInfo = setUserLevelInfo(data.data);
//                     $rootScope.$apply();
//                 } else {
//                     console.log('Failed Sync, Error: ' + data.message);
//                 }
//             }
//         });
//     }

//     //syncIVLE();
//     getTutorials();
//     syncUser();

//     return {
//         tutorials: function () {
//             return tutorials;
//         },
//         userInfo: function() {
//             return userInfo;
//         }
//     };
// });

angular.module("dashboardApp").controller ('userCtrl', function ($scope, $http) {

    var userInfo = {};

    $http({
        method: 'POST',
        url: '/api/dashboard/syncUser'
    }).then(function successCallback(response) {
        console.log(1);
        userInfo = setUserLevelInfo(response.data.data);
        $scope.userInfo = userInfo;
    }, function errorCallback(response) {
        console.log(response);
    });

});

angular.module("dashboardApp").controller ('moduleCtrl', function ($scope, $http, $q) {

    var promises = [];
    var tuts = [];


    // promises.push($http({

    //     method: 'POST',
    //     url: '/api/dashboard/forceSyncIVLE'

    // }).then(function successCallback(response) {

    // }, function errorCallback(response) {
    //     console.log('Error: ' + response.message);
    // }));

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
        if (responseArray.length == 1) {
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
var setUserLevelInfo = function(user) {
    var constant = 0.1;
    user.level = Math.floor(constant * Math.sqrt(user.exp));
    user.currExp = user.exp - Math.floor(Math.pow((user.level - 1)/constant, 2))
    user.totalToNext = Math.floor(Math.pow((user.level + 1)/constant, 2)) - Math.floor(Math.pow(user.level/constant, 2));
    user.percentage = Math.floor(user.currExp/user.totalToNext * 100);
    user.imgSrc = "images/avatars/" + user.avatarId + ".png"
    return user;
}
