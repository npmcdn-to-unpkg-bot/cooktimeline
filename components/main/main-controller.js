angular.module('cookTimeline').controller('mainController', function ($scope, $window, $location, $rootScope, timelineManager, dropboxManager) {
    $scope.timelineData = null;
    $scope.timedue = new moment();
    $scope.showLogo = true;
    $scope.files = [];

    $scope.getAccessTokenFromUrl = function () {
        var accessToken = $location.path();
        var start = accessToken.indexOf('access_token=');
        if (start >= 0) {
            accessToken = accessToken.substring(start + 13);
            var end = accessToken.indexOf('&');
            if (end) {
                accessToken = accessToken.substring(0, end);
                return accessToken;
            }
        }
        return undefined;
    };

    $scope.isAuthenticated = function () {
        if ($scope.getAccessTokenFromUrl()) {
            return true;
        }
        return false;
    };

    $scope.authenticateWithDropbox = function () {
        var url = dropboxManager.authenticate();
        $window.location.href = url;
    };

    $scope.toggleLogo = function () {
        $scope.showLogo = !$scope.showLogo;
    };

    $scope.updateTimeline = function () {
        if ($scope.timelineData) {
            timelineManager.updateTimeline($scope.timelineData);
            $rootScope.$broadcast('cooktimeline:filedownloaded');
        }
    };

    $scope.loadFiles = function () {
        var accessToken = $scope.getAccessTokenFromUrl();
        if (accessToken) {
            dropboxManager.setAccessToken(accessToken);
            dropboxManager.getFileListFromDropBox().then(function (files) {
                $scope.files = files;
            });
        }
    };

    $scope.downloadTimeline = function (id) {
        var accessToken = $scope.getAccessTokenFromUrl();
        if (accessToken) {
            dropboxManager.getSharingFileLink(id, accessToken).then(function (result) {
                $scope.timelineData = result.data;
                $scope.updateTimeline();
            });
        }
    };

    $scope.init = function () {
        var accessToken = $scope.getAccessTokenFromUrl();
        if (accessToken) {
            dropboxManager.setAccessToken(accessToken);
        }
    };

    $scope.init();
});
