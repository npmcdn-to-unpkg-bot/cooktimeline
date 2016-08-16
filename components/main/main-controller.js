angular.module('cookTimeline').controller('mainController', function ($scope, timelineManager) {
    $scope.timelineData = {};
    $scope.timedue = new moment();
    $scope.showLogo = true;

    $scope.toggleLogo = function () {
        $scope.showLogo = !$scope.showLogo;
    };

    $scope.init = function () {
        timelineManager.retrieveTimeline().then(function (result) {
            $scope.timelineData = result;
        });
    };

    $scope.init();
});
