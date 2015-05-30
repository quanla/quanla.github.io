"use strict";

(function () {
    /* App Module */
    angular.module("rc.main", [
    ])
        .controller("rc.main.Ctrl", function($scope) {
            function newGame() {
                return {
                    sides: [
                        [
                            // Robot 1
                            {
                                x: 100,
                                y: 100
                            }
                        ],
                        [
                            // Robot 2
                            {
                                x: 500,
                                y: 500
                            }
                        ]
                    ]
                };
            }

            $scope.start = function() {
                $scope.game = newGame();
            }
        })

    ;
})();
