"use strict";

(function () {

    angular.module('bw.test.bot', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('bot', {
                    url: '/bot',
                    templateUrl: "tests/bot/test-bot.html",
                    controller: "bw.test.bot.Ctrl"
                })
            ;
        }])

        .controller("bw.test.bot.Ctrl", function($scope) {

            function randomGame(bot, eneBot) {

                var units = [];

                for (var i = 0; i < 10; i++) {
                    units.push({
                        type: "footman",
                        position: {x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 800)},
                        direction: Math.random() * 2 * Math.PI,
                        bot: eneBot
                    });
                }

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
                            units: units
                        }
                    ]
                };
            }

            var fightBot = {
                run: function (control) {
                    var enemies = control.getEnemies();
                    if (Cols.isEmpty(enemies)) {
                        return; // Relax, we won
                    }

                    var minDisE = Cols.findMin(enemies, function(enemy) {
                        return Distance.between(control.position, enemy.position);
                    });

                    control.setDirection(minDisE.position);

                    if (Distance.between(control.position, minDisE.position) > 30) {
                        control.goForward();
                    } else {
                        control.fight();
                    }
                }
            };

            var runBot = {
                run: function (control) {
                    var enemies = control.getEnemies();
                    if (Cols.isEmpty(enemies)) {
                        return; // Relax, we won
                    }

                    var minDisE = Cols.findMin(enemies, function(enemy) {
                        return Distance.between(control.position, enemy.position);
                    });

                    if (Distance.between(control.position, minDisE.position) < 50) {
                        control.direction = Vectors.toVector( Vectors.subtractPos(control.position, minDisE.position)).direction;
                        control.goForward();
                    } else {
                        control.stand();
                    }
                }
            };

            $scope.testSlaughter = function() {
                $scope.showGame(randomGame(fightBot));
            };
            $scope.testRunAway = function() {
                $scope.showGame(randomGame(fightBot, runBot));
            };

            $scope.testRunAway();
        })
    ;

})();