"use strict";

(function () {

    angular.module('rc.battlefield', [
        'rc.battlefield.renderer'
    ])

        .directive("battlefield", function(Renderers) {
            return {
                restrict: "A",
                scope: {
                    game: "=battlefield"
                },
                link: function($scope, elem, attrs) {
                    var renderer = Renderers.create(elem[0], attrs.width, attrs.height);

                    renderer.load(function() {
                        $scope.$apply(function () {
                            $scope.$watch("game", function(game) {
                                renderer.setGame(game);
                            });
                        });
                    });
                }
            };
        })

        .factory("BotRunner", function() {
            return {
                runBots: function(game) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];
                            if (unit.bot) {

                                var control = {
                                    direction: unit.direction
                                };
                                unit.bot.run(control);

                                unit.direction = control.direction;
                            }
                        }
                    }
                }
            };
        })
    ;

})();