

angular.module("filters")
  .filter("position", function(Board) {
    return function(object) {
      return {left: object.x * Board.unit + "px", top: object.y * Board.unit + "px"}
    }
  })
