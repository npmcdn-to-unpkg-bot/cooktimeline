angular.module('cookTimeline').factory("timelineManager", function ($http, $q, localStorageService) {
    var timelineData = null;

    var getTimeline = function () {
        return timelineData;
    };

    var updateTimeline = function () {
        localStorageService.set('current:timeline', timelineData);
    };

    var retrieveTimeline = function () {
        if (!timelineData) {
            return $http.get('data/combined_timeline.json').then(function (result) {
                timelineData = result.data;
                updateTimeline();
                return timelineData;
            }, function (result) {
                timelineData = {};
                return timelineData;
            })
        } else {
            return $q.when(timelineData);
        }
    };

    var init = function () {
        timelineData = localStorageService.get('current:timeline');
    };

    var manager = {
        init: init,
        getTimeline: getTimeline,
        updateTimeline: updateTimeline,
        retrieveTimeline: retrieveTimeline
    };

    return manager;
});
