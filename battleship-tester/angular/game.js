"use strict";

(function () {

    angular.module('bt.game', [
    ])
        .factory("GameService", function() {

            function createRows() {
                var rows = [];
                for (var y = 0; y < 10; y++) {
                    var row = [];
                    for (var x = 0; x < 10; x++) {
                        row.push(x);
                    }
                    rows.push(row);
                }
                return rows;
            }

            function createShips() {
                var ships = [];
                ships.push(createShip("6", 1, ships));
                ships.push(createShip("5", 1, ships));
                ships.push(createShip("4", 2, ships));
                ships.push(createShip("3", 2, ships));
                ships.push(createShip("2", 3, ships));
                ships.push(createShip("1", 4, ships));
                ships.push(createShip("0", 5, ships));
                return ships;
            }

            function createShip(name, length, ships) {
                for (;;) {
                    var start = randomPoint();
                    var direction = Math.floor(Math.random() * 4);

                    var ship = new Ship(name, start, length, direction);

                    if (ship.canPlace(ships)) {
                        return ship;
                    }
                }
            }


            function randomPoint() {
                return {x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10)};
            }

            return {
                createNewGame: function(code) {
                    var botFunc = eval("(function() {" + code + "\nreturn Bot;})()");

                    var bot = new botFunc();

                    var attacks = [];

                    var stashedAttacks = [];

                    var ships = createShips(10, 10);
                    return {
                        rows: createRows(),
                        prevTurn: function() {
                            stashedAttacks.push(attacks[attacks.length - 1]);
                            attacks.splice(attacks.length - 1, 1);
                            this.turn --;
                        },
                        ships: ships,
                        nextTurn: function() {
                            if (Cols.isEmpty(stashedAttacks)) {
                                var turn = {
                                    attack: function(x, y) {
                                        attacks.push({x: x, y: y});
                                    }
                                };
                                bot.play(turn);
                            } else {
                                attacks.push(stashedAttacks[stashedAttacks.length - 1]);
                                stashedAttacks.splice(stashedAttacks.length - 1, 1);
                            }
                            this.turn ++;
                        },
                        attacked: function(x, y) {
                            return Cols.find(attacks, function(a) { return a.x == x && a.y == y;}) != null;
                        },
                        getShip: function(x, y) {
                            return Cols.find(ships, function(ship) {
                                return ship.on(x, y);
                            });
                        },
                        turn: 0,
                        bot: bot
                    };
                }
            };
        })

    ;


    var directionChanges = {
        0: function(p) {
            p.y--;
        },
        1: function(p) {
            p.x++;
        },
        2: function(p) {
            p.y++;
        },
        3: function(p) {
            p.x--;
        }
    };

    var Ship = function(name, start, length, direction) {
        this.name = name;
        this.start = start;
        this.length = length;
        this.direction = direction;
    };
    Ship.prototype = {
        on: function(x, y) {
            var p = ObjectUtil.clone(this.start);
            var directionChange = directionChanges[this.direction];

            for (var i = 0; i < this.length; i++) {
                if (p.x == x && p.y == y) {
                    return true;
                }

                directionChange(p);
            }
            return false;
        },
        canPlace: function(ships) {

            var p = ObjectUtil.clone(this.start);
            var directionChange = directionChanges[this.direction];

            for (var i = 0; i < this.length; i++) {
                if (p.x < 0 || p.x >= 10
                    || p.y < 0 || p.y >= 10) {
                    return false;
                }

                for (var j = 0; j < ships.length; j++) {
                    var ship = ships[j];
                    if (ship.on(p.x, p.y)) {
                        return false;
                    }
                }

                directionChange(p);
            }
            return true;
        }
    };
})();