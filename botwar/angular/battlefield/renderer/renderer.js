"use strict";

(function () {

    angular.module('rc.battlefield.renderer', [
    ])
        .factory("UnitTypes", function() {
            var textures = {};

            function getTexture(type, state, directionNum) {
                return textures[type][state][directionNum];
            }

            return {
                init: function() {
                    textures["footman"] = {
                        "stand": [
                            PIXI.Texture.fromFrame("footman_stand_0.png"),
                            PIXI.Texture.fromFrame("footman_stand_1.png"),
                            PIXI.Texture.fromFrame("footman_stand_2.png"),
                            PIXI.Texture.fromFrame("footman_stand_3.png"),
                            PIXI.Texture.fromFrame("footman_stand_4.png")
                        ]
                    };
                },
                defaultTexture: function(type) {
                    return {
                        texture: getTexture(type, "stand", 0)
                    };
                },
                setupSprite: function(sprite, unit) {
                    sprite.position.x = unit.x;
                    sprite.position.y = unit.y;

                    var direction = unit.direction || 0;
                    var num = Math.round(direction / (Math.PI / 4));
                    num = num % 8;
                    if (num > 4) {
                        num = 8 - num;
                        sprite.scale.x = -1;
                    } else {
                        sprite.scale.x = 1;
                    }

                    var texture = getTexture(unit.type, unit.state || "stand", num);
                    sprite.texture = texture;

                }
            };
        })

        .factory("Renderers", function(UnitTypes, BotRunner) {

            function addBackground(stage, renderer) {
                var grassTexture = PIXI.Texture.fromImage('assets/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }

            function createSpritePool(stage) {

                var lastBatch;

                return {
                    prepareSpriteBatch: function () {
                        var usedSprites = {};

                        var freeSprites = lastBatch == null ? {} : lastBatch.usedSprites;

                        function getSprite(type) {

                            var list = freeSprites[type];
                            var sprite;
                            if (list == null || Cols.isEmpty(list)) {
                                var texture = UnitTypes.defaultTexture(type).texture;

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
                                UnitTypes.setupSprite(sprite, unit);
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
                        UnitTypes.init();

                        animate();
                    }

                    function animate() {
                        BotRunner.runBots(game);

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