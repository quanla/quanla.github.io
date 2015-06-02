"use strict";

(function () {

    angular.module('bw.battlefield.renderer', [
    ])
        .factory("UnitTypes", function() {
            var textures = {};

            function getTexture(type, state, stateNum, directionNum) {
                var texture;
                if (stateNum == null) {
                    texture = textures[type][state][directionNum];
                } else {
                    texture = textures[type][state][stateNum][directionNum];
                }
                if (texture == null) {
                    throw "Can not find texture: " + JSON.stringify(arguments);
                }
                return texture;
            }

            var types = {
                "footman": {
                    createUnitSprites: function(unit) {
                        var container = new PIXI.Container();

                        if (unit.decor) {
                            var g = new PIXI.Graphics();
                            g.lineStyle(2, 0x00FF00, 1);
                            g.drawCircle(0, 0, 10);
                            container.addChild(g);
                        }

                        var texture = getTexture(unit.type, "stand", null, 0);

                        var body = new PIXI.Sprite(texture);

                        body.anchor.set(0.5);

                        container.addChild(body);

                        return {
                            container: container,
                            sync: function(round) {
                                container.position.x = unit.position.x;
                                container.position.y = unit.position.y;

                                var state = unit.state || {name: "stand"};

                                var direction = unit.direction || 0;

                                var dirNum = Math.round(direction / (Math.PI / 4));
                                if (state.name == "die") {
                                    dirNum = Math.floor(dirNum / 2) * 2 + 1;
                                }
                                dirNum = dirNum % 8;
                                if (dirNum < 0) dirNum += 8;
                                if (dirNum > 4) {
                                    dirNum = 8 - dirNum;
                                    body.scale.x = -1;
                                } else {
                                    body.scale.x = 1;
                                }

                                if (dirNum == -1) {
                                    console.log(123123);
                                }


                                var stateNum;
                                var stateAge = Math.floor((round - state.since) / aniSpeed);
                                if (state.name == "walk") {
                                    stateNum = Math.floor(stateAge % 4);
                                } else if (state.name == "fight") {
                                    stateNum = Math.floor(stateAge % 4);
                                } else if (state.name == "die") {
                                    stateNum = Math.min(stateAge, 2);
                                }
                                body.texture = getTexture(unit.type, state.name, stateNum, dirNum);
                            }
                        };
                    }
                },
                "circle": {

                    createUnitSprites: function(unit) {
                        var g = new PIXI.Graphics();
                        //g.lineStyle(2, 0x00FF00, 1);
                        g.beginFill(0xFF0000);
                        g.drawCircle(0, 0, 5);
                        g.endFill();

                        return {
                            container: g,
                            sync: function(round) {
                                g.position.x = unit.position.x;
                                g.position.y = unit.position.y;
                            }
                        };
                    }
                }
            };


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
                        }),
                        die: Cols.yield([0,1,2], function(step) {
                            var ret = {};
                            var dirs = [1, 3];
                            dirs.forEach(function(dir) {
                                ret[dir] = PIXI.Texture.fromFrame("footman_die" + step + "_" + dir + ".png");
                            });
                            return ret;
                        })
                    };
                },
                createUnitSprites: function(unit) {
                    return types[unit.type].createUnitSprites(unit);
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

                        function createUnitsLink (units) {
                            return new ColLink(units,
                                function (unit) {
                                    var unitSprites = UnitTypes.createUnitSprites(unit);

                                    stage.addChild(unitSprites.container);
                                    return unitSprites;
                                },
                                function (unitSprites) {
                                    stage.removeChild(unitSprites.container);
                                }
                            )
                        }

                        var sides = new ColLink(game.sides,
                            function(side) {
                                // Create side link
                                return createUnitsLink(side.units);
                            },
                            function(units) {
                                units.removeAll();
                            }
                        );

                        var nature = createUnitsLink(game.nature);

                        function sync() {
                            sides.sync();
                            sides.link.forEach(function (unitsLink) {
                                unitsLink.l.sync();
                            });
                            nature.sync();
                        }
                        function eachSprite(funcUnitSprite) {
                            var eachHandle = function (h) {
                                var unitSprites = h.l;
                                var unit = h.o;
                                funcUnitSprite(unit, unitSprites);
                            };

                            sides.link.forEach(function (sideLink) {
                                var unitsLink = sideLink.l;
                                unitsLink.link.forEach(eachHandle);
                            });
                            nature.link.forEach(eachHandle);
                        }

                        return {
                            release: function () {
                                sides.removeAll();
                                nature.removeAll();
                            },
                            updateSprites: function (round) {
                                sync();

                                eachSprite(function (unit, unitSprites) {
                                    unitSprites.sync(round);
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