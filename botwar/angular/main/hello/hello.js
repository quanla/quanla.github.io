"use strict";

(function () {
    /* App Module */
    angular.module("bw.main.hello", [
        'bw.sample',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('hello', {
                    url: '/hello',
                    templateUrl: "angular/main/hello/hello.html",
                    controller: "bw.main.hello.Ctrl"
                })
            ;
        }])

        .controller("bw.main.hello.Ctrl", function($scope, SampleFightBot, SampleRunBot, SamplePreemptBot) {

            //$scope.step2 = true;
            //$scope.step3 = true;

            $scope.showStep = function(i) {
                $scope["step" + i] = true;
            };

            SampleFightBot.createSampleBot(function(bot) {
                $scope.fightBot = bot;
            });
            SampleRunBot.createSampleBot(function(bot) {
                $scope.runBot = bot;
            });
            SamplePreemptBot.createSampleBot(function(bot) {
                $scope.preemptBot = bot;
            });
        })

        .controller("bw.main.hello.step1.Ctrl", function($scope) {
            $scope.options = {pause: true};

            $scope.$watch("::fightBot", function(fightBot) {
                if (!fightBot) return;

                $scope.game = {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 100, y: 150},
                                    direction: Math.PI,
                                    bot: fightBot
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 300, y: 150},
                                    direction: Math.PI,
                                    bot: fightBot
                                }
                            ]
                        }
                    ],
                    onFinish: function() {
                        $scope.$apply();
                    }
                };
            });

            $scope.startGame = function() {
                $scope.options.pause = false;
            };

        })

        .controller("bw.main.hello.step2.Ctrl", function($scope) {
            $scope.options = {pause: true};

            $scope.$watch("fightBot && runBot", function(v) {
                if (!v) return;

                $scope.game = {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 100, y: 150},
                                    direction: Math.PI,
                                    bot: $scope.fightBot
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 300, y: 150},
                                    direction: Math.PI,
                                    bot: $scope.runBot
                                }
                            ]
                        }
                    ],
                    onFinish: function() {
                        $scope.$apply();
                    }
                };
            });

            $scope.startGame = function() {
                $scope.options.pause = false;
            };

        })

        .controller("bw.main.hello.step3.Ctrl", function($scope) {
            $scope.options = {pause: true};


            $scope.$watch("preemptBot && runBot", function(v) {
                if (!v) return;
                newGame();
            });


            function newGame() {

                $scope.game = {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 100, y: 150},
                                    direction: Math.PI,
                                    bot: $scope.fightBot
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 300, y: 150},
                                    direction: Math.PI,
                                    bot: $scope.preemptBot
                                }
                            ]
                        }
                    ],
                    onFinish: function() {
                        $scope.$apply();
                    }
                };

            }

            newGame();

            $scope.startGame = function() {
                if ($scope.options.pause) {
                    $scope.options.pause = false;
                } else {
                    newGame();
                }
            };

        })

    ;
})();
