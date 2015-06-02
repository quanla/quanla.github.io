"use strict";

(function () {

    angular.module('bw.battlefield.game', [

    ])
        .factory("GameRunner", function(BotRunner, UnitDynamics) {
            function initGame(game) {
                // Fill missing values
                if (game.nature == null) {
                    game.nature = [];
                }

                for (var i = 0; i < game.sides.length; i++) {
                    var side = game.sides[i];
                    for (var j = 0; j < side.units.length; j++) {
                        var unit = side.units[j];
                        if (unit.hitpoint == null) {
                            unit.hitpoint = 100;
                        }
                    }
                }
            }


            return {
                newGameRunner: function(game, options) {
                    var skip = options == null || options.skip == null ? 0 : options.skip;

                    var skipped = 0;
                    var skipper = function() {
                        if (skip==0) return false;
                        if (skipped < skip) {
                            skipped++;
                            return true;
                        } else {
                            skipped = 0;
                        }
                        return false;
                    };

                    initGame(game);

                    var round = 0;

                    var gameRunner;
                    return gameRunner = {
                        updateUI: null,
                        onEachRound: function() {
                            if (skipper()) return;

                            // Decide to move, change state
                            BotRunner.runBots(game, round);

                            // Change velocity, position
                            // Create action consequences
                            UnitDynamics.applyDynamics(game, round);

                            gameRunner.updateUI(round);

                            round++;
                        },
                        skip: function(skip1) {
                            skip = skip1;
                        }
                    };
                }
            };
        })

        .factory("BotRunner", function() {
            function isLocked(unit) {
                if (unit.state != null) {
                    if (["fight", "die"].indexOf(unit.state.name) > -1) {
                        return true;
                    }
                }
                return false;
            }
            return {
                runBots: function(game, round) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];
                            if (unit.bot && !isLocked(unit)) {

                                var control = {
                                    direction: unit.direction,
                                    goForward: function() {
                                        if (unit.state != null && unit.state.name == "walk") {
                                            return;
                                        }
                                        unit.state = {
                                            name: "walk",
                                            since: round
                                        };
                                        unit.moveAccel = 1;
                                    },
                                    fight: function() {
                                        unit.state = {
                                            name: "fight",
                                            since: round
                                        };
                                        unit.moveAccel = 0;
                                    }
                                };
                                unit.bot.run(control);

                                unit.direction = control.direction;
                            }
                        }
                    }
                }
            };
        })

        .factory("GameUtil", function() {
            return {
                eachUnit: function(game, func) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];

                            func(unit);
                        }
                    }
                }
            };
        })

        .factory("UnitDynamics", function(Dynamics, GameUtil, UnitTypes) {
            return {
                applyDynamics: function(game, round) {
                    var impacts = [];
                    GameUtil.eachUnit(game, function(unit) {
                        unit.velocity = Dynamics.applyAccel(unit.moveAccel, unit.direction, unit.velocity);

                        unit.position = Dynamics.applyVelocity(unit.velocity, unit.position);

                        if (unit.state != null) {
                            if (unit.state.name == "fight") {
                                if ((round - unit.state.since) == UnitTypes.aniSpeed * 3) {
                                    //game.nature.push({
                                    //    type: "circle",
                                    //    position: Vectors.addPos(unit.position, Vectors.vectorPos({
                                    //        direction: unit.direction,
                                    //        value: 30
                                    //    }))
                                    //});
                                    impacts.push({
                                        type: "hit",
                                        position: Vectors.addPos(unit.position, Vectors.vectorPos({
                                            direction: unit.direction,
                                            value: 30
                                        }))
                                    });
                                } else if ((round - unit.state.since) == (UnitTypes.aniSpeed * 4)) {
                                    unit.state = null;
                                }
                            }
                        }
                    });

                    // Resolve impact
                    GameUtil.eachUnit(game, function(unit) {
                        if (unit.type == "footman") {
                            if (unit.state != null && unit.state.name == "die" ) {
                                return; // Immune to damage
                            }

                            for (var i = 0; i < impacts.length; i++) {
                                var impact = impacts[i];
                                if (Distance.between(unit.position, impact.position) < 15) {
                                    unit.hitpoint -= 50;

                                    if (unit.hitpoint <= 0) {
                                        unit.state = {
                                            name: "die",
                                            since: round
                                        };
                                    }

                                }
                            }
                        }
                    });
                }
            };
        })

        .factory("Dynamics", function() {

            function applyAccel(accel, direction, velocity) {

                if (accel == null) {
                    return velocity;
                }

                // Add vectors
                var result = Vectors.add({value: accel, direction: direction}, velocity || {value: 0, direction: 0});
                // Speed limit
                var maxSpeed = 1;
                if (result.value > maxSpeed) {
                    result.value = maxSpeed;
                } else if (result.value < -maxSpeed) {
                    result.value = -maxSpeed;
                }

                if (Math.abs(result.value) < 0.00001) {
                    return null;
                }

                return result;
            }
            function applyVelocity(velocity, position) {
                if (velocity == null || velocity.value == 0) {
                    return position;
                }
                var vp = Vectors.vectorPos(velocity);
                return {
                    x: position.x + vp.x,
                    y: position.y + vp.y
                }
            }
            return {
                applyAccel: applyAccel,
                applyVelocity: applyVelocity
            };
        })

    ;

    var Vectors = {};
    Vectors.vectorPos = function(v) {
        var calAngle = (Math.PI / 2) - v.direction;
        var x1 = Math.cos(calAngle) * v.value;
        var y1 = Math.sin(calAngle) * v.value;
        return {x: x1, y: -y1};
    };

    Vectors.toVector = function(vectorPos) {
        var value = Math.sqrt(vectorPos.x * vectorPos.x + vectorPos.y * vectorPos.y);
        var direction = -Math.asin(vectorPos.y / value);
        if (vectorPos.x < 0) {
            direction = Math.PI - direction;
        }
        return {
            value: value,
            direction: (Math.PI / 2) - direction
        }
    };
    Vectors.add = function(v1, v2) {
        var p1 = Vectors.vectorPos(v1);
        var p2 = Vectors.vectorPos(v2);
        var toVector = Vectors.toVector(Vectors.addPos(p1, p2));

        return toVector;
    };
    Vectors.addPos = function(p1, p2) {
        return {x: p1.x + p2.x, y: p1.y + p2.y};
    };

    var Distance = {};
    Distance.between = function(p1, p2) {
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
    };
})();