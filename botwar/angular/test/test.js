"use strict";

(function () {
    /* App Module */
    angular.module("bw.test.app", [
        'bw.battlefield'
    ])
        .controller("bw.test.Ctrl", function($scope) {
            function singleGame(bot) {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 100, y: 100},
                                    direction: 0,
                                    bot: bot
                                }
                            ]
                        }
                    ]
                };
            }

            $scope.testRotate = function() {
                var rotateBot = {
                    run: function (control) {
                        control.direction += 0.03;
                    }
                };
                $scope.game = singleGame(rotateBot);
            };


            var direction = 3* Math.PI / 4;
            $scope.changeDir = function() {
                direction += Math.PI / 4;
            };
            $scope.testWalk = function() {
                var walkBot = {
                    run: function (control) {
                        control.direction = direction;
                        //control.direction = 0;
                        //control.direction = (Math.PI / 4);
                        //control.direction = (Math.PI / 2);
                        //control.direction = (Math.PI);
                        control.goForward();
                    }
                };
                $scope.game = singleGame(walkBot);
            };

            $scope.testWalk();
        })

    ;
})();
