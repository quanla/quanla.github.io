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
                var blueUnits = [];
                for (var i = 0; i < 1; i++) {
                    blueUnits.push({
                        type: "footman",
                        position: {x: 200, y: 50 + i * 50},
                        direction: 3 * Math.PI/4,
                        bot: bot
                    });
                }

                var redUnits = [];
                for (var i = 0; i < 1; i++) {
                    redUnits.push({
                        type: "footman",
                        position: {x: 400, y: 50 + i * 50},
                        direction: 3 * Math.PI/4,
                        bot: eneBot
                    });
                }

                return {
                    sides: [
                        {
                            color: "blue",
                            units: blueUnits
                        },
                        {
                            color: "red",
                            units: redUnits
                        }
                    ]
                };
            }

            var fightBot = {
                run: function (control) {
                    var enemies = control.getEnemies();
                    if (Cols.isEmpty(enemies)) {
                        control.stand();
                        return; // Relax, we won
                    }

                    var minDisE = Cols.findMin(enemies, function(enemy) {
                        return Distance.between(control.position, enemy.position);
                    });

                    control.setDirection(minDisE.position);

                    if (Distance.between(control.position, minDisE.position) > 40) {
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
                        return; // Relax, no one around
                    }

                    var minDisE = Cols.findMin(enemies, function(enemy) {
                        return Distance.between(control.position, enemy.position);
                    });

                    if (Distance.between(control.position, minDisE.position) < 50) {
                        control.direction = Vectors.toVector( Vectors.subtractPos(control.position, minDisE.position)).direction + (Math.PI/4 * Math.random() - Math.PI/8);
                        control.goForward();
                    } else {
                        control.stand();
                    }
                }
            };

            var kungfuBot = {
                run: function (control) {
                    var enemies = control.getEnemies();
                    if (Cols.isEmpty(enemies)) {
                        return; // Relax, no one around
                    }

                    var minDisE = Cols.findMin(enemies, function(enemy) {
                        return Distance.between(control.position, enemy.position);
                    });

                    control.setDirection(minDisE.position);
                    if (Distance.between(control.position, minDisE.position) < 70) {
                        control.fight();
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
            $scope.testPreempty = function() {
                $scope.showGame(randomGame(fightBot, kungfuBot));
            };

            $scope.testPreempty();
        })
    ;

})();