// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FirebaseChannel) {
  console.log("PS")
  return function(gameId) {

    var gameRef = new FirebaseChannel(gameId)
    var playersRef = gameRef.child('players')
    var all = []
    var myname = null

    function join(player) {
      console.log("JOIN", player)
      myname = player.name
      player.x = 0
      player.y = 0

      // ugly! figure out how to do rootScope.apply better!
      playersRef.child(player.name).set(player)
      playersRef.on('child_added', apply(onJoin))
      playersRef.on('child_changed', apply(onMove))
      playersRef.on('child_removed', apply(onQuit))
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
      player.x = remotePlayer.x
      player.y = remotePlayer.y
    }

    function onQuit(player) {
      all = all.filter(function(p) {
        return (p.name != player.name)
      })
    }

    function move(player) {
      playersRef.child(player.name).set({name: player.name, x:player.x, y: player.y})
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
      move: move
    }

    return players
  }

})

