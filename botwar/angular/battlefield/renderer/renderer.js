"use strict";

(function () {

    angular.module('bw.battlefield.renderer', [
    ])
        .factory("UnitTypes", function() {
            var textures = {};

            function getTexture(type, state, stateNum, directionNum) {
                if (stateNum == null) {
                    return textures[type][state][directionNum];
                } else {
                    return textures[type][state][stateNum][directionNum];
                }
            }

            //"spriteSourceSize": {"x":3,"y":4,"w":169,"h":226},
            //"sourceSize": {"w":175,"h":240}

            return {
                init: function() {
                    var dirFeed = [0,1,2,3,4];

                    textures["footman"] = {
                        "stand": Cols.yield(dirFeed, function(i) { return PIXI.Texture.fromFrame("footman_stand_" + i + ".png"); }),
                        walk: Cols.yield([0,1,2,3], function(step) {
                            return Cols.yield(dirFeed, function(dir) { return PIXI.Texture.fromFrame("footman_walk" + step + "_" + dir + ".png"); })
                        })
                    };
                },
                defaultTexture: function(type) {
                    return {
                        texture: getTexture(type, "stand", null, 0)
                    };
                },
                setupSprite: function(sprite, unit, round) {
                    sprite.position.x = unit.position.x;
                    sprite.position.y = unit.position.y;

                    var direction = unit.direction || 0;
                    var num = Math.round(direction / (Math.PI / 4));
                    num = num % 8;
                    if (num > 4) {
                        num = 8 - num;
                        sprite.scale.x = -1;
                    } else {
                        sprite.scale.x = 1;
                    }

                    var state = unit.state || {name: "stand"};

                    var stateNum;
                    if (state.name == "walk") {
                        var aniSpeed = 14;
                        stateNum = Math.floor(Math.floor((round - state.since) / aniSpeed) % 4);
                    }
                    sprite.texture = getTexture(unit.type, state.name, stateNum, num);

                }
            };
        })

        .factory("Renderers", function(UnitTypes, BotRunner, Dynamics) {

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
                            drawUnit: function(unit, round) {
                                var sprite = getSprite(unit.type);
                                UnitTypes.setupSprite(sprite, unit, round);
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


                    function drawGame(game, round) {

                        var batch = spritePool.prepareSpriteBatch();

                        if (game != null) {
                            for (var i = 0; i < game.sides.length; i++) {
                                var side = game.sides[i];
                                for (var j = 0; j < side.units.length; j++) {
                                    var unit = side.units[j];
                                    batch.drawUnit(unit, round);
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

                        requestAnimationFrame( animate );
                    }

                    var round = 0;
                    function animate() {

                        if (game != null) {
                            BotRunner.runBots(game, round);

                            Dynamics.applyDynamics(game);

                            drawGame(game, round);

                            round++;
                        }

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
                            round = 0;
                        }
                    };
                }
            };
        })
    ;

})();