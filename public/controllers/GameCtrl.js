
function GameCtrl($scope, Players, $routeParams, CurrentPlayer, $location, Board) {
  $scope.gameId = $routeParams.gameId

  var players = new Players($scope.gameId)
  $scope.players = players

  function getPosition(keycode) {
    var left = 37,
        up = 38,
        right = 39, 
        down = 40;

    //super ghetto, i know. just want to get it working.
    if(keycode === up ||
       keycode === right ||
       keycode === down ||
       keycode === left) {

        var position = {};

        if(keycode === up) {
          position.axis = 'y';
          position.distance = -1; 
          position.direction = 'u';
        }

        if(keycode === right) {
          position.axis = 'x';
          position.direction = 'r';
        }

        if(keycode === down) {
          position.axis = 'y';
          position.direction = 'd';
        }

        if(keycode === left) {
          position.axis = 'x';
          position.distance = -1;
          position.direction = 'l'; 
        }

        return position;
    }
  }

  function getSprite(direction) {
    var newDirection,
        previous = players.current.sprite,
        previousDirection = previous.charAt(0),
        previousSlide = previous.charAt(1)
        newSlide = parseInt(previousSlide) + 1;

    if(newSlide > 3) {
      newSlide = 3;
    }

    if(previousDirection == direction) {
      newDirection = direction + newSlide.toString();
    } else {
      newDirection = direction + "1";
    }

    return newDirection;
  }

  $scope.position = function (player) {
    return Board.position(player.x, player.y)
  }

  $scope.keypress = function (e) {
      var position = getPosition(e.keyCode);

      if(position) {
        var location = Board.move(players.current, position.axis, position.distance);
      }

      if (location) {
        players.current[location.axis] = location.location;
        players.current.sprite = getSprite(position.direction);
        console.log(players.current.sprite)
        players.move(players.current);
      }
  }

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")

  players.join(CurrentPlayer.player)
}
