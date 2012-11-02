// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services')
.factory('Players', function($rootScope, FirebaseChannel) {
  return function(gameId) {

    var gameRef = new FirebaseChannel(gameId)
    var playersRef = gameRef.child('players')
    var all = []
    var myname = null

    function join(player) {
      myname = player.name
      player.x = 0
      player.y = 0
      playersRef.child(player.name).set(player)
    }

    function listen() {
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
      // FIXME figure out how to just set x and y only firing one event
      playersRef.child(player.name).set({name: player.name, x:player.x, y: player.y, avatar: player.avatar})
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
      move: move
    }

    return players
  }

})

