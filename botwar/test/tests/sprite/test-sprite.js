"use strict";

(function () {

    angular.module('bw.test.sprite', [
        'bw.sprite.editor',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('sprite', {
                    url: '/sprite',
                    templateUrl: "tests/sprite/test-sprite.html",
                    controller: "bw.test.sprite.Ctrl"
                })
            ;
        }])


        .controller("bw.test.sprite.Ctrl", function($scope) {
            $scope.showFootman = function() {
                $scope.showSpriteSheet({
                    jsonUrl: "../assets/sprites/footman.json",
                    gridMode: true
                    //gridMode: false
                });
            };

            $scope.showFootman();
        })
    ;

})();