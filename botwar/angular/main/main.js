"use strict";

(function () {
    /* App Module */
    angular.module("rc.main", [
    ])
        .controller("rc.main.Ctrl", function($scope) {
            function newGame() {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    x: 100,
                                    y: 100
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    x: 500,
                                    y: 500
                                }
                            ]
                        }
                    ]
                };
            }

            $scope.game = newGame();

            $scope.start = function() {
                $scope.game = newGame();
            }
        })

    ;
})();
