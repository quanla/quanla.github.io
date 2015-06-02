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

            var aniSpeed = 10;
            return {
                aniSpeed: aniSpeed,
                init: function() {
                    var dirFeed = [0,1,2,3,4];

                    textures["footman"] = {
                        "stand": Cols.yield(dirFeed, function(i) { return PIXI.Texture.fromFrame("footman_stand_" + i + ".png"); }),
                        walk: Cols.yield([0,1,2,3], function(step) {
                            return Cols.yield(dirFeed, function(dir) { return PIXI.Texture.fromFrame("footman_walk" + step + "_" + dir + ".png"); })
                        }),
                        fight: Cols.yield([0,1,2,3], function(step) {
                            return Cols.yield(dirFeed, function(dir) { return PIXI.Texture.fromFrame("footman_fight" + step + "_" + dir + ".png"); })
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
                        stateNum = Math.floor(Math.floor((round - state.since) / aniSpeed) % 4);
                    } else if (state.name == "fight") {
                        stateNum = Math.floor(Math.floor((round - state.since) / aniSpeed) % 4);
                    }
                    sprite.texture = getTexture(unit.type, state.name, stateNum, num);

                }
            };
        })

        .factory("Pixi", function() {
            var loaded = {};
            return {
                load: function(name, url) {
                    var onLoad;

                    if (!loaded[name]) {
                        PIXI.loader
                            .add(name, url)
                            .load(function() {
                                loaded[name] = true;
                                if (onLoad) {
                                    onLoad();
                                }
                            });
                    }

                    return {
                        then: function(onLoad1) {
                            if (loaded[name]) {
                                onLoad1();
                            } else {
                                onLoad = onLoad1;
                            }
                        }
                    };
                }
            };
        })

        .factory("UnitSprites", function(UnitTypes) {
            return {
                create: function(game, stage) {

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


                        function sync() {
                            sides.sync();
                            sides.link.forEach(function (unitsLink) {
                                unitsLink.l.sync();
                            });
                        }
                        function eachSprite(funcUnitSprite) {
                            sides.link.forEach(function (sideLink) {
                                var unitsLink = sideLink.l;
                                unitsLink.link.forEach(function (h) {
                                    var sprite = h.l;
                                    var unit = h.o;
                                    funcUnitSprite(unit, sprite);
                                });
                            });
                        }

                        return {
                            release: function () {
                                sides.removeAll();
                            },
                            updateSprites: function (round) {
                                sync();

                                eachSprite(function (unit, sprite) {
                                    UnitTypes.setupSprite(sprite, unit, round);
                                });
                            }
                        }
                    }
            };
        })

        .factory("Renderers", function(UnitTypes, BotRunner, Dynamics, Pixi) {

            function addBackground(stage, renderer, assetsLoc) {
                var grassTexture = PIXI.Texture.fromImage(assetsLoc + '/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }


            return {
                create: function(holder, width, height, assetsLoc) {

                    var renderer = PIXI.autoDetectRenderer(width || 800, height || 600, { antialias: true });
                    holder.appendChild(renderer.view);

                    // create the root of the scene graph
                    var stage = new PIXI.Container();

                    addBackground(stage, renderer, assetsLoc);

                    var stopped = false;
                    function animate() {

                        if (onEachRound) {
                            onEachRound();
                        }

                        renderer.render(stage);
                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    }

                    var onEachRound;

                    var onLoad;
                    var loaded = false;
                    Pixi.load('footman', assetsLoc + '/sprites/footman.json').then(function () {
                        if (onLoad) onLoad();
                        loaded = true;

                        UnitTypes.init();

                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    });

                    return {
                        load: function(onLoad1) {
                            if (loaded) {
                                onLoad1();
                            } else {
                                onLoad = onLoad1;
                            }
                        },
                        unitStage: stage,
                        onEachRound: function(onEachRound1) {
                            onEachRound = onEachRound1;
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