///<reference path="../def/angular.d.ts"/>

interface IPosition {
  axis:string;
  distance:number;
}

interface IPoint {
  x:number;
  y:number;
}

interface IBoard {
  getPosition(direction:string):IPosition;
  move(object:IPoint, position:IPosition);
  isHit(one:IPoint, two:IPoint):bool;
  randomX():number;
  randomY():number;

  // constants
  LEFT: string;
  RIGHT: string;
  UP: string;
  DOWN: string;

  WIDTH: number;
  HEIGHT: number;
  UNIT: number;
}

// these are the worst variable names of all time
interface IMove {
  axis: string;
  location: number;
  facing: string;
}

angular.module('services').factory('Board', function($rootScope:ng.IRootScopeService):IBoard {

  var WIDTH = 800
  var HEIGHT = 600
  var UNIT = 50
  var GRID = {
    x: WIDTH / UNIT,
    y: HEIGHT / UNIT,
  }

  var Board = {
    move: move,
    getPosition: getPosition,
    isHit: isHit,
    randomX: makeRandomN(GRID.x),
    randomY: makeRandomN(GRID.y),

    // Direction Constants
    LEFT: "left",
    RIGHT: "right",
    UP: "up",
    DOWN: "down",

    UNIT:UNIT,
    WIDTH:WIDTH,
    HEIGHT:HEIGHT,
  }

  return Board

  function getPosition(direction:string):IPosition {

      if(direction === Board.UP) {
        return {axis: 'y', distance: -1}
      }

      if(direction === Board.RIGHT) {
        return {axis: 'x', distance: 1}
      }

      if(direction === Board.DOWN) {
        return {axis: 'y', distance: 1}
      }

      if(direction === Board.LEFT) {
        return {axis: 'x', distance: -1}
      }

      else {
        console.log("BAD DIRECTION", direction)
        return null
      }
  }

  function move(object:IPoint, position:IPosition) {
    var axis = position.axis
    var distance = position.distance
    var potential = object[axis] + distance;
    var direction; 
    if (axis == 'x' && distance > 0) direction = Board.RIGHT
    else if (axis == 'x' && distance < 0) direction = Board.LEFT
    else if (axis == 'y' && distance > 0) direction = Board.DOWN
    else if (axis == 'y' && distance < 0) direction = Board.UP
    else console.log("BAD MOVE", axis, distance)

    if (GRID[axis] <= potential || potential < 0) {
      return null
    }

    return {
      axis: axis,
      location: potential,
      facing: direction
    }
  }

  function isHit(one:IPoint, two:IPoint):bool {
    return (one.x == two.x && one.y == two.y)
  }

  function makeRandomN(max:number) {
    return function():number {
      return Math.floor(Math.random() * max)
    }
  }
})
