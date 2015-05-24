"use strict";

(function () {
    /* App Module */
    angular.module("examples.selectbox.app", [
        'angular-bit'
    ])

        .controller("examples.selectbox.Ctrl", function($scope) {
            $scope.theNumber = 0;

            $scope.options = [
                {value: 1, title: "Bit value: 1"},
                {value: 2, title: "Bit value: 2"},
                {value: 4, title: "Bit value: 4"},
                {value: 8, title: "Bit value: 8"}
            ];
        })

    ;
})();
