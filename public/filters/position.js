

angular.module("filters")
  .filter("position", function(Board) {
    return function(object) {
      return {left: object.x * Board.unit + "px", top: object.y * Board.unit + "px"}
    }
  })

angular.module("filters")
  .filter("tauntposition", function(Board) {
    return function(object) {
      return {left: (object.x+1) * Board.unit + "px", top: object.y * Board.unit + "px"}
    }
  })