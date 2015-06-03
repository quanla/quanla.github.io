"use strict";

(function () {

    angular.module('bw.test.bot', [
        'bw.sample',
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

        .controller("bw.test.bot.Ctrl", function($scope, SampleFightBot, SampleRunBot, SamplePreemptBot) {

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

            var fightBot = SampleFightBot.createSampleFightBot();

            var runBot = SampleRunBot.createSampleRunBot();

            var preemptBot = SamplePreemptBot.createSamplePreemptBot();

            $scope.testSlaughter = function() {
                $scope.showGame(randomGame(fightBot));
            };
            $scope.testRunAway = function() {
                $scope.showGame(randomGame(fightBot, runBot));
            };
            $scope.testFight = function() {
                $scope.showGame(randomGame(fightBot, fightBot));
            };
            $scope.testPreempty = function() {
                $scope.showGame(randomGame(fightBot, preemptBot));
            };

            $scope.testPreempty();
        })
    ;

})();