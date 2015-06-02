"use strict";

(function () {

    angular.module('bw.battlefield', [
        'bw.battlefield.game',
        'bw.battlefield.renderer'
    ])

        .directive("battlefield", function(Renderers, GameRunner, UnitSprites) {
            return {
                restrict: "A",
                scope: {
                    game: "=battlefield",
                    options: "="
                },
                link: function($scope, elem, attrs) {
                    var renderer = Renderers.create(elem[0], attrs.width, attrs.height, attrs.assetsLoc || "assets");

                    renderer.load(function() {
                        var unitSprites;
                        var gameRunner;

                        $scope.$applyAsync(function () {
                            $scope.$watch("game", function(game) {

                                if (unitSprites != null) {
                                    unitSprites.release();
                                    unitSprites = null;
                                }

                                if (game != null) {

                                    gameRunner = GameRunner.newGameRunner(game, $scope.options);

                                    unitSprites = UnitSprites.create(game, renderer.unitStage);

                                    gameRunner.updateUI = unitSprites.updateSprites;
                                    renderer.onEachRound(gameRunner.onEachRound);
                                } else {
                                    renderer.onEachRound(null);
                                }

                            });

                            $scope.$watch("options.skip", function(skip) {
                                if (gameRunner) gameRunner.skip(skip);
                            })
                        });
                    });

                    $scope.$on("$destroy", function() {
                        renderer.destroy();
                    });
                }
            };
        })


    ;

})();