
function GameCtrl($scope, Players) {
  var players = new Players('fake')
  $scope.players = players

  $scope.position = function (player) {
    return {left: player.x * 30 + "px", top: player.y * 30 + "px"}
  }

  $scope.keypress = function (e) {
      var left = 37,
          up = 38,
          right = 39, 
          down = 40;

      if(e.keyCode === up) {
        players.current.y -= 1  
      }

      if(e.keyCode === right) {
        players.current.x += 1  
      }

      if(e.keyCode === down) {
        players.current.y += 1  
      }

      if(e.keyCode === left) {
        players.current.x -= 1  
      }

      players.move(players.current)
  }

  players.join({name:"sean"})

}
