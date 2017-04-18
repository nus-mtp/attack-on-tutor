/**
 * Controller for avatar picker in dashboard.
 *
 * @module javascripts/dashboard/dashboard-avatar-controller
 */
angular.module('dashboardApp').controller('avatarCtrl', function ($scope, $http) {

	$scope.pickerIsVisible = false;
	$scope.shopIsVisible = false;
	$scope.isBuyingAvatar = false;
	$scope.showShopAvatarDetails = false;
	$scope.showPickerAvatarDetails = false;
	$scope.hoveredImg = {};
	$scope.pickerHoverdImg = {};

	$scope.changeAvatarClicked = function () {
		$scope.pickerIsVisible = !$scope.pickerIsVisible;
		showAvatarPicker();
	}

	$scope.buyAvatarsClicked = function () {
		$scope.shopIsVisible = !$scope.shopIsVisible;
		showShop();
	}

	$scope.setMouseoverShop = function (img) {
		$scope.showShopAvatarDetails = img ? true : false;
		$scope.hoveredImg = img;
	}

	$scope.setMouseoverPicker = function (img) {
		$scope.showPickerAvatarDetails = img ? true : false;
		$scope.pickerHoveredImg = img;
	}

	$scope.avatarPicked = function (img) {
		setAvatar(img);
		$scope.$parent.userInfo.imgSrc = img.url;
	}

	$scope.avatarBought = function(img) {
		buyAvatar(img);
	}

	var setAvatar = function (img) {
		$http({
			method: 'POST',
			url: '/api/dashboard/setAvatar',
			data: { aid: img.id }
		}, function successCallback(response) {
			console.log(response);
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	var buyAvatar = function (img) {
		if (img.price <= ($scope.$parent.userInfo.totalLevels - $scope.$parent.userInfo.levelsSpent)) {
			$http({
				method: 'POST',
				url: '/api/dashboard/buyAvatar',
				data: { aid: img.id, price: img.price }
			}, function successCallback(response) {
				// Update pickers
				$scope.apply(function () {
					$scope.$parent.userInfo.levelsSpent += img.price;
					var avatars = $scope.$parent.userInfo.avatars.push(img);
					console.log(avatars);
					var avatarRows = splitArrayIntoThrees(avatars);
					$scope.avatarRows = avatarRows;
					var allAvatars = removeOwned($scope.$parent.userInfo.avatars.push(img), $scope.allAvatars);
					var shopRows = splitArrayIntoThrees(allAvatars);
					$scope.shopRows = shopRows;
				});

			}, function errorCallback (response) {

			});
		} else {
			console.log('money no enough');
		}
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
            $scope.allAvatars = allAvatars;
            allAvatars = removeOwned($scope.$parent.userInfo.avatars, allAvatars);
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
var removeOwned = function (ownedAvatars, allAvatars) {
	var ownedAvatarIds = makeIdArray(ownedAvatars);
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
