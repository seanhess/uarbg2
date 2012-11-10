angular.module('services').factory('Board', function ($rootScope) {
    var WIDTH = 800;
    var HEIGHT = 600;
    var UNIT = 50;
    var GRID = {
        x: WIDTH / UNIT,
        y: HEIGHT / UNIT
    };
    var Board = {
        move: move,
        getPosition: getPosition,
        isHit: isHit,
        randomX: makeRandomN(GRID.x),
        randomY: makeRandomN(GRID.y),
        LEFT: "left",
        RIGHT: "right",
        UP: "up",
        DOWN: "down"
    };
    return Board;
    function getPosition(direction) {
        if(direction === Board.UP) {
            return {
                axis: 'y',
                distance: -1
            };
        }
        if(direction === Board.RIGHT) {
            return {
                axis: 'x',
                distance: 1
            };
        }
        if(direction === Board.DOWN) {
            return {
                axis: 'y',
                distance: 1
            };
        }
        if(direction === Board.LEFT) {
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
            direction = Board.RIGHT;
        } else {
            if(axis == 'x' && distance < 0) {
                direction = Board.LEFT;
            } else {
                if(axis == 'y' && distance > 0) {
                    direction = Board.DOWN;
                } else {
                    if(axis == 'y' && distance < 0) {
                        direction = Board.UP;
                    } else {
                        console.log("BAD MOVE", axis, distance);
                    }
                }
            }
        }
        if(GRID[axis] <= potential || potential < 0) {
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
