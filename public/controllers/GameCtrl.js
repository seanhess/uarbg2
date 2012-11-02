
function GameCtrl($scope, Players) {
  $scope.players = Players

  $scope.position = function (player) {
    return {left: player.x * 30 + "px", top: player.y * 30 + "px"}
  }

  $scope.moveRight = function (player) {
    player.x += 1
  }

  // temporary
  $scope.clickBoard = function() {

  }

  $scope.test = function() {
    console.log("TEST")

  }

  $scope.keypress = function (e) {
      var left = 37,
          up = 38,
          right = 39, 
          down = 40;

      if(e.keyCode === up) {
        Players.current.y -= 1  
      }

      if(e.keyCode === right) {
        Players.current.x += 1  
      }

      if(e.keyCode === down) {
        Players.current.y += 1  
      }

      if(e.keyCode === left) {
        Players.current.x -= 1  
      }
  }

  Players.join({name:"sean"})

}
