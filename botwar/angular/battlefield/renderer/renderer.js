"use strict";

(function () {

    angular.module('bw.battlefield.renderer', [
        'bw.battlefield.renderer.unit'
    ])

        .factory("UnitTexture", function() {
            var textures = {};
            var badgeTextures = {};

            var fixes = {};

            return {
                initTextures: function(resources) {

                    var framesData = resources["footman"]["data"]["frames"];

                    for (var fName in framesData) {
                        textures[fName.replace(/\.png$/, "")] = PIXI.Texture.fromFrame(fName);

                        var frameData = framesData[fName];

                        var fixX = frameData["fixX"];
                        var fixY = frameData["fixY"];
                        if (fixX != null || fixY != null) {
                            fixes[fName.replace(/\.png$/, "")] = {x: fixX, y: fixY};
                        }
                    }


                    var badgeUrl = resources["footman"]["url"].replace(/\.json$/,"_badge.png");
                    var texture = PIXI.Texture.fromImage(badgeUrl);

                    for (var fName in framesData) {
                        var r = framesData[fName].frame;
                        badgeTextures[fName.replace(/\.png$/, "")] = new PIXI.Texture(texture, new PIXI.Rectangle(r.x, r.y, r.w, r.h))
                    }
                },
                getTexture: function(type, state, stateNum, directionNum) {
                    var texture = textures[type + "_" + state + stateNum + "_" + directionNum];
                    if (texture == null) {
                        throw "Can not find texture: " + JSON.stringify(arguments);
                    }
                    return texture;
                },
                getBadgeTexture: function(type, state, stateNum, directionNum) {
                    var texture = badgeTextures[type + "_" + state + stateNum + "_" + directionNum];
                    if (texture == null) {
                        throw "Can not find badgeTexture: " + JSON.stringify(arguments);
                    }
                    return texture;
                },
                fixTexture: function(type, state, stateNum, directionNum) {
                    return fixes[type + "_" + state + stateNum + "_" + directionNum];
                }

            };
        })

        .factory("UnitTypes", function(UnitTexture, FootmanRender) {
            var aniSpeed = 10;

            FootmanRender.aniSpeed = aniSpeed;
            var types = {
                "footman": FootmanRender,
                "circle": {

                    createUnitSprites: function(unit) {
                        var g = new PIXI.Graphics();

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


            return {
                aniSpeed: aniSpeed,
                init: function(resources) {
                    UnitTexture.initTextures(resources);
                },
                createUnitSprites: function(unit) {
                    var unitSprites = types[unit.type].createUnitSprites(unit);
                    unitSprites.unit = unit;
                    return unitSprites;
                }
            };
        })

        .factory("Pixi", function() {
            var loaded = {};
            var loadings = {};
            var onLoads = {};
            return {
                load: function(name, url) {

                    if (!loaded[name] && !loadings[name]) {
                        loadings[name] = true;
                        PIXI.loader
                            .add(name, url)
                            .load(function(evt) {
                                loaded[name] = evt;
                                if (onLoads[name]) {
                                    Fs.invokeAll(onLoads[name], evt);
                                }
                            });
                    }

                    return {
                        then: function(onLoad1) {
                            if (loaded[name]) {
                                onLoad1(loaded[name]);
                            } else {
                                Cols.addList(name, onLoad1, onLoads);
                            }
                        }
                    };
                }
            };
        })

        .factory("UnitSprites", function(UnitTypes) {
            function isAbove(u1, u2) {
                if (u1.state != null && u1.state.name == "die") {
                    return false;
                } if (u2.state != null && u2.state.name == "die") {
                    return true;
                }

                return u1.position.y > u2.position.y;
            }
            return {
                createUnitSprites: function(game, stage) {

                    var orderCache = [];

                    function checkOrder() {
                        for (var i = 0; i < orderCache.length - 1; i++) {
                            var unitSprites1 = orderCache[i];
                            var unitSprites2 = orderCache[i + 1];

                            if (isAbove(unitSprites1.unit, unitSprites2.unit)) {
                                // Swap
                                orderCache[i] = unitSprites2;
                                orderCache[i + 1] = unitSprites1;

                                stage.swapChildren(unitSprites1.container, unitSprites2.container);
                            }

                        }
                    }

                    function createUnitsLink (units) {
                        return new ColLink(units,
                            function (unit) {
                                var unitSprites = UnitTypes.createUnitSprites(unit);

                                stage.addChild(unitSprites.container);
                                orderCache.push(unitSprites);
                                return unitSprites;
                            },
                            function (unitSprites) {
                                Cols.remove(unitSprites,orderCache);
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
                            // Sync to remove or add new sprites
                            sync();

                            eachSprite(function (unit, unitSprites) {
                                // Change appearance, location
                                unitSprites.sync(round);
                            });

                            // Change display order
                            checkOrder();
                        }
                    }
                }
            };
        })

        .factory("Renderers", function(UnitTypes, BotRunner, Dynamics, Pixi, $http) {

            function addBackground(stage, renderer, assetsLoc) {
                var grassTexture = PIXI.Texture.fromImage(assetsLoc + '/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }


            return {
                createRenderer: function(holder, width, height, assetsLoc) {

                    var renderer = PIXI.autoDetectRenderer(width || 800, height || 600, { antialias: false });
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
                    Pixi.load('footman', assetsLoc + '/sprites/footman.json').then(function (event) {
                        if (onLoad) onLoad();
                        loaded = true;

                        UnitTypes.init(event.resources);

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