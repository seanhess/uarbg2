
function GameCtrl($scope, Players, Missiles, $routeParams, CurrentPlayer, $location, Board, SoundEffects) {
  $scope.gameId = $routeParams.gameId

  // DEBUG: you can set ?debugPlayerName and just hit refresh over and over to reconnect
  if ($routeParams.debugPlayerName)
    CurrentPlayer.player = {name: $routeParams.debugPlayerName, avatar:"player1"}

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")


  var players = new Players($scope.gameId)
  $scope.players = players

  var missiles = new Missiles($scope.gameId,players)
  $scope.missiles = missiles


  // AUDIO
  SoundEffects.music()

  $scope.test = function() {
    SoundEffects.levelUp()
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
        previous = players.current.sprite;

    if(previousDirection === newDirection) {
      slide = ++previous % 3;
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
        missiles.fireMissile(players.current)
        console.log("Space hit, firing missile!")
      } else if(position) {
        var position = getPosition(e.keyCode);
        if (!position.axis) return
        var location = Board.move(players.current, position.axis, position.distance);

        if (location) {
          var collision = false;
          players.all.forEach(function(val,key){
            if (val.name != players.current.name) {
              if (location.axis == "x") {
                if (val.x == location.location && val.y == players.current.y) collision = true;
              }
              if (location.axis == "y") {
                if (val.y == location.location && val.x == players.current.x) collision = true;
              }
            }
          });
          if (!collision) {
            players.current[location.axis] = location.location;
            players.current.sprite = getSprite(location.facing);
            players.current.facing = location.facing;
            players.move(players.current);
          } else {
            // we can play a collision sound here!
          }
        }
      }
  }

  console.log("TESTING", CurrentPlayer.player)
  players.join(CurrentPlayer.player)
  players.listen()
  missiles.listen()
}
