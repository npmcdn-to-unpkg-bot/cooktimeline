angular.module('cookTimeline').controller('countdownController', function ($scope, $rootScope, $interval, timelineManager, dropboxManager) {
    $scope.timelineData = {};
    $scope.event = {};

    $scope.processTimeLine = function () {
        $scope.timelineData = timelineManager.getTimeline();

        if ($scope.timelineData) {
            var now = new moment(new Date());
            var due = new moment($scope.timelineData.TimeDue, "YYYY-MM-DDTHH:mm:ss.SSSSZ");
            $scope.upcomingEvents = _.filter($scope.timelineData.TimelineEvents, function (event) {
                var eventTime = new moment(event.TimeDue);
                return eventTime >= now && eventTime <= due;
            });

            if ($scope.upcomingEvents && $scope.upcomingEvents[0]) {
                due = new moment($scope.upcomingEvents[0].TimeDue);
                var till = due.diff(now, 'seconds');
                if (till > 0) {
                    $scope.event = $scope.upcomingEvents[0];
                }
            }
        }
    };

    $scope.init = function () {
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();
        $interval(function () {
            $scope.processTimeLine();
        }, 60000);
    };

    $scope.init();
});