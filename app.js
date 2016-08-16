angular.module('cookTimeline', ['ngSanitize', 'LocalStorageModule']);

angular.module('cookTimeline').config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('cookTimeline');
}).run(function (timelineManager) {
    timelineManager.init();
});