
function GameCtrl($scope, Players) {
  var players = new Players('fake')
  $scope.players = players

  $scope.position = function (player) {
    return {left: player.x * 30 + "px", top: player.y * 30 + "px"}
  }
  $scope.missilePosition = function (missile) {
    return {left: missile.x * 30 + "px", top: missile.y * 30 + "px"}
  }


  $scope.keypress = function (e) {
      var left = 37,
          up = 38,
          right = 39, 
          down = 40,
          space = 32;
      
      if(e.keyCode === space) {
        players.fireMissile(players.current)
        console.log("Space hit, firing missile!")
        return // so we don't fire players.move()
      }

      if(e.keyCode === up) {
        players.current.y -= 1  
        players.current.facing = "up"

      }

      if(e.keyCode === right) {
        players.current.x += 1  
        players.current.facing = "right"
      }

      if(e.keyCode === down) {
        players.current.y += 1  
        players.current.facing = "down"
      }

      if(e.keyCode === left) {
        players.current.x -= 1  
        players.current.facing = "left"
      }

      
      players.move(players.current)
  }

  players.join({name:"sean"})

}
