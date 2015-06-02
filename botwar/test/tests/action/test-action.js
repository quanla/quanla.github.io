"use strict";

(function () {

    angular.module('bw.test.action', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('action', {
                    url: '/action',
                    templateUrl: "tests/action/test-action.html",
                    controller: "bw.test.action.Ctrl"
                })
            ;
        }])

        .controller("bw.test.action.Ctrl", function($scope) {

            function singleGame(bot) {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 400, y: 100},
                                    direction: 3 * Math.PI/4,
                                    bot: bot
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 430, y: 130},
                                    direction: 7 * Math.PI/4
                                },
                                {
                                    type: "footman",
                                    position: {x: 480, y: 180},
                                    direction: 7 * Math.PI/4
                                }
                            ]
                        }
                    ]
                };
            }

            $scope.testHit = function() {
                var fightBot = {
                    run: function (control) {
                        control.fight();
                    }
                };
                $scope.showGame(singleGame(fightBot), {skip: 0});
            };

            $scope.testHit();
        })
    ;

})();