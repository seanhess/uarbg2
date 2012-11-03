// This service keeps track of the missiles

angular.module('services')
.factory('Missiles', function($rootScope, FB, Board) {
  return function(gameId, Players) {

    var gameRef = new FB(gameId)
    var missilesRef = gameRef.child('missiles')

    // {x: 3, y: 3, direction:'right', sourcePlayer:"asdfsa"}
    var allMissiles = []

    function listen() {
      missilesRef.on('child_added', FB.apply(onNewMissile))
      missilesRef.on('child_removed', FB.apply(onRemovedMissile))
    }

    function fireMissile(player) {
      // if the player has a current missile
      if (missileByPlayerName(player.name) == null) {
        var missile = {
          x: player.x,
          y: player.y,
          direction: player.facing,
          sourcePlayer: player.name
        }
        console.log("fireMissile()")
        missilesRef.child(player.name).removeOnDisconnect();
        missilesRef.child(player.name).set(missile)
      } else {
        console.log("fireMissile() skipped due to existing missile")
      }
    }


    function onNewMissile(missile) {
      allMissiles.push(missile)
      console.log("onNewMissile()")
      console.log("allMissiles: "+allMissiles)


      if (missileByPlayerName(missile.sourcePlayer.name) == null) {
        var missTimer
        var missileFunc = function () {
          $rootScope.$apply( function() {
            //console.log("Missile timer missile.x="+missile.x+", missile.y="+missile.y)
            
            var position = Board.getPosition(missile.direction)
            var location = Board.move(missile, position);
            var disposeOfMissile = false
            if (location) {
              missile[position.axis] = location.location              
              var numStillAlive = 0
              var winner = ""
              console.log("Players ",Players)
              console.log("Players.all ",Players.all)
              Players.all.forEach( function (val,key) {
                if (val.x == missile.x && val.y == missile.y) {
                  Players.killPlayer(val)
                  //playersRef.child(val.name).set({name: val.name, x:val.x, y: val.y, avatar: ""/*val.avatar*/, facing: val.facing, state: "dead"})            
                  console.log("Killed "+val.name)
                  disposeOfMissile = true;
                } else {
                  if ( val.state != "dead") {
                    numStillAlive++;
                    winner = val.name;
                  }
                }
              });
              console.log("numStillAlive: "+numStillAlive)
              
              if (numStillAlive <= 1)  {
                console.log("numStillAlive <= 1")
                console.log("GAME OVER, "+winner+" wins!")
                gameStatusRef.set({status:"over", winner: winner, message: winner+" won!"});
                /*setTimeout(function () {
                  all.forEach(function(val,key) {
                    updateRef(playersRef.child(val.name),{state:"alive"})
                  })
                  gameStatusRef.set({status:"playing", winner: ""});

                },5000);*/

              }
            } else { // off screen
              disposeOfMissile = true;
            }
            if (disposeOfMissile) {
              var idx = allMissiles.indexOf(missile)
              if (idx != -1) allMissiles.splice(idx,1);
              console.log("Ending missile timer")
              clearInterval(missTimer);
              if (missile.sourcePlayer == Players.current.name) missilesRef.child(missile.sourcePlayer).remove();
              return false; // I don't think setInterval cares about these
            }
            return true;
          })
        };

        missTimer = setInterval(missileFunc, 100);
        setTimeout(missileFunc,0); // run once so the missile doesn't start ON the player, but already one step in the direction it is moving
      } else {
        console.log("skipped creating missile timer due to existing missile")
      }
    }

    function onRemovedMissile(missile) {
      console.log("onRemovedMissile()")
    }

    function missileByPlayerName(name) {
      return allMissiles.filter(function(p) {
        return (p.sourcePlayer == name)
      })[0]
    }

    function currentPlayerHasMissile(name) {

    }

    var missiles = { 
      allMissiles: allMissiles,  
      listen: listen,
      fireMissile: fireMissile
    }

    return missiles
  }

})

