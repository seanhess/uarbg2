// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services').factory('Players', function($rootScope, FB, Board, AppVersion) {
  return function(gameId) {

    var taunt_list = [
      "Oooh yeah!",
      "I fart in your general direction.",
      "Your mother was a hamster and your father smelt of elderberries.",
      "All your base are belong to us!",
      "OK, next round, try it WITH your glasses on.",
      "If your daddy's aim is as bad as yours, I'm surprised you're here at all!"
      ]

    var STATE_ALIVE = "alive"
    var STATE_DEAD = "dead"

    var gameRef = new FB(gameId)
    var playersRef = gameRef.child('players')    
    
    var all = []
    var myname = null
    var isPaidVal = isPaid();

    function join(player) {
      //console.log("Join:", player.name)
      myname = player.name
      player.x = Board.randomX()
      player.y = Board.randomY()
      player.sprite = '1'
      player.facing = "down"
      player.state = STATE_ALIVE
      player.wins = player.wins || 0
      player.losses = player.losses || 0
      player.message = null
      player.version = AppVersion

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
      if (!players.current && player.name == myname) {
        players.current = player
      }
      all.push(player)
    }

    function onUpdate(remotePlayer) {
      var player = playerByName(remotePlayer.name)
      if (!player) {
        return console.log("Error, player not found: "+remotePlayer.name)
      }

      //console.log("Update:", player.name, "state="+player.state)

      // copy as many properites as you care about
      player.x = remotePlayer.x
      player.y = remotePlayer.y
      player.facing = remotePlayer.facing
      player.state = remotePlayer.state;
      player.wins = remotePlayer.wins;
      player.losses = remotePlayer.losses;
      player.walking = remotePlayer.walking;

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
      if (players.current == null || winner != players.current) return

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

      // this can get called with null
      if (!player) {
        players.winner = null
        players.taunt = null
        return
      }

      // don't "WIN" twice if you're already the winner
      if (players.winner && players.winner.name == player.name) return

      // set the winner on all computers
      players.winner = player
      players.taunt = taunt_list[Math.floor(Math.random()*taunt_list.length)];

      // only one person should reset the game
      //console.log("ON WINNER")
      //if (players.current) console.log(" - me ", players.current.name)
      //if (player) console.log(" - win", player.name)
      //if (players.winner) console.log(" - old", players.winner.name)
      //console.log("PASSED")

      if (players.current && players.current.name == player.name) {
        setTimeout(resetGame, 3000)
      }
    }

    function resetGame() {
        console.log("Initialize Game")
        // build walls?? (how t
        // for each player, make them alive
        gameRef.child('winner').remove()

        all.forEach(function(player) {
            player.x = Board.randomX()
            player.y = Board.randomY()
            player.sprite = '1'
            player.facing = "down"
            player.state = STATE_ALIVE
            FB.update(playersRef.child(player.name), player)
        })

    }

    // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
    function killPlayer(player) {
      console.log("dead")
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


    function isPaid() {
      return (localStorage.getItem("payment_status") == "paid");
      //return FB.apply(function () {return (localStorage.getItem("payment_status") == "paid")});
    }
    console.log("isPaid()= ",isPaid())
    console.log("isPaidVal= ",isPaidVal)

    function latestVersion() {
      return _(all).max(function(player) {
        return player.version
      })
    }


    var players = { 
      current: null, 
      winner: null,
      taunt: null,
      isPaid: isPaidVal,
      all: all,
      alivePlayers: alivePlayers,
      join: join,
      listen: listen,
      move: move,
      killPlayer: killPlayer,
      playerByName: playerByName,
      latestVersion: latestVersion
    }

    return players
  }

})

