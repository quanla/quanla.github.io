"use strict";

(function () {

    angular.module('bw.battlefield.game', [
        'bw.battlefield.game.bot'
    ])
        .factory("GameRunner", function(BotRunner, UnitDynamics) {
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
                    }
                }
            }


            return {
                newGameRunner: function(game, options, width, height) {
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

                    initGame(game, width, height);

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
                    var impacts = [];
                    GameUtil.eachUnit(game, function(unit) {
                        unit.velocity = Dynamics.applyAccel(unit.moveAccel, unit.direction, unit.velocity);

                        unit.position = Dynamics.applyVelocity(unit.velocity, unit.position);

                        limitPosition(unit.position, game.battlefield);

                        if (unit.state != null) {
                            if (unit.state.name == "fight") {
                                if ((round - unit.state.since) == UnitTypes.aniSpeed * 3) {
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
                                        unit.moveAccel = 0;
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