// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FB, Board) {
  return function(gameId) {

    var gameRef = new FB(gameId)
    var playersRef = gameRef.child('players')    
    
    var gameStatusRef = gameRef.child('gameStatus')
    var gameStatusMessage = "";
    var all = []
    var myname = null


    function join(player) {
      myname = player.name
      player.x = 0
      player.y = 0
      player.sprite = '1'
      player.facing = "down"
      player.state = "alive"
      player.wins = 0
      player.losses = 0
      playersRef.child(player.name).set(player);
    }

    // what can change on a person?
    // position = {x, y, facing}
    // then you can bind to it separately

    function listen() {
      playersRef.on('child_added', FB.apply(onJoin))
      playersRef.on('child_changed', FB.apply(onUpdate))
      playersRef.on('child_removed', FB.apply(onQuit))
      gameStatusRef.on('value', FB.apply(onGameStatusChange))
    }

    function onJoin(player) {
      if (player.name == myname) {
        players.current = player
      }
      all.push(player)
    }

    function onUpdate(remotePlayer) {
      var player = playerByName(remotePlayer.name)
      if (!player) {
        return console.log("Error, player not found: "+remotePlayer.name)
      }

      // copy as many properites as you care about
      player.x = remotePlayer.x
      player.y = remotePlayer.y
      player.facing = remotePlayer.facing
      player.state = remotePlayer.state;
      player.wins = player.wins;
      player.losses = player.losses;
    }

    function onQuit(player) {
      all = all.filter(function(p) {
        return (p.name != player.name)
      })
    }

    function killPlayer(player) {
      playersRef.child(player.name).child("state").set("dead")
      playerLosses = playerByName(player.name).losses
      playersRef.child(player.name).child("losses").set(playerLosses+1)
    }

    function onGameStatusChange(gamestatus) {
      console.log("onGameStatusChange ",gamestatus)

      if (gamestatus == null) {
        gameStatusRef.set({status:"playing", winner: "", message: ""})
      } else if (gamestatus.status == "playing") {
        console.log("status: playing")
        gameStatusMessage = gamestatus.message;
      } else if (gamestatus.status == "over") {
        gameStatusMessage = gamestatus.message;
        if (myname == gamestatus.winner) {
          all.forEach(function(val,key) {
            updateRef(playersRef.child(val.name),{state:"alive"})
          });
          setTimeout(function() {
            gameStatusRef.set({status:"playing", winner: "", message:""});
          },2000)  
        }
        //alert("Game over!  "+gamestatus.winner+" won!")
      }
    } 

    function move(player) {
      var playerRef = getPlayerRef(player.name)
      FB.update(playerRef, player)
    }

    function getPlayerRef(name) {
      return playersRef.child(name)
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
      killPlayer: killPlayer,
      gameStatusMessage: gameStatusMessage
    }

    return players
  }

})

