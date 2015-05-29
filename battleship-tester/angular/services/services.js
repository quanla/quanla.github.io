"use strict";

(function () {

    angular.module('bt.services', [
    ])
        .factory("SourceService", function($http) {
            return {
                isDirect: function() {
                    return localStorage.isRemote != "true";
                },
                setDirect: function(direct) {
                    localStorage.isRemote = !direct;
                },
                getSource: function() {
                    return $http.get("angular/main/default-code.txt").then(function(resp) {
                        return resp.data;
                    });
                },
                getRemoteLocation: function() {
                    return localStorage.remoteLocation;
                },
                setRemoteLocation: function(location) {
                    localStorage.remoteLocation = location;
                }
            };
        })
    ;

})();