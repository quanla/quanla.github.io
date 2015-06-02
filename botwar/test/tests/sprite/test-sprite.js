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
            $scope.showFootmanSpriteSheetGrid = function() {
                $scope.showSpriteSheet({
                    jsonUrl: "../assets/sprites/footman.json",
                    gridMode: true
                    //gridMode: false
                });
            };
            $scope.showFootmanSpriteSheetPos = function() {
                $scope.showSpriteSheet({
                    jsonUrl: "../assets/sprites/footman.json",
                    //gridMode: true
                    gridMode: false
                });
            };



            $scope.showFootmanStand = function() {

                function create(position, direction, state, num) {
                    return {
                        type: "footman",
                        position: position,
                        direction: direction,
                        state: {
                            name: state,
                            freezeNum: num
                        },
                        decor: "circle"
                    };
                }

                var units = [];

                function createRow(row, state, num) {
                    for (var i = 0; i < 8; i++) {
                        units.push(create({x: 40 + i * 70, y: 60 * row}, i * Math.PI/4, state, num));
                    }
                }

                var a=1;
                //createRow(a++, "stand", null);
                //createRow(a++, "walk", 0);
                //createRow(a++, "walk", 1);
                //createRow(a++, "walk", 2);
                //createRow(a++, "walk", 3);
                //createRow(a++, "fight", 0);
                //createRow(a++, "fight", 1);
                //createRow(a++, "fight", 2);
                //createRow(a++, "fight", 3);
                //createRow(a++, "die", 0);
                //createRow(a++, "die", 1);
                createRow(a++, "die", 2);

                $scope.showGame({
                    sides: [
                        {
                            color: "blue",
                            units: units
                        }
                    ]
                });
            };
            $scope.showFootmanStand();
        })
    ;

})();