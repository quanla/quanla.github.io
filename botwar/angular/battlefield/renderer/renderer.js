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

            function addBackground(stage, renderer, assetsLoc) {
                var grassTexture = PIXI.Texture.fromImage(assetsLoc + '/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }

            function createSpritePool(game, stage) {
                
                var sides = new ColLink(game.sides,
                    function(side) {
                        // Create side link
                        var units = new ColLink(side.units,
                            function(unit) {
                                
                                var texture = UnitTypes.defaultTexture(unit.type).texture;
                                var sprite = new PIXI.Sprite(texture);

                                sprite.anchor.set(0.5);

                                stage.addChild(sprite);
                                return sprite;
                            },
                            function(sprite) {
                                stage.removeChild(sprite);
                            }
                        );
                        
                        return units;
                    },
                    function(units) {
                        units.removeAll();
                    }
                );

                return {
                    release: function() {
                        sides.removeAll();
                    },
                    sync: function() {
                        sides.sync();
                        sides.link.forEach(function(unitsLink) {
                            unitsLink.l.sync();
                        });
                    },
                    eachSprite: function(funcUnitSprite) {
                        sides.link.forEach(function(sideLink) {
                            var unitsLink = sideLink.l;
                            unitsLink.link.forEach(function(h) {
                                var sprite = h.l;
                                var unit = h.o;
                                funcUnitSprite(unit, sprite);
                            });
                        });
                    }
                }
            }

            return {
                create: function(holder, width, height, assetsLoc) {

                    var renderer = PIXI.autoDetectRenderer(width || 800, height || 600, { antialias: true });
                    holder.appendChild(renderer.view);

                    // create the root of the scene graph
                    var stage = new PIXI.Container();

                    addBackground(stage, renderer, assetsLoc);

                    PIXI.loader
                        .add('footman', assetsLoc + '/sprites/footman.json')
                        .load(onAssetsLoaded);

                    var onLoad;


                    function drawGame(game, round) {
                        spritePool.sync();
                        
                        spritePool.eachSprite(function(unit, sprite) {
                            UnitTypes.setupSprite(sprite, unit, round);
                        });
                    }

                    var spritePool;
                    function onAssetsLoaded()
                    {
                        onLoad();

                        UnitTypes.init();

                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    }

                    var round = 0;
                    var stopped = false;
                    function animate() {

                        if (game != null) {
                            BotRunner.runBots(game, round);

                            Dynamics.applyDynamics(game);

                            drawGame(game, round);

                            round++;
                        }

                        renderer.render(stage);
                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    }

                    var game;

                    return {
                        load: function(onLoad1) {
                            onLoad = onLoad1;
                        },
                        setGame: function(game1) {
                            game = game1;
                            round = 0;
                            if (spritePool != null) {
                                spritePool.release();
                                spritePool = null;
                            }
                            if (game != null) {
                                spritePool = createSpritePool(game, stage);
                            }
                        },
                        destroy: function() {
                            stopped = true;
                        }
                    };
                }
            };
        })
    ;

})();