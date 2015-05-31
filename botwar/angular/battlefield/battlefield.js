"use strict";

(function () {

    angular.module('bw.battlefield', [
        'bw.battlefield.renderer'
    ])

        .directive("battlefield", function(Renderers) {
            return {
                restrict: "A",
                scope: {
                    game: "=battlefield"
                },
                link: function($scope, elem, attrs) {
                    var renderer = Renderers.create(elem[0], attrs.width, attrs.height);

                    renderer.load(function() {
                        $scope.$apply(function () {
                            $scope.$watch("game", function(game) {
                                renderer.setGame(game);
                            });
                        });
                    });
                }
            };
        })

        .factory("BotRunner", function() {
            return {
                runBots: function(game, round) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];
                            if (unit.bot) {

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

        .factory("Dynamics", function() {
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
                //if (vectorPos.y == 1) {
                //    console.log(direction);
                //}
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
                var toVector = Vectors.toVector({x: p1.x + p2.x, y: p1.y + p2.y});
                //console.log(p1, p2, toVector);
                //console.log(p2);

                return toVector;
            };

            function applyAccel(accel, direction, velocity) {

                if (accel == null) {
                    return velocity;
                }

                // Add vectors
                var result = Vectors.add({value: accel, direction: direction}, velocity || {value: 0, direction: 0});
                //console.log(accel);
                //console.log(direction);
                //console.log(velocity);
                //console.log(result);
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
                //console.log(velocity);
                //console.log(vp);
                return {
                    x: position.x + vp.x,
                    y: position.y + vp.y
                }
            }
            return {
                applyDynamics: function(game) {

                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];

                            unit.velocity = applyAccel(unit.moveAccel, unit.direction, unit.velocity);

                            unit.position = applyVelocity(unit.velocity, unit.position);
                        }
                    }
                }
            };
        })
    ;

})();