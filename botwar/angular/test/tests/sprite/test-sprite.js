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
                    jsonUrl: "../../assets/sprites/footman.json",
                    gridMode: true
                    //gridMode: false
                });
            };
            $scope.showFootmanSpriteSheetPos = function() {
                $scope.showSpriteSheet({
                    jsonUrl: "../../assets/sprites/footman.json",
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

                function createCol(row, state, num) {
                    for (var i = 0; i < 8; i++) {
                        units.push(create({x: 60 * row, y: 40 + i * 70}, i * Math.PI/4, state, num));
                    }
                }

                var a=1;
                //createCol(a++, "stand", null);
                createCol(a++, "walk", 0);
                createCol(a++, "walk", 1);
                createCol(a++, "walk", 2);
                createCol(a++, "walk", 3);
                //createCol(a++, "fight", 0);
                //createCol(a++, "fight", 1);
                //createCol(a++, "fight", 2);
                //createCol(a++, "fight", 3);
                //createCol(a++, "die", 0);
                //createCol(a++, "die", 1);
                //createCol(a++, "die", 2);

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