
import app = module("../app")
import fb = module("./FB")
import av = module("./AppVersion")

// the angular service returns this IPlayerFactory
export interface IPlayerFactory {
  (gameId:string):IPlayers;
}

export interface IPlayer {
  x:number;
  y:number;
  sprite:string;
  facing:string;
  state:string;
  wins:number;
  losses:number;
  message:string;
  version:string;
  name:string;
  killer:string;
}

// interfaces with RAW objects. that's my STYLE baby.
export interface IPlayers {
  current: IPlayer;
  winner: IPlayer;
  taunt: string;
  isPaid: bool;
  all: IPlayer [];

  // hacky.. switch to some other pattern soon
  // everyone needs to be able to call these function. They take the state into account!
  alivePlayers():IPlayer[];
  join(p:IPlayer);
  listen();
  move(player:IPlayer);
  killPlayer(player:IPlayer, killerName:string);
  playerByName(name:string):IPlayer;
  latestVersion():string;
}

var TAUNT_LIST = [ 
  "Oooh yeah!"
  , "I fart in your general direction."
  , "Your mother was a hamster and your father smelt of elderberries."
  , "All your base are belong to us!"
  , "OK, next round, try it WITH your glasses on."
  , "If your daddy's aim is as bad as yours, I'm surprised you're here at all!"
  , "Boom!"
]

var STATE = {
  DEAD: "dead",
  ALIVE: "alive"
}

app.main.factory('Players', function($rootScope:ng.IScope, FB:fb.FB, Board, AppVersion:av.IAppVersion) {
  return function(gameId) {

    var gameRef = FB.game(gameId)
    var playersRef = gameRef.child('players')    

    var myname:string;

    var players:IPlayers = {
      current: null,
      winner: null,
      taunt: null,
      isPaid: isPaid(),
      all: [],

      alivePlayers: alivePlayers,
      join: join,
      listen: listen,
      move: move,
      killPlayer: killPlayer,
      playerByName: playerByName,
      latestVersion: latestVersion,
    }

    // you need to define the functions in here, so they have access to the state!
    function join(player:IPlayer) {
      //console.log("Join:", player.name)
      myname = player.name
      player.x = Board.randomX()
      player.y = Board.randomY()
      player.sprite = '1'
      player.facing = "down"
      player.state = STATE.ALIVE
      player.wins = player.wins || 0
      player.losses = player.losses || 0
      player.message = null
      player.version = AppVersion.num

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

      //gameRef.child('winner').on('value', FB.apply(onWinner))
    }

    function onJoin(player:IPlayer) {
      if (!players.current && player.name == myname) {
        players.current = player
      }
      players.all.push(player)
    }

    function onUpdate(remotePlayer:IPlayer) {
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
      //player.walking = remotePlayer.walking;
      if (remotePlayer.killer) player.killer = remotePlayer.killer

      if (player.state == STATE.DEAD) {
        $rootScope.$broadcast("kill", player)
        checkWin()
      }
    }

    function onQuit(player:IPlayer) {
      players.all = players.all.filter((p) => p.name != player.name)
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

    function onWinner(player:IPlayer) {

      // this can get called with null
      if (!player) {
        players.winner = null
        players.taunt = null
        return
      }

      // don't "WIN" twice if you're already the winner
      if (players.winner && players.winner.name == player.name)
        return

      // set the winner on all computers
      players.winner = player
      players.taunt = TAUNT_LIST[Math.floor(Math.random()*TAUNT_LIST.length)];

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

        players.all.forEach((player) => {
            player.x = Board.randomX()
            player.y = Board.randomY()
            player.sprite = '1'
            player.facing = "down"
            player.state = STATE.ALIVE
            FB.update(playersRef.child(player.name), player)
        })
    }

    // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
    function killPlayer(player:IPlayer, killerName:string) {
      player.state = STATE.DEAD
      player.losses += 1
      player.killer = killerName
      FB.update(playersRef.child(player.name), player)
    }

    function move(player:IPlayer) {
      var playerRef = getPlayerRef(player.name)
      FB.update(playerRef, player)
    }

    function getPlayerRef(name:string):any {
      return playersRef.child(name)
    }
    
    // just make them class members?
    // your function stuff is CRAP if you don't pass it in. no better than a class
    // property of PLAYERS
    function playerByName(name:string):IPlayer {
      return players.all.filter((p) => (p.name == name))[0]
    }

    function isAlive(p:IPlayer):bool {
      return (p.state == STATE.ALIVE)
    }

    // this is a property of PLAYERS
    function alivePlayers():IPlayer[] {
      return players.all.filter(isAlive)
    }


    function isPaid():bool {
      return (localStorage.getItem("payment_status") == "paid");
      //return FB.apply(function () {return (localStorage.getItem("payment_status") == "paid")});
    }

    function latestVersion():string {
      return _.max(players.all, (player) => player.version)
    }

    return players
  }

})
