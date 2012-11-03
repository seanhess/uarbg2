// This service keeps track of the missiles

angular.module('services')
.factory('Missiles', function($rootScope, FB, Board) {
  return function(gameId, Players) {

    var gameRef = new FB(gameId)
    var missilesRef = gameRef.child('missiles')
    var gameStatusRef = gameRef.child('gameStatus')

    // {x: 3, y: 3, direction:'right', sourcePlayer:"asdfsa"}
    var allMissiles = []

    function listen() {
      missilesRef.on('child_added', FB.apply(onNewMissile))
      missilesRef.on('child_removed', FB.apply(onRemovedMissile))
    }

    function fireMissile(player) {
      if (playerHasMissile(player) && Players.current.state != "dead") return

      var missile = {
        x: player.x,
        y: player.y,
        direction: player.facing,
        sourcePlayer: player.name
      }

      missilesRef.child(player.name).removeOnDisconnect();
      missilesRef.child(player.name).set(missile)
    }

    // everyone moves all missiles
    // only the defending player checks for missile hits

    // TODO use a SINGLE timer for ALL missiles (observer?)
    // TODO do any missiles collide with each other?

    function onNewMissile(missile) {
      allMissiles.push(missile)
      console.log("onNewMissile()")
      console.log("allMissiles: "+allMissiles)

      var missTimer = setInterval(function() {
        $rootScope.$apply(function() {
          moveMissile()
        })
      }, 80);

      function moveMissile() {
        // move the missile
        var position = Board.getPosition(missile.direction)
        var location = Board.move(missile, position);
        if (!location) return explodeMissile(missile)
        missile[position.axis] = location.location              

        // Check to see if the missile hits anyone
        var hitPlayer = Players.all.filter(function(player) {
            return Board.isHit(player, missile)
        })[0]

        if (hitPlayer) {
          explodeMissile(missile)
          if (hitPlayer == Players.current) 
            Players.killPlayer(Players.current, missile.sourcePlayer)
        }
      }

      // how to do this? should I client-side predict?
      function explodeMissile(missile) {
        var idx = allMissiles.indexOf(missile)
        if (idx != -1) allMissiles.splice(idx,1)
        clearInterval(missTimer)
        missilesRef.child(missile.sourcePlayer).remove()
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

    function playerHasMissile(player) {
      return missileByPlayerName(player.name)
    }

    var missiles = { 
      allMissiles: allMissiles,  
      listen: listen,
      fireMissile: fireMissile
    }

    return missiles
  }

})

