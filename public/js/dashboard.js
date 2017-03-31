angular.module("dashboardApp", []);

angular.module("dashboardApp").factory ('ivle', function ($rootScope) {
    var tutorials = [];

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

    var syncUser = function() {
        $.ajax({
            method: 'POST',
            url: '/api/dashboard/syncUser',
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    console.log(data);
                } else {
                    console.log('Failed Sync, Error: ' + data.message);
                }
            }
        });
    }

    //syncIVLE();
    getTutorials();

    return {
        tutorials: function () {
            return tutorials;
        }
    };
});

angular.module("dashboardApp").controller ('userCtrl', function ($scope, ivle) {
    
});

angular.module("dashboardApp").controller ('moduleCtrl', function ($scope, ivle) {
    $scope.ivle = ivle;

    $scope.redirect = function(tut) {
        $('#form').attr('action', 'lobby/'+tut.coursecode+'/'+tut.name)
    }

});


$(document).on('click', '#lobby-button', function () {
    var index = $(this).attr('data-id');
    var tut = tutorials[index];
    $(this).attr('value', tut.id);
    $('#form').attr('action', 'lobby/'+tut.coursecode+'/'+tut.name);
});