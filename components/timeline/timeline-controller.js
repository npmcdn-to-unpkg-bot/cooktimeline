angular.module('cookTimeline').controller('timelineController', function ($scope, $interval, timelineManager) {
    $scope.timelineData = {};
    $scope.timedue = new moment();

    $scope.init = function () {
        $interval(function () {
            $scope.timelineData = timelineManager.timelineData;
        }, 1000);
    };

    $scope.init();
});
