angular.module('cookTimeline').factory("timelineManager", function ($http, $q, localStorageService) {
    var timelineData = null;

    var getTimeline = function () {
        return localStorageService.get('current:timeline');
    };

    var updateTimeline = function (timelineData) {
        var due = new moment(timelineData.TimeDue, "YYYY-MM-DDTHH:mm:ss.SSSSZ");
        timelineData.TimeDue = due.toDate();

        localStorageService.set('current:timeline', timelineData);
    };

    var retrieveTimeline = function () {
        var data = localStorageService.get('current:timeline');
        if (!data) {
            return $http.get('data/combined_timeline.json').then(function (result) {
                updateTimeline(result.data);
                return result.data;
            }, function (result) {
                updateTimeline({});
                return {};
            })
        } else {
            return $q.when(data);
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
