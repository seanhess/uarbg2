
function GameCtrl($scope) {
  $scope.players = [{name: "bob", x: 2, y: 4}]
  $scope.position = function (player) {
    return {left: player.x * 30 + "px", top: player.y * 30 + "px"}
  }

  // temporary
  $scope.clickBoard = function() {
    // do something with pubnub
    PUBNUB.publish({             // SEND A MESSAGE.
        channel : "hello_world",
        message : "CLICK!"
    })
  }


  // TEST

  // LISTEN FOR MESSAGES
    PUBNUB.subscribe({
        channel    : "hello_world",      // CONNECT TO THIS CHANNEL.
 
        restore    : false,              // STAY CONNECTED, EVEN WHEN BROWSER IS CLOSED
                                         // OR WHEN PAGE CHANGES.
 
        callback   : function(message) { // RECEIVED A MESSAGE.
            console.log("BACK receiving")
            console.log(message)
        },
 
        disconnect : function() {        // LOST CONNECTION.
            console.log(
                "Connection Lost." +
                "Will auto-reconnect when Online."
            )
        },
 
        reconnect  : function() {        // CONNECTION RESTORED.
            console.log("And we're Back!")
        },
 
        connect    : function() {        // CONNECTION ESTABLISHED.

          console.log("CONNECTED sending")
 
            PUBNUB.publish({             // SEND A MESSAGE.
                channel : "hello_world",
                message : "Hi from PubNub."
            })
 
        }
    })
}
