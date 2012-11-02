
function GameCtrl($scope, Players, $routeParams, CurrentPlayer, $location, Board) {
  $scope.gameId = $routeParams.gameId

  var players = new Players($scope.gameId)
  $scope.players = players

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
      var position = getPosition(e.keyCode);
      var location = Board.move(players.current, position.axis, position.distance);

      if (location) {
        players.current[location.axis] = location.location;
        players.move(players.current);
      }
  }

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")

  console.log("TESTING", CurrentPlayer.player)
  players.join(CurrentPlayer.player)
  players.listen()
}
