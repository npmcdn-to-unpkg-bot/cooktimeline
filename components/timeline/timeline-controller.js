angular.module('cookTimeline').controller('timelineController', function ($scope, $rootScope, $interval, $location, $window, timelineManager, dropboxManager) {
    $scope.timelineData = {};
    $scope.timedue = new moment();
    $scope.upcomingEvents = [];
    $scope.playing = false;
    $scope.sound = null;
    $scope.id = null;
    $scope.displayEditFields = false;
    $scope.displayAddEvent = false;
    $scope.newItem = {Title: "new event", TimeOffset: -30, TimeOffsetType: "MINUTES", Reminder: true};

    $scope.$on('cooktimeline:filedownloaded', function () {
        $scope.timelineData = timelineManager.getTimeline();
        $scope.processTimeLine();
    });

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
        $rootScope.$broadcast('cooktimeline:updated');
    };

    $scope.saveNewEvent = function () {
        $scope.displayAddEvent = false;
        $scope.timelineData.TimelineEvents.push($scope.newItem);
        $scope.updateTimeline();
        $rootScope.$broadcast('cooktimeline:updated');
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

    $scope.saveTimelineToDropBox = function () {
        var timeline = timelineManager.getTimeline();
        if (timeline) {
            var accessToken = $scope.getAccessTokenFromUrl();
            if (accessToken) {
                dropboxManager.setAccessToken(accessToken);
                dropboxManager.uploadTimeline(timeline).then(function (result) {
                    console.log(result);
                });
            }
        }
    };

    $scope.init = function () {
        timelineManager.retrieveTimeline().then(function (result) {
            $scope.timelineData = result;
            $scope.updateTimeline();
            $scope.processTimeLine();
        });

        $interval(function () {
            $scope.processTimeLine();
        }, 10000);
    };

    $scope.init();
});
