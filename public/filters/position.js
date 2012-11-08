define(function(require) {
  var app = require('app')
  app.main
    .filter("position", function(Board) {
      return function(object) {
        return {left: object.x * Board.unit + "px", top: object.y * Board.unit + "px"}
      }
    })

    .filter("tauntposition", function(Board) {
      return function(object) {
        return {left: (object.x+1) * Board.unit + "px", top: object.y * Board.unit + "px"}
      }
    })
})
