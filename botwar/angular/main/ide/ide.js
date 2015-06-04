"use strict";

(function () {

    angular.module('bw.main.ide', [
        'bw.main.plugin.code-mirror',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('ide', {
                    url: '/ide',
                    templateUrl: "angular/main/ide/ide.html",
                    controller: "ide.ctrl"
                })
            ;
        }])

        .controller("ide.ctrl", function($http, $scope) {
            $scope.bots = [
                {
                    name: "Fighter",
                    code: ""
                },
                {
                    name: "Run away",
                    code: ""
                },
                {
                    name: "Veteran",
                    code: ""
                }
            ];

            $http.get("sample-bots/fight-bot.js").success(function(source1) {
                $scope.bots[0].code = source1;
            });
            $http.get("sample-bots/run-bot.js").success(function(source1) {
                $scope.bots[1].code = source1;
            });
            $http.get("sample-bots/preempt-bot.js").success(function(source1) {
                $scope.bots[2].code = source1;
            });

            $scope.currentBot = $scope.bots[0];

            $scope.showCodeEditor = false;

            var count = 1;
            $scope.createNewBot = function() {
                var newBot = {
                    name: "User Bot #" + count++,
                    code: "function Bot() {\n" +
                        "   this.run = function (control) {\n" +
                        "       \n" +
                        "   };\n" +
                        "}"
                };
                $scope.bots.push(newBot);
                $scope.currentBot = newBot;
            };
        })

        .directive("bwIdeBattlefield", function(BotSource) {
            return {
                restrict: "E",
                templateUrl: "angular/main/ide/ide-battlefield.html",
                link: function($scope, elem, attrs) {

                    $scope.sides = [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    count: 1,
                                    bot: $scope.bots[0]
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    count: 1,
                                    bot: $scope.bots[0]
                                }
                            ]
                        }
                    ];

                    function createGame() {
                        var sides = [];

                        for (var i = 0; i < $scope.sides.length; i++) {
                            var sideConfig = $scope.sides[i];
                            var units = [];
                            for (var j = 0; j < sideConfig.units.length; j++) {
                                var unitConfig = sideConfig.units[j];

                                for (var k = 0; k < unitConfig.count; k++) {
                                    var bot = BotSource.createBot(unitConfig.bot.code);
                                    units.push({
                                        type: unitConfig.type,
                                        position: {x: (i) * 300 + 100, y: 150 + k * 50},
                                        direction: (i) * Math.PI + Math.PI/2,
                                        bot: bot
                                    });
                                }
                            }
                            sides.push({
                                color: sideConfig.color,
                                units: units
                            })
                        }
                        return {
                            sides: sides
                        };
                    }

                    $scope.options = { pause: true };

                    $scope.game = createGame();

                    $scope.startGame = function() {
                        $scope.game = createGame();
                        $scope.options.pause = false;
                    };

                    $scope.addBot = function(unit) {
                        if (unit.count >= 5) return;
                        unit.count ++;

                        $scope.game = createGame();
                    };

                    $scope.removeBot = function(unit) {
                        if (unit.count <= 1) return;
                        unit.count --;

                        $scope.game = createGame();
                    }
                }
            };
        })
    ;

})();