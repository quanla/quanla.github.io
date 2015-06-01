"use strict";

(function () {

    angular.module('bw.test.sprite', [
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
                $scope.showSpriteSheet("../assets/sprites/footman.json");
            };

            $scope.showFootman();
        })

        .directive("spriteSheetEditor", function($http) {


            return {
                restrict: "A",
                scope: {
                    spriteSheet: "=spriteSheetEditor"
                },
                link: function($scope, elem, attrs) {

                    var width = attrs.width || 800;
                    var height = attrs.height || 600;

                    var editor;
                    $http.get($scope.spriteSheet).success(function(data) {
                        editor = createSpriteSheetEditor(elem[0], width, height, data, $scope.spriteSheet.replace(/\w+\.json$/, '') + data.meta.image);
                    });

                    $scope.$on("$destroy", function() {
                        if (editor) {
                            editor.destroy();
                        }
                    });
                }
            };
        })
    ;

    function createBackground(width, height) {
        var g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF);
        g.drawRect(0, 0, width, height);
        g.endFill();
        return g;
    }

    function createFrameSprite(frameData) {
        var container = new PIXI.Container();

        var g = new PIXI.Graphics();
        g.hitArea = new PIXI.Rectangle(frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h);

        var over = false;

        //g.interactive = true;
        //g.buttonMode = true;


        function paint() {
            g.clear();

            g.moveTo(frameData.frame.x, frameData.frame.y);
            g.lineStyle(1, 0xAAAAAA, 1);
            g.lineTo(frameData.frame.x + frameData.frame.w, frameData.frame.y);
            g.lineTo(frameData.frame.x + frameData.frame.w, frameData.frame.y + frameData.frame.h);
            g.lineTo(frameData.frame.x, frameData.frame.y + frameData.frame.h);
            g.lineTo(frameData.frame.x, frameData.frame.y);

            g.interactive = true;

            if (over) {
                g.beginFill(0xAAAA44, 0.1);
                g.drawRect(frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h);
                g.endFill();
            }
        }

        // set the mouseover callback...
        g.on('mouseover', function() {
            over = true;
            paint();
        });
        g.on('mouseout', function() {
            over = false;
            paint();
        });

        paint();

        container.addChild(g);
        return container;
    }

    function createSpriteSheetEditor(elem, width, height, data, imageUrl) {

        var renderer = PIXI.autoDetectRenderer(width, height, { antialias: true });

        elem.appendChild(renderer.view);

        var stage = new PIXI.Container();

        var background = createBackground(width, height);
        stage.addChild(background);

        var stopped = false;
        if (!stopped) {
            requestAnimationFrame( animate );
        }

        var texture = PIXI.Texture.fromImage(imageUrl);
        stage.addChild(new PIXI.Sprite(texture));

        for (var frameName in data.frames) {
            var frameData = data.frames[frameName];
            var frameSprite = createFrameSprite(frameData);
            stage.addChild(frameSprite);
        }

        function animate() {
            renderer.render(stage);
            if (!stopped) {
                requestAnimationFrame( animate );
            }
        }

        return {
            destroy: function() {
                stopped = true;
            }
        };
    }

})();