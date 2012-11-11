
// And I like passing the state around instead of making it internal
// but keep it minimal (use state.all instead of state)

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="./AppVersion"/>
///<reference path="./Board"/>

interface IPlayer {
  x:number;
  y:number;

  wins:number;
  losses:number;
  version:string;
  name:string;
  avatar:string;

  direction?:string;
  message?:string;
  killer?:string;

  // alive or dead
  state:string;
}

// only variables
interface IPlayerState {
  current: IPlayer;
  winner: string;
  taunt: string;
  isPaid: bool;
  all: IPlayer [];

  // private stuff. not for binding
  myname:string;
  gameRef:fire.IRef;
  playersRef:fire.IRef;
}

// only methods
interface IPlayerService {

  isAlive(p:IPlayer):bool;
  alivePlayers(players:IPlayer[]):IPlayer[];
  playerByName(players:IPlayer[], name:string):IPlayer;
  latestVersion(players:IPlayer[]):string;

  connect(gameId:string):IPlayerState;
  join(state:IPlayerState, player:IPlayer);
  killPlayer(state:IPlayerState, player:IPlayer, killerName:string);
  move(state:IPlayerState, player:IPlayer);

  // TODO no reset, make a NEW game
  resetGame(state:IPlayerState);
}

angular.module('services')

.factory('Players', function($rootScope:ng.IScope, FB:IFirebaseService, Board:IBoard, AppVersion:any):IPlayerService {
  // the big cheese. Does the deed
  // you can make fancy bindings here, no?

  return {
    isAlive: isAlive,
    alivePlayers: alivePlayers,
    playerByName: playerByName,
    latestVersion: latestVersion,

    connect: connect,
    join: join,
    killPlayer: killPlayer,
    move: move,
    resetGame: resetGame,
  }

  function connect(gameId:string):IPlayerState {

    var gameRef = FB.game(gameId)
    var playersRef = gameRef.child('players')

    var state:IPlayerState = {
      myname:null,
      gameRef:gameRef,
      playersRef:playersRef,

      current: null,
      winner: null,
      taunt: null,
      isPaid: isPaid(),
      all: []
    }

    // better way to bind? nope! that's what they are for!
    playersRef.on('child_added', FB.apply((p) => onJoin(state,p)))
    playersRef.on('child_changed', FB.apply((p) => onUpdate(state,p)))
    playersRef.on('child_removed', FB.apply((p) => onQuit(state,p)))

    gameRef.child('winner').on('value', FB.apply((n) => onWinner(state,n)))

    return state
  }

  function isAlive(p:IPlayer):bool {
    return (p.state == STATE.ALIVE)
  }

  function alivePlayers(players:IPlayer[]):IPlayer[] {
    return players.filter(isAlive)
  }

  // you need to define the functions in here, so they have access to the state!
  function join(state:IPlayerState, player:IPlayer) {

    state.myname = player.name

    player.x = Board.randomX()
    player.y = Board.randomY()
    player.direction = Board.DOWN
    player.state = STATE.ALIVE
    player.wins = player.wins || 0
    player.losses = player.losses || 0
    player.message = null
    player.version = AppVersion.num

    var ref = state.playersRef.child(player.name)
    ref.removeOnDisconnect();
    FB.update(ref, player)
  }

  // what can change on a person?
  function onJoin(state:IPlayerState, player:IPlayer) {
    if (!state.current && player.name == state.myname) {
      state.current = player
    }
    state.all.push(player)
  }

  function onUpdate(state:IPlayerState, remotePlayer:IPlayer) {
    var player = playerByName(state.all, remotePlayer.name)
    if (!player) {
      return console.log("Error, player not found: "+remotePlayer.name)
    }

    //console.log("Update:", player.name, "state="+player.state)

    // copy as many properites as you care about
    player.x = remotePlayer.x
    player.y = remotePlayer.y
    player.direction = remotePlayer.direction
    player.state = remotePlayer.state;
    player.wins = remotePlayer.wins;
    player.losses = remotePlayer.losses;
    //player.walking = remotePlayer.walking;
    if (remotePlayer.killer) player.killer = remotePlayer.killer

    if (player.state == STATE.DEAD) {
      console.log("DEATH", player.name)
      $rootScope.$broadcast("kill", player)
      // EVERYONE needs to check the win, because otherwise the game doesn't end!
      checkWin(state)
    }
  }

  function onQuit(state:IPlayerState, player:IPlayer) {
    state.all = state.all.filter((p) => p.name != player.name)
  }

  function onWinner(state:IPlayerState, name:string) {

    // ignore nulls
    if (!name) {
      state.winner = name
      state.taunt = null
      return
    }

    // ignore if it hasn't changed
    if (name == state.winner) return

    state.winner = name
    state.taunt = TAUNT_LIST[Math.floor(Math.random()*TAUNT_LIST.length)];
    console.log("WE HAVE A WINNER", state.winner)
    $rootScope.$broadcast("winner", name)

    // Now EVERYONE resets the game together
    setTimeout(() => resetGame(state), 1000)

    // don't "WIN" twice if you're already the winner
    //if (state.winner && state.winner.name == player.name)
      //return

    //if (state.current && state.current.name == player.name) {
      //setTimeout(() => resetGame(state), 3000)
    //}
  }

  // reset game
  // immediately makes it playable? 
  // I could move them back
  function resetGame(state:IPlayerState) {
      console.log("Initialize Game")
      // build walls?? (how t
      // for each player, make them alive
      state.gameRef.child('winner').remove()

      state.all.forEach((player) => {
        player.x = Board.randomX()
        player.y = Board.randomY()
        player.direction = Board.DOWN
        player.state = STATE.ALIVE
        FB.update(state.playersRef.child(player.name), player)
      })
  }

  // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
  function killPlayer(state:IPlayerState, player:IPlayer, killerName:string) {
    console.log("KILL", player.name, "by", killerName)
    player.state = STATE.DEAD
    player.losses += 1
    player.killer = killerName
    FB.update(state.playersRef.child(player.name), player)
  }

  // EVERYONE sets winner / game state to over
  // but only the winner can add his score if he's paying attention
  function checkWin(state:IPlayerState) {
    var alive = alivePlayers(state.all)
    if (alive.length > 1) return

    var winner = alive[0]
    console.log("WINNER", winner)
    //if (state.current == null || winner != state.current) return

    // Game is OVER, set the winner
    state.gameRef.child("winner").removeOnDisconnect();
    state.gameRef.child("winner").set(winner.name)

    // only if it is ME, then give yourself a point
    if (winner.name == state.current.name) {
      winner.wins += 1
      state.playersRef.child(winner.name).child("wins").set(winner.wins)
    }
  }

  function move(state:IPlayerState, player:IPlayer) {
    var playerRef = state.playersRef.child(player.name)
    FB.update(playerRef, player)
  }
  
  // just make them class members?
  // your function stuff is CRAP if you don't pass it in. no better than a class
  // property of PLAYERS
  function playerByName(players:IPlayer[], name:string):IPlayer {
    return players.filter((p:IPlayer) => (p.name == name))[0]
  }

  function latestVersion(players:IPlayer[]):string {
    return _.max(players, (player) => player.version)
  }

  // TODO move me into another service
  function isPaid():bool {
    return (localStorage.getItem("payment_status") == "paid");
    //return FB.apply(function () {return (localStorage.getItem("payment_status") == "paid")});
  }

})

// CONSTANTS

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

