angular.module('cookTimeline').factory("timelineManager", function ($http) {
    var manager = {
        timelineData: {},
        retrieveTimeline: function () {
            return $http.get('data/combined_timeline.json').then(function (result) {
                timelineData = result.data;
                return timelineData;
            }, function (result) {
                timelineData = {};
                return timelineData;
            })
        }
    };

    return manager;
});
