angular.module('cookTimeline').factory("dropboxManager", function ($q, $http, localStorageService) {
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
                deferred.resolve(response.entries);
            })
            .catch(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    var getSharingFileLink = function (fileName, accessToken) {

        var req = {
            method: 'POST',
            url: 'https://content.dropboxapi.com/2/files/download',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Dropbox-API-Arg': '{"path": "' + fileName + '"}'
            }
        };

        return $http(req);
    };

    var uploadTimeline = function (timeline) {
        var deferred = $q.defer();
        dropBox.filesUpload({path: '/' + timeline.Title, contents: angular.toJson(timeline)})
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
        getSharingFileLink: getSharingFileLink,
        uploadTimeline: uploadTimeline
    };

    return manager;
});
