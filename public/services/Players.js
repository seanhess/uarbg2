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
          if (data.action == "join") onJoin(data)
          else if (data.action == "move") onMove(data)
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

  function onJoin(data) {
    var player = data.player
    if (player.name == myname) {
      players.current = player
    }
    player.x = 4
    player.y = 2
    all.push(player)
    console.log(all, players.all)
  }

  function onMove(data) {

  }

  var players = { 
    current: null, 
    all: all, 
    join: join 
  }

  return players

})

