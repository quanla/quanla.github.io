"use strict";

(function () {
    /* App Module */
    angular.module("bw.test.app", [
        'bw.test.ani',
        'bw.test.action',
        'bw.test.sprite',
        'bw.battlefield'
    ])
        .controller("bw.test.Ctrl", function($scope) {

            $scope.showing = {};

            $scope.showGame = function(game) {
                $scope.showing = {
                    game: game
                };
            };

            $scope.showSpriteSheet = function(spriteSheet) {
                $scope.showing = {
                    spriteSheet: spriteSheet
                };
            };
        })

    ;
})();
