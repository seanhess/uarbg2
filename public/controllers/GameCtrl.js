
function GameCtrl($scope, Players, $routeParams, CurrentPlayer, $location, Board) {
  $scope.gameId = $routeParams.gameId

  // DEBUG: you can set ?debugPlayerName and just hit refresh over and over to reconnect
  if ($routeParams.debugPlayerName)
    CurrentPlayer.player = {name: $routeParams.debugPlayerName, avatar:"player1"}

  var players = new Players($scope.gameId, $routeParams.debugPlayerName)
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

    //super ghetto, i know. just want to get it working.
    //was resetting position when a key other than a direction
    //was being pressed and breaking things
    if(keycode === up ||
       keycode === right ||
       keycode === down ||
       keycode === left) {

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
          position.distance = -1;
        }

        return position;
    }
  }

  function getSprite(newDirection) {
    var slide,
        previousDirection = players.current.facing,
        previous = players.current.sprite,
        newSlide = previous + 1;

    if(newSlide > 3) {
      newSlide = 3;
    }

    if(previousDirection === newDirection) {
      slide = newSlide;
    } else {
      slide = 1;
    }

    return slide;
  }

  $scope.position = function (player) {
    return Board.position(player.x, player.y)
  }

  $scope.keypress = function (e) {
      var position = getPosition(e.keyCode);

      if (e.keyCode === 32) { //space -> fire missile
        players.fireMissile(players.current)
        console.log("Space hit, firing missile!")
      } else if(position) {
        var position = getPosition(e.keyCode);
        if (!position.axis) return
        var location = Board.move(players.current, position.axis, position.distance);

        if (location) {
          players.current[location.axis] = location.location;
          players.current.sprite = getSprite(location.facing);
          players.current.facing = location.facing;
          players.move(players.current);
        }
      }
  }

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")

  console.log("TESTING", CurrentPlayer.player)
  players.join(CurrentPlayer.player)
  players.listen()
}
