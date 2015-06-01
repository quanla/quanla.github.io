"use strict";

(function () {
    /* App Module */
    angular.module("bw.main", [
    ])
        .controller("bw.main.Ctrl", function($scope) {
            function createBot() {
                return {
                    run: function(control) {
                        control.direction += 0.03;
                    }
                }
            }

            function newGame() {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 100, y: 100},
                                    direction: 0,
                                    bot: createBot()
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 500, y: 500}
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
