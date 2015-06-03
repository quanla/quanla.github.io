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

                var redUnits = [];

                for (var i = 0; i < 10; i++) {
                    redUnits.push({
                        type: "footman",
                        position: {x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 800)},
                        direction: Math.random() * 2 * Math.PI,
                        bot: eneBot
                    });
                }

                var blueUnits = [];

                for (var i = 0; i < 10; i++) {
                    blueUnits.push({
                        type: "footman",
                        position: {x: 50 + i * 50, y: 100},
                        direction: 3 * Math.PI/4,
                        bot: bot
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

            $scope.testSlaughter = function() {
                $scope.showGame(randomGame(fightBot));
            };
            $scope.testRunAway = function() {
                $scope.showGame(randomGame(fightBot, runBot));
            };

            $scope.testSlaughter();
        })
    ;

})();