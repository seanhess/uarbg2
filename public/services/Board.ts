// I could just use reference


import app = module("../app")

module MAP {
  export var width = 800
  export var height = 600
  export var unit = 50

  export var grid = {
    x:width / unit,
    y:width / unit,
  }
}

// Directions
export var LEFT = "left"
export var RIGHT = "right"
export var UP = "up"
export var DOWN = "down"

export interface IPosition {
  axis:string;
  distance:number;
}

export interface IPoint {
  x:number;
  y:number;
}

export interface IBoard {
  getPosition(direction:string):IPosition;
  move(object:IPoint, position:IPosition);
  isHit(one:IPoint, two:IPoint):bool;
  randomX():number;
  randomY():number;
}

// these are the worst variable names of all time
export interface IMove {
  axis: string;
  location: number;
  facing: string;
}

app.main.factory('Board', function($rootScope:ng.IRootScopeService):IBoard {

  return {
    move: move,
    getPosition: getPosition,
    isHit: isHit,
    randomX: makeRandomN(MAP.grid.x),
    randomY: makeRandomN(MAP.grid.y),
  }

  function getPosition(direction:string):IPosition {

      if(direction === UP) {
        return {axis: 'y', distance: -1}
      }

      if(direction === RIGHT) {
        return {axis: 'x', distance: 1}
      }

      if(direction === DOWN) {
        return {axis: 'y', distance: 1}
      }

      if(direction === LEFT) {
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
    if (axis == 'x' && distance > 0) direction = RIGHT
    else if (axis == 'x' && distance < 0) direction = LEFT
    else if (axis == 'y' && distance > 0) direction = DOWN
    else if (axis == 'y' && distance < 0) direction = UP
    else console.log("BAD MOVE", axis, distance)

    if (MAP.grid[axis] <= potential || potential < 0) {
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
