angular.module('cookTimeline').controller('mainController', function ($scope, $window, $location, timelineManager, dropboxManager) {
    $scope.timelineData = null;
    $scope.timedue = new moment();
    $scope.showLogo = true;

    $scope.toggleLogo = function () {
        $scope.showLogo = !$scope.showLogo;
    };

    $scope.updateTimeline = function () {
        if ($scope.timelineData) {
            timelineManager.updateTimeline($scope.timelineData);
        }
    };

    $scope.getAccessTokenFromUrl = function () {
        var accessToken = $location.path();
        var start = accessToken.indexOf('access_token=');
        if (start) {
            accessToken = accessToken.substring(start + 13);
            var end = accessToken.indexOf('&');
            if (end) {
                accessToken = accessToken.substring(0, end);
                return accessToken;
            }
        }
        return undefined;
    };

    $scope.loadFiles = function () {
        var accessToken = $scope.getAccessTokenFromUrl();
        if (!accessToken) {
            var url = dropboxManager.authenticate();
            $window.location.href = url;
        } else {
            dropboxManager.setAccessToken(accessToken);
            dropboxManager.getFileListFromDropBox().then(function (files) {
                console.log(files);
            });
        }
    };

    $scope.saveTimeline = function () {
        var timeline = timelineManager.getTimeline();
        if (timeline) {
            var accessToken = $scope.getAccessTokenFromUrl();
            if (!accessToken) {
                var url = dropboxManager.authenticate();
                $window.location.href = url;
            } else {
                dropboxManager.setAccessToken(accessToken);
                dropboxManager.uploadTimeline(timeline).then(function (result) {
                    console.log(result);
                });
            }
        }
    };

    $scope.init = function () {
        var accessToken = $scope.getAccessTokenFromUrl();
        if (accessToken) {
            dropboxManager.setAccessToken(accessToken);
        }
        timelineManager.retrieveTimeline().then(function (result) {
            $scope.timelineData = result;
        });
    };

    $scope.init();
});
