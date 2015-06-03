"use strict";

(function () {

    angular.module('bw.sample', [
    ])
        .factory("SampleFightBot", function() {
            return {
                createSampleFightBot: function() {
                    return {
                        run: function (control) {
                            var enemies = control.getEnemies();
                            if (Cols.isEmpty(enemies)) {
                                control.stand();
                                return; // Relax, we won
                            }

                            var minDisE = Cols.findMin(enemies, function(enemy) {
                                return Distance.between(control.position, enemy.position);
                            });

                            control.setDirection(minDisE.position);

                            if (Distance.between(control.position, minDisE.position) > 40) {
                                control.goForward();
                            } else {
                                control.fight();
                            }
                        }
                    };
                }
            };
        })
        .factory("SampleRunBot", function() {
            return {
                createSampleRunBot: function() {
                    return {
                        run: function (control) {
                            var enemies = control.getEnemies();
                            if (Cols.isEmpty(enemies)) {
                                return; // Relax, no one around
                            }

                            var minDisE = Cols.findMin(enemies, function(enemy) {
                                return Distance.between(control.position, enemy.position);
                            });

                            if (Distance.between(control.position, minDisE.position) < 50) {
                                control.direction = Vectors.toVector( Vectors.subtractPos(control.position, minDisE.position)).direction + (Math.PI/4 * Math.random() - Math.PI/8);
                                control.goForward();
                            } else {
                                control.setDirection(minDisE.position);
                                control.stand();
                            }
                        }
                    };
                }
            };
        })
        .factory("SamplePreemptBot", function() {
            return {
                createSamplePreemptBot: function() {
                    return {
                        run: function (control) {
                            var enemies = control.getEnemies();
                            if (Cols.isEmpty(enemies)) {
                                return; // Relax, no one around
                            }

                            var minDisE = Cols.findMin(enemies, function(enemy) {
                                return Distance.between(control.position, enemy.position);
                            });

                            control.setDirection(minDisE.position);
                            if (Distance.between(control.position, minDisE.position) < 70) {
                                control.fight();
                            } else {
                                control.stand();
                            }
                        }
                    };
                }
            };
        })
    ;

})();