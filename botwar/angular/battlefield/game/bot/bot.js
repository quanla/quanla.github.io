"use strict";

(function () {

    angular.module('bw.battlefield.game.bot', [
    ])

        .factory("BotControl", function() {
            function alive(unit) {
                return unit.state == null || unit.state.name != "die" ? unit : null;
            }
            function info(unit) {
                return unit== null ? null : {
                    position: ObjectUtil.clone(unit.position)
                };
            }
            return {
                alive: alive,
                createControl: function(unit, round, sides, side) {
                    return {
                        position: ObjectUtil.clone(unit.position),
                        direction: unit.direction,
                        goForward: function() {
                            unit.botActionSince = round;
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
                            unit.botActionSince = round;
                            unit.moveAccel = 0;
                        },
                        stand: function() {
                            unit.state = null;
                            //unit.botActionSince = round;
                            unit.moveAccel = 0;
                        },
                        getEnemies: function() {
                            var total = [];
                            for (var i = 0; i < sides.length; i++) {
                                var side1 = sides[i];
                                if (side1 !== side) {
                                    // Enemy side
                                    var alives = Cols.yield(side1.units, Fs.chain(alive, info));
                                    Cols.addAll(alives, total);
                                }
                            }
                            return total;
                        },
                        setDirection: function(pos) {
                            this.direction = Vectors.toVector( Vectors.subtractPos(pos, unit.position)).direction;
                        }
                    }
                }
            };
        })

        .factory("BotRunner", function(BotControl) {
            function isLocked(unit, round) {
                if (unit.state != null) {
                    if (["fight", "die"].indexOf(unit.state.name) > -1) {
                        return true;
                    } else if (round - unit.botActionSince < 10) {
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
                            if (unit.bot && !isLocked(unit, round)) {

                                var control = BotControl.createControl(unit, round, game.sides, side);

                                unit.bot.run(control);

                                unit.direction = control.direction;
                            }
                        }
                    }
                }
            };
        })

    ;

})();