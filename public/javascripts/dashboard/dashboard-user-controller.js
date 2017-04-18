/**
 * Controller for user panel on left side of dashboard screen.
 *
 * @module javascripts/dashboard/dashboard-user-controller
 */
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


});



/**
 * Capitalization function
 * @param  {String}
 * @return {String}
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

