/**
 * Controller for avatar picker in dashboard.
 *
 * @module javascripts/dashboard/dashboard-avatar-controller
 */
angular.module('dashboardApp').controller('avatarCtrl', function ($scope, $http) {

	$scope.pickerIsVisible = false;
	$scope.shopIsVisible = false;
	$scope.isBuyingAvatar = false;
	$scope.showAvatarDetails = false;
	$scope.hoveredImg = {};

	$scope.changeAvatarClicked = function () {
		$scope.pickerIsVisible = !$scope.pickerIsVisible;
		showAvatarPicker();
	}

	$scope.buyAvatarsClicked = function () {
		$scope.shopIsVisible = !$scope.shopIsVisible;
		showShop();
	}

	$scope.setMouseover = function (img) {
		$scope.showAvatarDetails = img ? true : false;
		$scope.hoveredImg = img;
	}

	$scope.setAvatar = function (img) {
		$http({
			method: 'POST',
			url: ''
		});
	}

	var showAvatarPicker = function() {
		var avatarRows = splitArrayIntoThrees($scope.$parent.userInfo.avatars);
		$scope.avatarRows = avatarRows;
	}

	var showShop = function () {
		$http({
            method: 'POST',
            url: '/api/dashboard/getAvatars'
        }).then(function successCallback(response) {
            var allAvatars = response.data.data.rows;
            var ownedAvatarIds = makeIdArray($scope.$parent.userInfo.avatars);
            allAvatars = removeOwned(ownedAvatarIds, allAvatars);
            var shopRows = splitArrayIntoThrees(allAvatars);
            $scope.shopRows = shopRows;
        },
        function errorCallback(response) {
           console.log(response); 
        });
	}





});


/**
 * Removes avatars the user owns
 * @param  {[Array]} ownedAvatarIds
 * @param  {[Array]} allAvatars 
 * @return
 */
var removeOwned = function (ownedAvatarIds, allAvatars) {
	var result  = [];
	var array = allAvatars;
	for (index in array) {
		if (!ownedAvatarIds.includes(array[index].id)) {
			result.push(array[index]);
		}
	}
	return result;
}

/**
 * Strips avatar ids from user's owned avatars.
 * @param  {Array} avatarArray 
 * @return {Array}
 */
var makeIdArray = function(avatarArray) {
	var result = [];
	for (index in avatarArray) {
		result.push(avatarArray[index].id);
	}
	return result;
}

/**
 * Splits array into sub-arrays of threes to make a grid
 * @param  Array
 * @return Array
 */
var splitArrayIntoThrees = function (array) {
	var result = [];
	var row = [];
	for (index in array) {
		if (index % 3 == 0) {
			if (index != 0) {
				result.push(row);
			}
			row = [];
		}
		row.push(array[index]);
	}
	result.push(row);
	return result;
}
