///<reference path="../def/angular.d.ts"/>
///<reference path="../def/underscore.d.ts"/>

interface IPositionChange {
  axis:string;
  distance:number;
}

interface IPoint {
  x:number;
  y:number;
}

interface IDirectional extends IPoint {
  x:number;
  y:number;
  direction:string;
}

interface IBoard {
  move(object:IPoint, direction:string):IDirectional;
  isHit(one:IPoint, two:IPoint):bool;
  randomX():number;
  randomY():number;
  findHit(objects:IPoint[], object:IPoint):IPoint;

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
  direction: string;
}

angular.module('services')

.factory('Board', function($rootScope:ng.IRootScopeService):IBoard {

  var WIDTH = 800
  var HEIGHT = 600
  var UNIT = 50
  var GRID = {
    maxX: WIDTH / UNIT,
    maxY: HEIGHT / UNIT,
  }

  var Board = {
    move: move,
    isHit: isHit,
    findHit: findHit,
    randomX: makeRandomN(GRID.maxX),
    randomY: makeRandomN(GRID.maxY),

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

  function getPositionChange(direction:string):IPositionChange {

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

  // returns a new directional position for you
  function move(object:IPoint, direction:string):IDirectional {

    var dp = getPositionChange(direction)
    if (!dp) return

    // start with the original
    var moved:IDirectional = {
      x: object.x,
      y: object.y,
      direction: direction,
    }

    moved[dp.axis] += dp.distance

    if (!inBounds(moved)) return

    return moved
  }

  function inBounds(p:IPoint) {
    return (0 <= p.x && p.x < GRID.maxX && 0 <= p.y && p.y < GRID.maxY)
  }

  function findHit(objects:IPoint[], object:IPoint):IPoint {
    return objects.filter((obj:IPoint) {
      return Board.isHit(obj, object)
    })[0]
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
