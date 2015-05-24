"use strict";

(function () {
    /* App Module */
    angular.module("examples.checkboxes.app", [
        'angular-bit'
    ])

        .controller("examples.checkboxes.Ctrl", function($scope) {
            $scope.theNumber = 0;
        })

    ;
})();
