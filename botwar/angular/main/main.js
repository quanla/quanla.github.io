"use strict";

(function () {
    /* App Module */
    angular.module("bw.main", [
        'bw.sample'
    ])
        .controller("bw.main.Ctrl", function($scope) {

            //$scope.step2 = true;
            //$scope.step3 = true;

            $scope.showStep = function(i) {
                $scope["step" + i] = true;
            }
        })

        .controller("bw.main.step1.Ctrl", function($scope, SampleFightBot) {
            $scope.options = {pause: true};

            $scope.game = {
                sides: [
                    {
                        color: "blue",
                        units: [
                            {
                                type: "footman",
                                position: {x: 100, y: 150},
                                direction: Math.PI,
                                bot: SampleFightBot.createSampleFightBot()
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
                                bot: SampleFightBot.createSampleFightBot()
                            }
                        ]
                    }
                ],
                onFinish: function() {
                    $scope.$apply();
                }
            };

            $scope.startGame = function() {
                $scope.options.pause = false;
            };

        })

        .controller("bw.main.step2.Ctrl", function($scope, SampleFightBot, SampleRunBot) {
            $scope.options = {pause: true};

            $scope.game = {
                sides: [
                    {
                        color: "blue",
                        units: [
                            {
                                type: "footman",
                                position: {x: 100, y: 150},
                                direction: Math.PI,
                                bot: SampleFightBot.createSampleFightBot()
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
                                bot: SampleRunBot.createSampleRunBot()
                            }
                        ]
                    }
                ],
                onFinish: function() {
                    $scope.$apply();
                }
            };

            $scope.startGame = function() {
                $scope.options.pause = false;
            };

        })

        .controller("bw.main.step3.Ctrl", function($scope, SampleFightBot, SamplePreemptBot) {
            $scope.options = {pause: true};

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
                                    bot: SampleFightBot.createSampleFightBot()
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
                                    bot: SamplePreemptBot.createSamplePreemptBot()
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
