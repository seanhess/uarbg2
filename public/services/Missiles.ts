///<reference path="../def/angular.d.ts"/>
// This service keeps track of the missiles

interface IMissileState {
  all: IMissile[];

  // private stuff
  missilesRef:fire.IRef;
}

interface IMissile extends IPoint {
  x: number;
  y: number;
  direction: string;
  sourcePlayer: string;
}

interface IMissileService {
  connect(gameId:string, players:IPlayerState):IMissileState;
  fireMissile(state:IMissileState, player:IPlayer);
}

angular.module('services')


// TODO use signals / events instead of rootScope stuff
.factory('Missiles', function($rootScope:ng.IRootScopeService, FB:IFirebaseService, Board:IBoard, Players:IPlayerService):IMissileService {

    return {
      connect: connect,
      fireMissile: fireMissile,
    }

    function connect(gameId:string, players:IPlayerState):IMissileState {
      var missilesRef = FB.game(gameId).child('missiles')

      var all = []

      var state = {
        missilesRef:missilesRef,
        all:all,
      }

      missilesRef.on('child_added', FB.apply((m) => onNewMissile(state, players, m)))
      missilesRef.on('child_removed', FB.apply((m) => onRemovedMissile(state)))

      return state
    }

    function missileByPlayerName(missiles:IMissile[], name:string) {
      return missiles.filter(function(m:IMissile) {
        return (m.sourcePlayer == name)
      })[0]
    }

    function playerHasMissile(missiles:IMissile[], player:IPlayer) {
      return missileByPlayerName(missiles, player.name)
    }

    // this does NOT check for deadness. Do that somewhere else
    function fireMissile(state:IMissileState, player:IPlayer) {

      // can only fire one at a time
      if (playerHasMissile(state.all, player)) return

      var missile = {
        x: player.x,
        y: player.y,
        direction: player.direction,
        sourcePlayer: player.name
      }

      state.missilesRef.child(player.name).removeOnDisconnect();
      state.missilesRef.child(player.name).set(missile)
    }

    // everyone moves all missiles
    // only the defending player checks for missile hits

    // TODO use a SINGLE timer for ALL missiles (observer?)
    // TODO do any missiles collide with each other?

    function onNewMissile(state:IMissileState, players:IPlayerState, missile:IMissile) {
      state.all.push(missile)
      $rootScope.$broadcast("missile", missile)

      var missTimer = setInterval(function() {
        $rootScope.$apply(function() {
          moveMissile()
        })
      }, 80);

      function moveMissile() {
        // move the missile
        var position = Board.move(missile, missile.direction)
        if (!position) return explodeMissile(missile)

        missile.x = position.x
        missile.y = position.y
        missile.direction = position.direction

        // Check to see if the missile hits anyone
        var hitPlayer = <IPlayer> Board.findHit(players.all, missile)
        if (hitPlayer) {
          explodeMissile(missile)
          if (hitPlayer == players.current) 
            Players.killPlayer(players, players.current, missile.sourcePlayer)
        }
      }

      // how to do this? should I client-side predict?
      function explodeMissile(missile:IMissile) {
        var idx = state.all.indexOf(missile)
        if (idx != -1) state.all.splice(idx,1)
        clearInterval(missTimer)
        state.missilesRef.child(missile.sourcePlayer).remove()
      }
    }

    function onRemovedMissile(missile) {
      console.log("onRemovedMissile()")
    }
})
