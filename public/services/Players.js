// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FB, Board) {
  return function(gameId) {


    var STATE_ALIVE = "alive"
    var STATE_DEAD = "dead"

    var gameRef = new FB(gameId)
    var playersRef = gameRef.child('players')    
    
    var all = []
    var myname = null

    function join(player) {
      myname = player.name
      player.x = Board.randomX()
      player.y = Board.randomY()
      player.sprite = '1'
      player.facing = "down"
      player.state = STATE_ALIVE
      player.wins = player.wins || 0
      player.losses = player.losses || 0

      var ref = playersRef.child(player.name)
      ref.removeOnDisconnect();
      FB.update(ref, player)
    }

    // what can change on a person?
    // position = {x, y, facing}
    // then you can bind to it separately

    function listen() {
      playersRef.on('child_added', FB.apply(onJoin))
      playersRef.on('child_changed', FB.apply(onUpdate))
      playersRef.on('child_removed', FB.apply(onQuit))

      gameRef.child('winner').on('value', FB.apply(onWinner))
    }

    function onJoin(player) {
      if (player.name == myname) {
        players.current = player
      }
      console.log("pushing ",player)
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
      player.wins = remotePlayer.wins;
      player.losses = remotePlayer.losses;

      if (player.state == STATE_DEAD) checkWin()
    }

    function onQuit(player) {
      all = all.filter(function(p) {
        return (p.name != player.name)
      })
    }

    function checkWin() {
      var alive = alivePlayers()

      if (alive.length > 1) return
      var winner = alive[0]
      if (winner != players.current) return

      // only if is ME
      // why not share the winner with everyone?
      winner.wins += 1
      playersRef.child(winner.name).child("wins").set(winner.wins)
      gameRef.child("winner").removeOnDisconnect();
      FB.update(gameRef.child("winner"), winner)
      // Nobody else should be able to act (already because they are dead)

      // game is set to OVER (missiles finish hitting? like, can you still die?)
      // save the WINNER!

      // YOU WIN

      // kick the game back to zero
      // restart the game in 3 seconds!
      // then turn everyone back to alive! (the winner does this?)
    }

    function onWinner(player) {
      if (!player) {
        players.winner = null
        return
      }
      if (players.winner == player) return
      players.winner = player
      console.log("ON WINNER", player)

      setTimeout(function() {
        console.log("STARTING")
        // set EVERYONE to alive
        // or rather, everyone who is connected, can start a new game?
        // what about a matchId?
        // if it changes you can set yourself to alive?
        gameRef.child('winner').remove()
        all.forEach(join)
      }, 3000)

        //console.log("numStillAlive: "+numStillAlive)
        //if (numStillAlive <= 1)  {
          //console.log("numStillAlive <= 1")
          //console.log("GAME OVER, "+winner+" wins!")
          ////gameStatusRef.set({status:"over", winner: winner, message: winner+" won!"});
          //[>setTimeout(function () {
            //all.forEach(function(val,key) {
              //updateRef(playersRef.child(val.name),{state:"alive"})
            //})
            //gameStatusRef.set({status:"playing", winner: ""});

          //},5000);*/

        //}
    }

    // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
    function killPlayer(player) {
      player.state = STATE_DEAD
      player.losses += 1
      FB.update(playersRef.child(player.name), player)
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

    function isAlive(p) {
      return (p.state == STATE_ALIVE)
    }

    function alivePlayers() {
      return all.filter(isAlive)
    }

    var players = { 
      current: null, 
      winner: null,
      all: all,
      alivePlayers: alivePlayers,
      join: join,
      listen: listen,
      move: move,
      killPlayer: killPlayer,
      playerByName: playerByName,
    }

    return players
  }

})

