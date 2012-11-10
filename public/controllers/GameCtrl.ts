///<reference path="../def/angular.d.ts"/>

///<reference path="../services/Missiles"/>
///<reference path="../services/Players"/>
///<reference path="../services/CurrentPlayer"/>
///<reference path="../services/Board"/>
///<reference path="../services/SoundEffects"/>
///<reference path="../services/AppVersion"/>

///<reference path="../filters/position.ts"/>
///<reference path="../directives/keys.ts"/>
///<reference path="../directives/sprite.ts"/>

angular.module('controllers')

.controller('GameCtrl', function ($scope, Players:IPlayerService, Missiles:IMissileService, $routeParams, CurrentPlayer:ICurrentPlayerService, $location, Board:IBoard, SoundEffects:ISoundEffectsService, AppVersion:string) {

  $scope.version = AppVersion
  $scope.gameId = $routeParams.gameId

  // DEBUG: you can set ?debugPlayerName and just hit refresh over and over to reconnect
  if ($routeParams.debugPlayerName)
    CurrentPlayer.player = {name: $routeParams.debugPlayerName, avatar:"player" + Math.floor(Math.random()*6), state: "alive", x:0, y:0, wins:0, losses:0, version:AppVersion}

  // only play if you are identified
  if (!CurrentPlayer.player) 
    return $location.path("/identify")

  // not going to help! The person is still in the game!
  //if (AppVersion != Player.latestVersion()) {
    //alert("Your version " + AppVersion + " is out of date. Reloading...")
    //window.location.reload()
    //return
  //}

  var players = Players.connect($scope.gameId)
  Players.join(players, CurrentPlayer.player)
  $scope.players = players

  var missiles = Missiles.connect($scope.gameId, players)
  $scope.missiles = missiles

  $scope.latestAlert = "Welcome to Your Underwater Adventure"

  $scope.$on("kill", function(e, player) {
    $scope.latestAlert = player.killer + " blew up " + player.name
    SoundEffects.explosion()
  })

  $scope.$on("missile", function(e, player) {
    SoundEffects.rocket()
  })


  // AUDIO
  //SoundEffects.music()

  $scope.test = function() {
    //SoundEffects.rocket()
  }

  var LEFT = 37,
      UP = 38,
      RIGHT = 39, 
      DOWN = 40,
      SPACE = 32

  function keyCodeToDirection(code:number):string {
    if (code == LEFT) return Board.LEFT
    else if (code == RIGHT) return Board.RIGHT
    else if (code == DOWN) return Board.DOWN
    else if (code == UP) return Board.UP
    return null
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
        Missiles.fireMissile(missiles, players.current)
      }

      else {
        var boardDirection = keyCodeToDirection(e.keyCode)
        if (!boardDirection) return
        var position = Board.getPosition(boardDirection)
        var location = Board.move(players.current, position)
        if (location && players.current.state != "dead") {
          players.current.walking = true;

          setTimeout(function(){
            $scope.$apply(function() {
              players.current.walking = false;
              Players.move(players, players.current);
            });
          }, 500);

          /*players.current[location.axis] = location.location;
          players.current.facing = location.facing;
          players.move(players.current);*/

          var collision = false;
          Players.alivePlayers(players.all).forEach(function(val,key){
            if (val.name != players.current.name && val.state != "dead") {
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
            Players.move(players, players.current);
          } else {
            // we can play a collision sound here!
          }
        }
      }
  }
})
