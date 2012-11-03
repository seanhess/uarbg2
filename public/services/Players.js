// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FirebaseChannel, Board) {
  return function(gameId) {

    var gameRef = new FirebaseChannel(gameId)
    var playersRef = gameRef.child('players')    
    
    var gameStatusRef = gameRef.child('gameStatus')

    var all = []
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
      player.facing = remotePlayer.facing
      player.state = remotePlayer.state;
    }

    function onQuit(player) {
      all = all.filter(function(p) {
        return (p.name != player.name)
      })
    }

    function killPlayer(player) {
      updateRef(playersRef.child(player.name),{state: 'dead'})
    }


    // updates only a few keys, instead of having to set all of them.
    function updateRef(ref, vals){
      ref.once('value', function(dataSnapshot) {
        var oldvals = dataSnapshot.val();
        var key;
        //console.log("updateRef oldvals: ",oldvals);
        for (key in vals) {
          if (vals.hasOwnProperty(key)) {
            oldvals[key] = vals[key];
          }
        }
        //console.log("updateRef update: ",oldvals)
        ref.set(oldvals);
      });
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
      //playersRef.child(player.name).set({name: player.name, x:player.x, y: player.y, avatar: player.avatar, facing: player.facing, state: player.state})
      updateRef(playersRef.child(player.name), {x:player.x, y:player.y, facing: player.facing})
    }
    
    function playerByName(name) {
      return all.filter(function(p) {
        return (p.name == name)
      })[0]
    }


    var players = { 
      current: null, 
      all: all,
      join: join,
      listen: listen,
      move: move,
      killPlayer: killPlayer
    }

    return players
  }

})

