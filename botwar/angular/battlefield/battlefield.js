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
                    game: "=battlefield"
                },
                link: function($scope, elem, attrs) {
                    var renderer = Renderers.create(elem[0], attrs.width, attrs.height, attrs.assetsLoc || "assets");

                    renderer.load(function() {
                        var unitSprites;

                        $scope.$applyAsync(function () {
                            $scope.$watch("game", function(game) {

                                if (unitSprites != null) {
                                    unitSprites.release();
                                    unitSprites = null;
                                }

                                if (game != null) {
                                    var gameRunner = GameRunner.newGameRunner(game);

                                    unitSprites = UnitSprites.create(game, renderer.unitStage);

                                    gameRunner.updateUI = unitSprites.updateSprites;
                                    renderer.onEachRound(gameRunner.onEachRound);
                                } else {
                                    renderer.onEachRound(null);
                                }

                            });
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