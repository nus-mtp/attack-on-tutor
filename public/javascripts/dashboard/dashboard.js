angular.module("dashboardApp", []);

angular.module("dashboardApp").factory ('ivle', function ($rootScope) {
    var tutorials = [];
    var userInfo = {};

    var syncIVLE = function () {
        $.ajax({
            method:'POST',
            url:'/api/dashboard/forceSyncIVLE',
            dataType:'json',
            success: function(data){
                if (data.success){
                    console.log("Successful Sync");
                    getTutorials();
                }
                else {  
                    console.log('Failed Sync, Error: ' + data.message);
                }
            }
        });
    };

    var getTutorials = function () {
        $.ajax({
            type: 'POST',
            url: '/api/dashboard/getTutorials',
            data: { },
            dataType: 'json',
            success: function(data) {
                tutorials = data.data.rows;
                $rootScope.$apply();
            }
        });
    };

    var syncUser = function() {
        $.ajax({
            method: 'POST',
            url: '/api/dashboard/syncUser',
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    userInfo = setUserLevelInfo(data.data);
                    $rootScope.$apply();
                } else {
                    console.log('Failed Sync, Error: ' + data.message);
                }
            }
        });
    }

    //syncIVLE();
    getTutorials();
    syncUser();

    return {
        tutorials: function () {
            return tutorials;
        },
        userInfo: function() {
            return userInfo;
        }
    };
});

angular.module("dashboardApp").controller ('userCtrl', function ($scope, ivle) {
    $scope.ivle = ivle;
});

angular.module("dashboardApp").controller ('moduleCtrl', function ($scope, ivle) {
    $scope.ivle = ivle;

    $scope.redirect = function(tut) {
        $('#form').attr('action', 'lobby/'+tut.coursecode+'/'+tut.name)
    }

    $scope.getLeaderboard = function(tut) {
    }

});


var setUserLevelInfo = function(user) {
    var constant = 0.1;
    user.level = Math.floor(constant * Math.sqrt(user.exp));
    user.toNextLevel = Math.floor(Math.pow((user.level + 1)/constant, 2));
    return user;
}
