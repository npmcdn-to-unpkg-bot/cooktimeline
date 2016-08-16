angular.module('cookTimeline').controller('timelineController', function ($scope, $interval, timelineManager) {
    $scope.timelineData = {};
    $scope.timedue = new moment();
    $scope.upcomingEvents = [];
    $scope.playing = false;
    $scope.sound = null;
    $scope.id = null;

    $scope.acknowledge = function () {
        $scope.sound.stop($scope.id);
        $scope.playing = false;
        $scope.id = null;
    };

    $scope.formatDateTime = function (eventTime) {
        return eventTime.calendar();
    };

    $scope.formatDuration = function (eventTime) {
        return eventTime.fromNow();
    };

    $scope.colorize = function (eventTime) {
        var now = new moment(new Date());
        var due = new moment(eventTime);
        var till = due.diff(now, 'm');
        if (till < 10) {
            return 'timeline-within10';
        }
        if (till < 60) {
            return 'timeline-within60';
        }
        return 'timeline-greaterThan60';
    };

    $scope.processTimeLine = function () {
        if ($scope.timelineData.TimeDue) {
            var now = new moment(new Date());
            var due = new moment($scope.timelineData.TimeDue);
            _.each($scope.timelineData.TimelineEvents, function (event) {
                switch (event.TimeOffsetType) {
                    case "MINUTES":
                        event.TimeDue = (new moment(due)).add(event.TimeOffset, 'm');
                        break;
                    case "DAYS":
                        event.TimeDue = (new moment(due)).add(event.TimeOffset, 'd');
                        break;
                }
            });

            $scope.timelineData.TimeDue = due.toDate();
            timelineManager.updateTimeline();

            $scope.upcomingEvents = _.filter($scope.timelineData.TimelineEvents, function (event) {
                return event.TimeDue >= now && event.TimeDue <= due;
            });

            if ($scope.upcomingEvents && $scope.upcomingEvents[0]) {
                due = new moment($scope.upcomingEvents[0].TimeDue);
                var till = due.diff(now, 'seconds');
                if (till < 30 && !$scope.playing) {
                    $scope.playing = true;
                    $scope.sound = new Howl({
                        src: ['audio/tng_red_alert2.mp3'],
                        autoplay: true,
                        loop: true
                    });

                    $scope.id = sound.play();
                }
            }
        }
    };

    $scope.init = function () {
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();

        $interval(function () {
            $scope.timelineData = timelineManager.getTimeline();
            $scope.processTimeLine();
        }, 10000);
    };

    $scope.init();
});
