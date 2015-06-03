"use strict";

(function () {

    angular.module('bw.battlefield.game', [
        'bw.battlefield.game.bot'
    ])
        .factory("GameRunner", function(BotRunner, BotControl, UnitDynamics) {
            function initGame(game, width, height) {
                // Fill missing values
                if (game.nature == null) {
                    game.nature = [];
                }

                if (game.battlefield == null) {
                    game.battlefield = {
                        width: width, height: height
                    };
                }

                for (var i = 0; i < game.sides.length; i++) {
                    var side = game.sides[i];
                    for (var j = 0; j < side.units.length; j++) {
                        var unit = side.units[j];
                        if (unit.hitpoint == null) {
                            unit.hitpoint = 100;
                        }
                        unit.side = side;
                    }
                }
            }


            return {
                newGameRunner: function(game, options, width, height) {
                    var skip = options == null || options.skip == null ? 0 : options.skip;
                    var pause = options == null || options.pause == null ? 0 : options.pause;

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

                    initGame(game, width, height);

                    function updateGameState(game) {
                        if (game.isFinished) return;

                        var result = isGameFinished(game);
                        if (result) {
                            game.isFinished = true;
                            if (game.onFinish) {
                                game.onFinish();
                            }
                        }
                    }

                    function isGameFinished(game) {
                        var count = 0;
                        var winningSide;
                        for (var i = 0; i < game.sides.length; i++) {
                            var side = game.sides[i];
                            var hasAlive = Cols.find(side.units, BotControl.alive) != null;
                            if (hasAlive) {
                                winningSide = side;
                                count++;
                                if (count > 1) {
                                    return false;
                                }
                            }
                        }
                        return winningSide;
                    }

                    var round = 0;

                    var gameRunner;
                    return gameRunner = {
                        updateUI: null,
                        onEachRound: function() {
                            if (!skipper() && !pause) {
                                // Decide to move, change state
                                BotRunner.runBots(game, round);

                                // Change velocity, position
                                // action impacts
                                UnitDynamics.applyDynamics(game, round);

                                updateGameState(game);

                                gameRunner.updateUI(round);

                                round++;
                            } else {
                                gameRunner.updateUI(round);
                            }
                        },
                        skip: function(skip1) {
                            skip = skip1;
                        },
                        pause: function(pause1) {
                            pause = pause1;
                        }
                    };
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

                            if (func(unit)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            };
        })

        .factory("UnitDynamics", function(Dynamics, GameUtil, UnitTypes) {
            function limitPosition(pos, battlefield) {
                if (pos.x < 0 + 30) {
                    pos.x = 0 + 30;
                }
                if (pos.y < 0 + 30) {
                    pos.y = 0 + 30;
                }
                if (pos.x >= battlefield.width - 30) {
                    pos.x = battlefield.width - 1 - 30;
                }
                if (pos.y >= battlefield.height - 30) {
                    pos.y = battlefield.height - 1 - 30;
                }
            }

            return {
                applyDynamics: function(game, round) {
                    function impact(type, props) {
                        if (type == "hit") {
                            // Resolve impact
                            GameUtil.eachUnit(game, function(unit) {
                                if (unit.type == "footman") {
                                    if (unit.state != null && unit.state.name == "die" ) {
                                        return; // Immune to damage
                                    }

                                    if (Distance.between(unit.position, props.position) < 15) {
                                        unit.hitpoint -= 50;
                                        unit.isHit = {since: round};

                                        if (unit.hitpoint <= 0) {
                                            unit.state = {
                                                name: "die",
                                                since: round
                                            };
                                            unit.moveAccel = 0;
                                        }
                                    }
                                }
                            });
                        } else if (type == "makeWay") {
                            var blocking = GameUtil.eachUnit(game, function(unit) {
                                if (unit == props.source) {
                                    return;
                                }
                                if (unit.type == "footman") {
                                    if (unit.state != null && unit.state.name == "die" ) {
                                        return; // No need to make way
                                    }

                                    if (Distance.between(unit.position, props.position) < 20) {
                                        return true;
                                    }
                                }
                            });
                            return {
                                then: function(todo) {
                                    if (!blocking) {
                                        todo();
                                    }
                                }
                            };
                        }
                    }

                    GameUtil.eachUnit(game, function(unit) {
                        unit.velocity = Dynamics.applyAccel(unit.moveAccel, unit.direction, unit.velocity);

                        if (unit.velocity != null && unit.velocity.value > 0) {
                            var newPosition = Dynamics.applyVelocity(unit.velocity, unit.position);
                            impact("makeWay", {
                                position: newPosition,
                                source: unit
                            }).then(function() {
                                unit.position = newPosition;
                            });
                        }

                        limitPosition(unit.position, game.battlefield);

                        if (unit.state != null) {
                            if (unit.state.name == "fight") {
                                if ((round - unit.state.since) == UnitTypes.aniSpeed * 3) {
                                    impact("hit", {
                                        position: Vectors.addPos(unit.position, Vectors.vectorPos({
                                            direction: unit.direction,
                                            value: 30
                                        })),
                                        source: unit
                                    });
                                } else if ((round - unit.state.since) == (UnitTypes.aniSpeed * 4)) {
                                    unit.state = null;
                                }
                            } else if (unit.state.name == "die") {
                                if (round - unit.state.since > 2000) {
                                    Cols.remove(unit, unit.side.units);
                                }
                                //unit.isHit = null;
                            }
                        }

                        if (unit.isHit && (round - unit.isHit.since) > 2) {
                            unit.isHit = null;
                        }
                    });

                }
            };
        })

        .factory("Dynamics", function() {

            function applyAccel(accel, direction, velocity) {

                if (accel == null || accel == 0) {
                    return null;
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

})();