
// And I like passing the state around instead of making it internal
// but keep it minimal (use state.all instead of state)

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="./AppVersion"/>
///<reference path="./Board"/>

interface IPlayer {
  x:number;
  y:number;
  direction:string;

  wins:number;
  losses:number;
  version:string;
  name:string;
  avatar:string;

  taunt?:string;
  killer?:string;

  // alive or dead
  state:string;
}

// only variables
interface IPlayerState {
  current: IPlayer;
  winner: string;
  isPaid: bool;
  all: IPlayer [];
  id?: string;

  // private stuff. not for binding
  myname:string;
  gameRef:fire.IRef;
  playersRef:fire.IRef;

  boundOnJoin?:fire.IRefCB;
  boundOnUpdate?:fire.IRefCB;
  boundOnQuit?:fire.IRefCB;
  boundOnWinner?:fire.IRefCB;
}

// only methods
interface IPlayerService {

  isAlive(p:IPlayer):bool;
  alivePlayers(players:IPlayer[]):IPlayer[];
  playerByName(players:IPlayer[], name:string):IPlayer;
  latestVersion(players:IPlayer[]):string;

  connect(gameId:string, id:string):IPlayerState;
  disconnect(state:IPlayerState);
  join(state:IPlayerState, player:IPlayer);
  killPlayer(state:IPlayerState, player:IPlayer, killerName:string);
  move(state:IPlayerState, player:IPlayer);

  // TODO no reset, make a NEW game
  resetGame(state:IPlayerState);
}

angular.module('services')

.factory('Players', function($rootScope:ng.IScope, FB:IFirebaseService, Board:IBoard, AppVersion:string):IPlayerService {
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
    disconnect: disconnect,
  }

  function connect(gameId:string, id:string):IPlayerState {

    var gameRef = FB.game(gameId)
    var playersRef = gameRef.child('players')

    var state:IPlayerState = {
      myname:null,
      gameRef:gameRef,
      playersRef:playersRef,

      current: null,
      winner: null,
      isPaid: isPaid(),
      all: [],
      id: id,
    }

    state.boundOnJoin = FB.apply((p) => onJoin(state,p))
    state.boundOnUpdate = FB.apply((p) => onUpdate(state,p))
    state.boundOnQuit = FB.apply((p) => onQuit(state,p))
    state.boundOnWinner = FB.apply((n) => onWinner(state,n))

    // better way to bind? nope! that's what they are for!
    playersRef.on('child_added', state.boundOnJoin)
    playersRef.on('child_changed', state.boundOnUpdate)
    playersRef.on('child_removed', state.boundOnQuit)

    gameRef.child('winner').on('value', state.boundOnWinner)

    return state
  }

  function disconnect(state:IPlayerState) {
    state.playersRef.off('child_added', state.boundOnJoin)
    state.playersRef.off('child_changed', state.boundOnUpdate)
    state.playersRef.off('child_removed', state.boundOnQuit)

    state.gameRef.child('winner').off('value', state.boundOnWinner)
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
    player.taunt = null
    player.version = AppVersion

    var ref = state.playersRef.child(player.name)
    ref.removeOnDisconnect();
    FB.update(ref, player)
  }

  // what can change on a person?
  function onJoin(state:IPlayerState, player:IPlayer) {
    // state.current needs to refer to the SAME player you add to the array
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
    player.taunt = remotePlayer.taunt;
    //player.walking = remotePlayer.walking;
    if (remotePlayer.killer) player.killer = remotePlayer.killer

    if (player.state == STATE.DEAD) {
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
      return
    }

    // ignore if it hasn't changed
    if (name == state.winner) return

    state.winner = name
    console.log("WE HAVE A WINNER", state.winner)
    $rootScope.$broadcast("winner", name)

    // Now EVERYONE resets the game together. Since we're all setting it to the same state, it's ok.
    setTimeout(() => resetGame(state), 1000)
    setTimeout(() => startGame(state), 2000)
  }

  // resets game, but does NOT make it playable
  // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
  // at least we can make them be dead
  function resetGame(state:IPlayerState) {
    console.log("Initialize Game")

    state.current.x = Board.randomX()
    state.current.y = Board.randomY()
    state.current.direction = Board.DOWN
    state.current.state = STATE.ALIVE
    state.current.taunt = null

    FB.update(state.playersRef.child(state.current.name), state.current)
  }

  // makes the game playable
  function startGame(state:IPlayerState) {
      console.log("START Game!")
      state.gameRef.child('winner').remove()
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

    // only if it is ME, then give yourself a point and taunt
    if (winner.name == state.current.name) {
      winner.wins += 1
      winner.taunt = TAUNT_LIST[Math.floor(Math.random()*TAUNT_LIST.length)];
      FB.update(state.playersRef.child(winner.name), winner)
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

