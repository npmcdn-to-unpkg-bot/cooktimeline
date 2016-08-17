angular.module('cookTimeline').controller('timelineController', function ($scope, $interval, timelineManager) {
    $scope.timelineData = {};
    $scope.timedue = new moment();
    $scope.upcomingEvents = [];
    $scope.playing = false;
    $scope.sound = null;
    $scope.id = null;
    $scope.displayEditFields = false;
    $scope.displayAddEvent = false;
    $scope.newItem = {Title: "new event", TimeOffset: -30, TimeOffsetType: "MINUTES", Reminder: true};

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

    $scope.addNewEvent = function () {
        $scope.displayAddEvent = true;
        $scope.newItem = {Title: "new event", TimeOffset: -30, TimeOffsetType: "MINUTES", Reminder: true};
    };

    $scope.updateTimeline = function () {
        var events = _.sortBy($scope.timelineData.TimelineEvents, function (event) {
            return event.TimeDue;
        });
        $scope.timelineData.TimelineEvents = events;
        timelineManager.updateTimeline($scope.timelineData);
    };

    $scope.saveNewEvent = function () {
        $scope.displayAddEvent = false;
        $scope.timelineData.TimelineEvents.push($scope.newItem);
        $scope.updateTimeline();
    };

    $scope.editItem = function () {
        $scope.displayEditFields = !$scope.displayEditFields;
        if (!$scope.displayEditFields) {
            $scope.updateTimeline();
        }
    };

    $scope.processTimeLine = function () {
        // dont process timeline if editing it
        if ($scope.displayEditFields) {
            return;
        }

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

            $scope.updateTimeline();

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
            $scope.timelineData = timelineManager.getTimeline();
            $scope.processTimeLine();
        }, 10000);
    };

    $scope.init();
});
