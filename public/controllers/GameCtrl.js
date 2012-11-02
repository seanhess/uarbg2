
function GameCtrl($scope, Players, $routeParams, CurrentPlayer, $location, Board) {
  $scope.gameId = $routeParams.gameId

  var players = new Players($scope.gameId)
  $scope.players = players

  $scope.position = function (player) {
    return {left: player.x * 30 + "px", top: player.y * 30 + "px"}
  }
  $scope.missilePosition = function (missile) {
    return {left: missile.x * 30 + "px", top: missile.y * 30 + "px"}
  }

  function getPosition(keycode) {
    var left = 37,
        up = 38,
        right = 39, 
        down = 40;

    var position = {};

    if(keycode === up) {
      position.axis = 'y';
      position.distance = -1; 
    }

    if(keycode === right) {
      position.axis = 'x';
    }

    if(keycode === down) {
      position.axis = 'y';
    }

    if(keycode === left) {
      position.axis = 'x';
      position.distance = -1  
    }

    return position;
  }

  $scope.position = function (player) {
    return Board.position(player.x, player.y)
  }

  $scope.keypress = function (e) {
      if e.keyCode == 32 { //space -> fire missile
        players.fireMissile(players.current)
        console.log("Space hit, firing missile!")
      } else {
        var position = getPosition(e.keyCode);
        var location = Board.move(players.current, position.axis, position.distance);

        if (location) {
          players.current[location.axis] = location.location;
          players.move(players.current);
        }
      }
  }

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")

  players.join(CurrentPlayer.player)
}
