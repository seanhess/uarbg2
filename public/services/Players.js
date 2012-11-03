// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FirebaseChannel, Board) {
  return function(gameId) {

    var gameRef = new FirebaseChannel(gameId)
    var playersRef = gameRef.child('players')    
    var missilesRef = gameRef.child('missiles')
    var gameStatusRef = gameRef.child('gameStatus')

    var all = []
    var allMissiles = [/*{x: 3, y: 3, direction:'right', sourcePlayer:"asdfsa"}*/]
    var myname = null


    function join(player) {
      myname = player.name
      player.x = 0
      player.y = 0
      player.sprite = '1'
      player.facing = "down"
      player.state = "alive"
      playersRef.child(player.name).set(player);
    }

    function listen() {
      //if (gameStatusRef.val() == null) gameStatusRef.set({status:"playing", winner: ""});
      playersRef.on('child_added', apply(onJoin))
      playersRef.on('child_changed', apply(onMove))
      playersRef.on('child_removed', apply(onQuit))
      missilesRef.on('child_added', apply(onNewMissile))
      missilesRef.on('child_removed', apply(onRemovedMissile))
      gameStatusRef.on('value',apply(onGameStatusChange))
    }

    function apply(f) {
      return function(ref) {
        if ($rootScope.$$phase)
          return f(ref.val())
        $rootScope.$apply(function() {
          f(ref.val())
        })
      }
    }

    function onJoin(player) {
      if (player.name == myname) {
        players.current = player
      }
      all.push(player)
    }

    function onMove(remotePlayer) {
      var player = playerByName(remotePlayer.name)
      if (!player) {
        return console.log("Error, player not found: "+remotePlayer.name)
      }
      player.x = remotePlayer.x
      player.y = remotePlayer.y
      player.state = remotePlayer.state;
    }

    function onQuit(player) {
      all = all.filter(function(p) {
        return (p.name != player.name)
      })
    }


    // updates only a few keys, instead of having to set all of them.
    function updateRef(ref, vals){
      ref.once('value', function(dataSnapshot) {
        var oldvals = dataSnapshot.val();
        var key;
        console.log("updateRef oldvals: ",oldvals);
        for (key in vals) {
          if (vals.hasOwnProperty(key)) {
            oldvals[key] = vals[key];
          }
        }
        console.log("updateRef update: ",oldvals)
        ref.set(oldvals);
      });
    }

    function fireMissile(player) {
      if (missileByPlayerName(player.name) == null) {
        var missile = {
          x: player.x,
          y: player.y,
          direction: player.facing,
          sourcePlayer: player.name
        }
        console.log("fireMissile()")
        missilesRef.child(player.name).set(missile)
      } else {
        console.log("fireMissile() skipped due to existing missile")
      }
    }


    function onNewMissile(missile) {
      allMissiles.push(missile)
      console.log("onNewMissile()")
      console.log("allMissiles: "+allMissiles)
      var axis,distance
      if (missile.direction === "right") {
        axis='x'
        distance=1
      } else if (missile.direction === "left") {
        axis='x'
        distance=-1
      } else if (missile.direction === "up") {
        axis='y'
        distance=-1
      } else if (missile.direction === "down") {
        axis='y'
        distance=1
      }
      if (missileByPlayerName(missile.sourcePlayer.name) == null) {
        var missTimer
        var missileFunc = function () {
          $rootScope.$apply( function() {
            //console.log("Missile timer missile.x="+missile.x+", missile.y="+missile.y)
            
            var location = Board.move(missile, axis, distance);
            var disposeOfMissile = false
            if (location) {
              missile[axis] = location.location              
              var numStillAlive = 0
              var winner = ""
              all.forEach( function (val,key) {
                if (val.x == missile.x && val.y == missile.y) {
                  updateRef(playersRef.child(val.name),{state: "dead"})
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
              all.forEach( function(val,key) {
                console.log("  all["+key+"]: ",val)
                  
              })
              
              if (numStillAlive <= 1)  {
                console.log("numStillAlive <= 1")
                gameStatusRef.set({status:"over", winner: winner});
                setTimeout(function () {
                  gameStatusRef.set({status:"playing", winner: ""});
                },5000);
              }
            } else { // off screen
              disposeOfMissile = true;
            }
            if (disposeOfMissile) {
              var idx = allMissiles.indexOf(missile)
              if (idx != -1) allMissiles.splice(idx,1);
              console.log("Ending missile timer")
              clearInterval(missTimer);
              if (missile.sourcePlayer == players.current.name) missilesRef.child(missile.sourcePlayer).remove();
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


    function onGameStatusChange(gamestatus) {
      console.log("onGameStatusChange ",gamestatus)
      if (gamestatus == null) {
        gameStatusRef.set({status:"playing", winner: ""})
      } else if (gamestatus.status == "playing") {
        console.log("status: playing")
      } else if (gamestatus.status == "over") {
        alert("Game over!  "+gamestatus.winner+" won!")
      }
    } 

    function move(player) {
      playersRef.child(player.name).set({name: player.name, x:player.x, y: player.y, avatar: player.avatar, facing: player.facing, state: player.state})
      updateRef(playersRef.child(player.name), {x:player.x, y:player.y, facing: player.facing})
      // FIXME figure out how to just set x and y only firing one event
    }
    
    function playerByName(name) {
      return all.filter(function(p) {
        return (p.name == name)
      })[0]
    }

    function missileByPlayerName(name) {
      return allMissiles.filter(function(p) {
        return (p.sourcePlayer == name)
      })[0]
    }

    var players = { 
      current: null, 
      all: all,
      allMissiles: allMissiles,  
      join: join,
      listen: listen,
      move: move,
      fireMissile: fireMissile
    }

    return players
  }

})

