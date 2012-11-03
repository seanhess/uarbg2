angular.module('services')
.factory('Board', function($rootScope) {
  var map = { 
    width: parseInt($('#board').css('width'), 10), 
    height: parseInt($('#board').css('height'), 10),
    unit: 40
  };

  map.grid = {
    x: map.width / map.unit,
    y: map.height / map.unit
  };

  function position(x, y) {
    
    function toPixel(n) {
      return (n * map.unit) + 'px'
    }

    return { 
      left : toPixel(x),
      top: toPixel(y)
    }
  }

  function move(position, axis, distance) {
    distance = distance || 1;

    var potential = position[axis] + distance;

    if (map.grid[axis] <= potential || potential < 0) {
      return false
    };

    return {
      axis: axis,
      location: potential
    }
  }

  return {
    move: move,
    position: position
  };
})