
function GameCtrl($scope, Players, Missiles, $routeParams, CurrentPlayer, $location, Board, SoundEffects, AppVersion) {

  $scope.version = AppVersion
  $scope.gameId = $routeParams.gameId

  // DEBUG: you can set ?debugPlayerName and just hit refresh over and over to reconnect
  if ($routeParams.debugPlayerName)
    CurrentPlayer.player = {name: $routeParams.debugPlayerName, avatar:"player" + Math.floor(Math.random()*6), state: "alive"}

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")

  // not going to help! The person is still in the game!
  //if (AppVersion != Player.latestVersion()) {
    //alert("Your version " + AppVersion + " is out of date. Reloading...")
    //window.location.reload()
    //return
  //}

  var players = new Players($scope.gameId, $routeParams.debugPlayerName)
  $scope.players = players

  var missiles = new Missiles($scope.gameId,players)
  $scope.missiles = missiles


  $scope.latestAlert = "Sean blew up Merrick!"


  // AUDIO
  SoundEffects.music()

  $scope.test = function() {

  }

  var LEFT = 37,
      UP = 38,
      RIGHT = 39, 
      DOWN = 40,
      SPACE = 32

  function keyCodeToDirection(code) {
    if (code == LEFT) return Board.LEFT
    else if (code == RIGHT) return Board.RIGHT
    else if (code == DOWN) return Board.DOWN
    else if (code == UP) return Board.UP
    return false
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

  $scope.keypress = function (e) {

      if (e.keyCode === 32) {
        missiles.fireMissile(players.current)
      }

      else {
        var boardDirection = keyCodeToDirection(e.keyCode)
        if (!boardDirection) return
        var position = Board.getPosition(boardDirection)
        var location = Board.move(players.current, position)
        if (location && players.current.status != "dead") {
          players.current.walking = true;

          setTimeout(function(){
            $scope.$apply(function() {
              players.current.walking = false;
              players.move(players.current);
            });
          }, 500);

          /*players.current[location.axis] = location.location;
          players.current.facing = location.facing;
          players.move(players.current);*/

          var collision = false;
          players.alivePlayers().forEach(function(val,key){
            if (val.name != players.current.name && val.status != "dead") {
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
            players.current.facing = location.facing;
            players.move(players.current);
          } else {
            // we can play a collision sound here!
          }
        }
      }
  }

  players.join(CurrentPlayer.player)
  players.listen()
  missiles.listen()
}
