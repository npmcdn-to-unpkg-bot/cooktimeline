angular.module('cookTimeline').controller('countdownController', function ($scope, $rootScope, timelineManager, dropboxManager) {
    $scope.timelineData = {};
    $scope.events = [];

    $scope.$on('cooktimeline:filedownloaded', function () {
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();
    });

    $scope.$on('cooktimeline:updated', function () {
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();
    });


    $scope.processTimeLine = function(){
        if($scope.timelineData){
            $scope.events = _.where($scope.timelineData.TimelineEvents, {countdown: true});
        }
    };

    $scope.init = function(){
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();
    };

    $scope.init();
});