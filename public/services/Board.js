angular.module('services')
.factory('Board', function($rootScope) {

  var map = { 
    width: 800,
    height: 600,
    unit: 50
  }

  map.grid = {
    x: map.width / map.unit,
    y: map.height / map.unit
  }

  console.log(map, map.grid)

  // Directions
  var LEFT = "left"
  var RIGHT = "right"
  var UP = "up"
  var DOWN = "down"

  function getPosition(direction) {
      var position = {}

      if(direction === UP) {
        position.axis = 'y'
        position.distance = -1;
      }

      else if(direction === RIGHT) {
        position.axis = 'x'
        position.distance = 1
      }

      else if(direction === DOWN) {
        position.axis = 'y'
        position.distance = 1
      }

      else if(direction === LEFT) {
        position.axis = 'x'
        position.distance = -1
      }

      else {
        console.log("BAD DIRECTION", direction)
        return false
      }

      return position;
  }

  function move(object, position) {
    var axis = position.axis
    var distance = position.distance
    var potential = object[axis] + distance;
    var direction; 
    if (axis == 'x' && distance > 0) direction = RIGHT
    else if (axis == 'x' && distance < 0) direction = LEFT
    else if (axis == 'y' && distance > 0) direction = DOWN
    else if (axis == 'y' && distance < 0) direction = UP
    else console.log("BAD MOVE", axis, distance)

    if (map.grid[axis] <= potential || potential < 0) {
      return false
    }

    return {
      axis: axis,
      location: potential,
      facing: direction
    }
  }

  return {
    move: move,
    getPosition: getPosition,
    unit: map.unit,
    LEFT: LEFT,
    RIGHT: RIGHT,
    UP: UP,
    DOWN: DOWN,
  }
})
