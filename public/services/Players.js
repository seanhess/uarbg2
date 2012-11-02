// This service keeps track of all the current players (in an array), and merges moves into your stuff
// Also lets you join

angular.module('services',[])
.factory('Players', function($rootScope) {

  var channel = "fake"
  var all = []
  var myname = null

  function join(player) {
    myname = player.name

    PUBNUB.subscribe({
      channel: channel,
      restore: false, // stay connected even when browser is closed
      callback: function(data) {
        $rootScope.$apply(function() {
          if (data.action == "join") onJoin(data.player)
          else if (data.action == "move") onMove(data.player)
        })
      },
      disconnect: function(data) {
        console.log("DISCONNECTED!")
      },
      reconnect: function(data) {
        console.log("RECONNECT")
      },
      connect: function(data) {
        PUBNUB.publish({
          channel: channel,
          message: {action:"join", player: player}
        })
      }
    })
  }

  function onJoin(player) {
    if (player.name == myname) {
      players.current = player
    }
    player.x = 4
    player.y = 2
    all.push(player)
  }

  function onMove(remotePlayer) {
    var player = playerByName(remotePlayer.name)
    player.x = remotePlayer.x
    player.y = remotePlayer.y
  }

  function move(player) {
      PUBNUB.publish({
        channel: channel,
        message: {action:"move", player: player}
      })
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
})

