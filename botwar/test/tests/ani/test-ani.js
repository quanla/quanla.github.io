"use strict";

(function () {

    angular.module('bw.test.ani', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('ani', {
                    url: '/ani',
                    templateUrl: "tests/ani/test-ani.html",
                    controller: "bw.test.ani.Ctrl"
                })
            ;
        }])

        .controller("bw.test.ani.Ctrl", function($scope) {

            function singleGame(bot) {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 400, y: 100},
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
                        direction += 0.03;
                        control.direction = direction;
                    }
                };
                $scope.showGame(singleGame(rotateBot));
            };


            var direction = 3* Math.PI / 4;
            $scope.changeDir = function() {
                direction += Math.PI / 4;
            };
            $scope.testWalk = function() {
                var walkBot = {
                    run: function (control) {
                        control.direction = direction;
                        control.goForward();
                    }
                };
                $scope.showGame(singleGame(walkBot));
            };
            $scope.testFight = function() {
                var fighted = false;
                var fightBot = {
                    run: function (control) {
                        control.direction = direction;
                        if (!fighted) {
                            control.fight();
                            fighted = true;
                        } else {
                        }
                    }
                };
                $scope.showGame(singleGame(fightBot));
            };

            $scope.testFight();
        })
    ;

})();