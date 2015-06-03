"use strict";

(function () {
    /* App Module */
    angular.module("bw.test.app", [
        'bw.test.ani',
        'bw.test.action',
        'bw.test.bot',
        'bw.test.sprite',
        'bw.battlefield'
    ])
        .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider
                // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
                .otherwise("/bot");
        }])


        .controller("bw.test.Ctrl", function($scope) {

            $scope.showing = {};

            $scope.showGame = function(game, options) {
                $scope.showing = {
                    game: game,
                    options: options
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
