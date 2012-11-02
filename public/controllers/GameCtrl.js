
function GameCtrl($scope, Players, Board) {
  var players = new Players('fake')
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

  players.join({name:"sean"})

}
