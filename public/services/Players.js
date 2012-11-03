// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FirebaseChannel, Board) {
  return function(gameId) {

    var gameRef = new FirebaseChannel(gameId)
    var playersRef = gameRef.child('players')    
    var missilesRef = gameRef.child('missiles')

    var all = []
    var allMissiles = [/*{x: 3, y: 3, direction:'right', sourcePlayer:"asdfsa"}*/]
    var myname = null

    var XMAX = 16
    var YMAX = 16

    function join(player) {
      myname = player.name
      player.x = 0
      player.y = 0
      player.facing = "down"

      playersRef.child(player.name).set(player)
    }

    function listen() {
      playersRef.on('child_added', apply(onJoin))
      playersRef.on('child_changed', apply(onMove))
      playersRef.on('child_removed', apply(onQuit))
      missilesRef.on('child_added', apply(onNewMissile))
      missilesRef.on('child_removed', apply(onRemovedMissile))
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
    }

    function onQuit(player) {
      all = all.filter(function(p) {
        return (p.name != player.name)
      })
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
      if (missileByPlayerName(missile.sourcePlayer.name) == null) {
        var missTimer
        missTimer = setInterval(function () {
          $rootScope.$apply( function() {
            console.log("Missile timer missile.x="+missile.x+", missile.y="+missile.y)
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
            var location = Board.move(missile, axis, distance);

            if (location) {
              missile[axis] = location.location              
            } else { // off screen
              var idx = allMissiles.indexOf(missile)
              if (idx != -1) allMissiles.splice(idx,1);
              console.log("Ending missile timer")
              clearInterval(missTimer);
              if (missile.sourcePlayer == players.current.name) missilesRef.child(missile.sourcePlayer).remove();
              return false; // I don't think setInterval cares about these

            }
            return true;
          })
        }, 100);
      } else {
        console.log("skipped creating missile timer due to existing missile")
      }
    }

    function onRemovedMissile(missile) {
      console.log("onRemovedMissile()")
    }

    function move(player) {
      playersRef.child(player.name).set({name: player.name, x:player.x, y: player.y, avatar: player.avatar, facing: player.facing})
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

