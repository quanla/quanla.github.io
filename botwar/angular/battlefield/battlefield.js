"use strict";

(function () {

    angular.module('rc.battlefield', [
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

        .factory("Renderers", function() {

            function addBackground(stage, renderer) {
                var grassTexture = PIXI.Texture.fromImage('assets/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }

            function createSpritePool(stage) {

                //var stand_N_texture = PIXI.Texture.fromFrame("footman",'stand_N.png');
                //
                //// create a new Sprite using the texture
                //var bunny = new PIXI.Sprite(stand_N_texture);
                //
                //// center the sprite's anchor point
                //bunny.anchor.x = 0.5;
                //bunny.anchor.y = 0.5;
                //
                //// move the sprite to the center of the screen
                //bunny.position.x = 0;
                //bunny.position.y = 0;
                //
                //stage.addChild(bunny);

                var lastBatch;


                return {
                    prepareSpriteBatch: function () {
                        var usedSprites = {};

                        var freeSprites = lastBatch == null ? {} : lastBatch.usedSprites;

                        function getSprite(type) {

                            var list = freeSprites[type];
                            var sprite;
                            if (list == null || Cols.isEmpty(list)) {
                                var texture = PIXI.Texture.fromFrame("stand_N.png");

                                // create a new Sprite using the texture
                                sprite = new PIXI.Sprite(texture);

                                sprite.anchor.set(0.5);

                                stage.addChild(sprite);
                            } else {
                                sprite = list.shift();
                            }

                            Cols.addList(type, sprite, usedSprites);
                            return sprite;
                        }

                        return lastBatch = {
                            drawUnit: function(unit) {
                                var sprite = getSprite(unit.type);
                                sprite.position.x = unit.x;
                                sprite.position.y = unit.y;
                            },
                            usedSprites: usedSprites,
                            finishBatch: function() {
                                // TODO remove from stage all in freeSprites

                            }
                        };
                    }
                }
            }

            return {
                create: function(holder, width, height) {

                    var renderer = PIXI.autoDetectRenderer(width || 800, height || 600, { antialias: true });
                    holder.appendChild(renderer.view);

                    // create the root of the scene graph
                    var stage = new PIXI.Container();

                    addBackground(stage, renderer);

                    PIXI.loader
                        .add('footman','assets/sprites/footman.json')
                        .load(onAssetsLoaded);

                    var onLoad;


                    function drawGame(game) {

                        var batch = spritePool.prepareSpriteBatch();

                        if (game != null) {
                            for (var i = 0; i < game.sides.length; i++) {
                                var side = game.sides[i];
                                for (var j = 0; j < side.units.length; j++) {
                                    var unit = side.units[j];
                                    batch.drawUnit(unit);
                                }
                            }
                        }
                        batch.finishBatch();
                    }

                    var spritePool;
                    function onAssetsLoaded()
                    {
                        onLoad();

                        spritePool = createSpritePool(stage);

                        animate();
                    }

                    function animate() {
                        drawGame(game);

                        renderer.render(stage);
                        requestAnimationFrame( animate );
                    }

                    var game;

                    return {
                        load: function(onLoad1) {
                            onLoad = onLoad1;
                        },
                        setGame: function(game1) {
                            game = game1;
                        }
                    };
                }
            };
        })
    ;

})();