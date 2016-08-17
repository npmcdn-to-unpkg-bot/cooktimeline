angular.module('cookTimeline').controller('timelineController', function ($scope, $interval, timelineManager) {
    $scope.timelineData = {};
    $scope.timedue = new moment();
    $scope.upcomingEvents = [];
    $scope.playing = false;
    $scope.sound = null;
    $scope.id = null;
    $scope.displayEditFields = false;

    $scope.acknowledge = function () {
        $scope.sound.stop($scope.id);
        $scope.playing = false;
        $scope.id = null;
    };

    $scope.updateTimeline = function () {
        timelineManager.updateTimeline($scope.timelineData);
    };

    $scope.formatDateTime = function (eventTime) {
        return eventTime.calendar();
    };

    $scope.formatDuration = function (eventTime) {
        return eventTime.fromNow();
    };

    $scope.soundIsPlaying = function () {
        if ($scope.playing) {
            return 'btn-success';
        }

        return 'btn-default disabled';
    };

    $scope.colorize = function (eventTime) {
        var now = new moment(new Date());
        var due = new moment(eventTime);
        var till = due.diff(now, 'm');
        if (till < 10) {
            return 'bg-danger';
        }
        if (till < 60) {
            return 'bg-warning';
        }
        return 'bg-success';
    };

    $scope.editItem = function () {
        $scope.displayEditFields = !$scope.displayEditFields;
    };

    $scope.processTimeLine = function () {
        if ($scope.timelineData && $scope.timelineData.TimeDue) {
            var now = new moment(new Date());
            var due = new moment($scope.timelineData.TimeDue, "YYYY-MM-DDTHH:mm:ss.SSSSZ");
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

            var events = _.sortBy($scope.timelineData.TimelineEvents, function (event) {
                return event.TimeDue;
            });
            $scope.timelineData.TimelineEvents = events;

            timelineManager.updateTimeline($scope.timelineData);

            $scope.upcomingEvents = _.filter($scope.timelineData.TimelineEvents, function (event) {
                return event.TimeDue >= now && event.TimeDue <= due;
            });

            if ($scope.upcomingEvents && $scope.upcomingEvents[0]) {
                due = new moment($scope.upcomingEvents[0].TimeDue);
                var till = due.diff(now, 'seconds');
                if (till <= 11 && !$scope.playing && $scope.upcomingEvents[0].Reminder) {
                    $scope.playing = true;
                    $scope.sound = new Howl({
                        src: ['audio/tng_red_alert2.mp3'],
                        loop: true
                    });

                    $scope.id = $scope.sound.play();
                }
            }
        }
    };

    $scope.init = function () {
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();

        $interval(function () {
            $scope.processTimeLine();
        }, 10000);
    };

    $scope.init();
});
