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

            var shipTypes = [
                { no: 6, length: 1 },
                { no: 5, length: 1 },
                { no: 4, length: 2 },
                { no: 3, length: 2 },
                { no: 2, length: 3 },
                { no: 1, length: 4 },
                { no: 0, length: 5 }
            ];

            function createShips() {
                RETRY:
                for (;;) {
                    var ships = [];
                    for (var i = 0; i < shipTypes.length; i++) {
                        var shipType = shipTypes[i];

                        var ship = createShip(shipType.no, shipType.length, ships);
                        if (ship != null) {
                            ships.push(ship);
                        } else {
                            continue RETRY;
                        }
                    }

                    return ships;
                }
            }

            function createShip(no, length, ships) {
                for (var i=0;i < 100; i++) {
                    var start = randomPoint();
                    var direction = Math.floor(Math.random() * 4);

                    var ship = new Ship(no, start, length, direction);

                    if (ship.canPlace(ships)) {
                        return ship;
                    }
                }
                return null;
            }


            function randomPoint() {
                return {x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10)};
            }

            return {
                createNewGame: function(code, options) {
                    if (options==null) {
                        options = {
                            allowLogging: false
                        };
                    }

                    var botFunc = eval("(function() {" + (options.allowLogging ? "" : "var console=null;") + code + "\nreturn Bot;})()");

                    var bot = new botFunc();

                    var attacks = [];

                    var stashedAttacks = [];

                    var ships = createShips(10, 10);

                    var finished = false;

                    function checkAttack(x, y) {
                        for (var i = 0; i < ships.length; i++) {
                            var ship = ships[i];
                            if (ship.on(x, y)) {
                                if (isSank(ship)) {
                                    if (allSank()) {
                                        finished = true;
                                    }
                                    return {
                                       "no": ship.no,        // Piece number
                                       "kind": ['carrier', 'warship', 'submarine', 'cruiser','patrol'][5 - ship.length],      // .. kind: 'carrier', 'warship', 'submarine', 'cruiser' or 'patrol'
                                       "size": ship.length,       // .. size: [1,5]
                                       "x": ship.start.x,          // .. x coordinate: [0,10)
                                       "y": ship.start.y,          // .. y coordinate: [0,10)
                                       "direction": ship.direction == 0 ? "v" : "h" // .. direction: 'h' or 'w'
                                    };
                                } else {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }

                    function attacked(x, y) {
                        return !!Cols.find(attacks, function(a) {
                            return a.x == x && a.y == y;
                        });
                    }

                    function isSank(ship) {
                        return !ship.eachPoint(function(x, y) {
                            // Find a point which is not attacked
                            return !attacked(x, y);
                        });
                    }
                    function allSank() {
                        for (var i = 0; i < ships.length; i++) {
                            var ship = ships[i];
                            if (!isSank(ship)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    function existsAttack(p) {
                        return !!Cols.find(attacks, function(a) { return a.x == p.x && a.y == p.y; });
                    }

                    return {
                        rows: createRows(),
                        isFinished: function() {
                            return finished;
                        },
                        prevTurn: function() {
                            stashedAttacks.push(attacks[attacks.length - 1]);
                            attacks.splice(attacks.length - 1, 1);
                            this.turn --;
                        },
                        ships: ships,
                        nextTurn: function() {
                            if (Cols.isEmpty(stashedAttacks)) {
                                var called = false;
                                var turn = {
                                    attack: function(x, y) {
                                        if (called) {
                                            throw "Hey, you called to attack this turn already";
                                        }
                                        called = true;

                                        var newPoint = {x: x, y: y};
                                        if (existsAttack(newPoint)) {
                                            throw "Hey, you attacked this pos [" + x + "," + y + "] already";
                                        }
                                        attacks.push(newPoint);

                                        var ret = checkAttack(x, y);

                                        return ret;
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
    function findAround(x, y, func) {
        for (var x1 = -1; x1 < 3; x1++) {
            for (var y1 = -1; y1 < 3; y1++) {
                if (func(x + x1, y + y1)) {
                    return true;
                }
            }
        }
        return false;
    }

    var Ship = function(no, start, length, direction) {
        // Not use direction 1, 2
        if (direction == 1) {
            direction = 3;
            start.x -= length - 1;
        }
        if (direction == 2) {
            direction = 0;
            start.y -= length - 1;
        }

        this.no = no;
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
        eachPoint: function(funcXY) {

            var p = ObjectUtil.clone(this.start);
            var directionChange = directionChanges[this.direction];

            for (var i = 0; i < this.length; i++) {
                if (funcXY(p.x, p.y)) {
                    return true;
                }
                directionChange(p);
            }
            return false;
        },
        canPlace: function(ships) {
            return !this.eachPoint(function(x, y) {

                if (x < 0 || x >= 10
                    || y < 0 || y >= 10) {
                    return true;
                }

                for (var j = 0; j < ships.length; j++) {
                    var ship = ships[j];
                    if (findAround(x, y, function(x1, y1) { return ship.on(x1, y1); })) {
                        return true;
                    }
                }
                return false;
            });
        }
    };
})();