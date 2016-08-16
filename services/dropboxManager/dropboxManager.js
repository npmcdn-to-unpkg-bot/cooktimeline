angular.module('cookTimeline').factory("dropboxManager", function ($q, localStorageService) {
    var dropBox = null;

    var authenticate = function () {
        dropBox = new Dropbox({clientId: 'ogasqmmkhr4hn45'});
        return dropBox.getAuthenticationUrl('http://localhost:8000/index.html');
    };

    var setAccessToken = function (token) {
        dropBox = new Dropbox({accessToken: token});
    };

    var getFileListFromDropBox = function () {
        var deferred = $q.defer();
        dropBox.filesListFolder({path: ''})
            .then(function (response) {
                deferred.resolve(response);
            })
            .catch(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    var uploadTimeline = function (timeline) {
        var deferred = $q.defer();
        dropBox.filesUpload({path: '/' + timeline.Title, contents: timeline})
            .then(function (response) {
                deferred.resolve(response);
            })
            .catch(function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var manager = {
        authenticate: authenticate,
        setAccessToken: setAccessToken,
        getFileListFromDropBox: getFileListFromDropBox,
        uploadTimeline: uploadTimeline
    };

    return manager;
});
