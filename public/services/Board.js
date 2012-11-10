define(["require", "exports", "../app"], function(require, exports, __app__) {
    var app = __app__;

    var MAP;
    (function (MAP) {
        MAP.width = 800;
        MAP.height = 600;
        MAP.unit = 50;
        MAP.grid = {
            x: MAP.width / MAP.unit,
            y: MAP.width / MAP.unit
        };
    })(MAP || (MAP = {}));

    exports.LEFT = "left";
    exports.RIGHT = "right";
    exports.UP = "up";
    exports.DOWN = "down";
    app.main.factory('Board', function ($rootScope) {
        return {
            move: move,
            getPosition: getPosition,
            isHit: isHit,
            randomX: makeRandomN(MAP.grid.x),
            randomY: makeRandomN(MAP.grid.y)
        };
        function getPosition(direction) {
            if(direction === exports.UP) {
                return {
                    axis: 'y',
                    distance: -1
                };
            }
            if(direction === exports.RIGHT) {
                return {
                    axis: 'x',
                    distance: 1
                };
            }
            if(direction === exports.DOWN) {
                return {
                    axis: 'y',
                    distance: 1
                };
            }
            if(direction === exports.LEFT) {
                return {
                    axis: 'x',
                    distance: -1
                };
            } else {
                console.log("BAD DIRECTION", direction);
                return null;
            }
        }
        function move(object, position) {
            var axis = position.axis;
            var distance = position.distance;
            var potential = object[axis] + distance;
            var direction;
            if(axis == 'x' && distance > 0) {
                direction = exports.RIGHT;
            } else {
                if(axis == 'x' && distance < 0) {
                    direction = exports.LEFT;
                } else {
                    if(axis == 'y' && distance > 0) {
                        direction = exports.DOWN;
                    } else {
                        if(axis == 'y' && distance < 0) {
                            direction = exports.UP;
                        } else {
                            console.log("BAD MOVE", axis, distance);
                        }
                    }
                }
            }
            if(MAP.grid[axis] <= potential || potential < 0) {
                return null;
            }
            return {
                axis: axis,
                location: potential,
                facing: direction
            };
        }
        function isHit(one, two) {
            return (one.x == two.x && one.y == two.y);
        }
        function makeRandomN(max) {
            return function () {
                return Math.floor(Math.random() * max);
            }
        }
    });
})

