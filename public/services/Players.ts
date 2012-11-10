
// And I like passing the state around instead of making it internal
// but keep it minimal (use state.all instead of state)

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="./AppVersion"/>
///<reference path="./Board"/>

interface IPlayer {
  x:number;
  y:number;
  facing:string;
  state:string;
  wins:number;
  losses:number;
  message:string;
  version:string;
  name:string;
  killer:string;
  avatar:string;
  status:string;

  // move this off of player
  walking:bool;
  sprite:number;
}

// only variables
interface IPlayerState {
  current: IPlayer;
  winner: IPlayer;
  taunt: string;
  isPaid: bool;
  all: IPlayer [];

  // private stuff. not for binding
  myname:string;
  gameRef:firebase.IRef;
  playersRef:firebase.IRef;
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
}

angular.module('services').factory('Players', function($rootScope:ng.IScope, FB:firebase.IFB, Board:IBoard, AppVersion:any):IPlayerService {
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
    move: move
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
    player.sprite = 1
    player.facing = "down"
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
  // position = {x, y, facing}
  // then you can bind to it separately

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
    player.facing = remotePlayer.facing
    player.state = remotePlayer.state;
    player.wins = remotePlayer.wins;
    player.losses = remotePlayer.losses;
    //player.walking = remotePlayer.walking;
    if (remotePlayer.killer) player.killer = remotePlayer.killer

    if (player.state == STATE.DEAD) {
      $rootScope.$broadcast("kill", player)
      checkWin(state)
    }
  }

  function onQuit(state:IPlayerState, player:IPlayer) {
    state.all = state.all.filter((p) => p.name != player.name)
  }

  function checkWin(state:IPlayerState) {
    var alive = alivePlayers(state.all)

    if (alive.length > 1) return
    var winner = alive[0]
    if (state.current == null || winner != state.current) return

    // only if is ME
    // why not share the winner with everyone?
    winner.wins += 1
    state.playersRef.child(winner.name).child("wins").set(winner.wins)
    state.gameRef.child("winner").removeOnDisconnect();
    FB.update(state.gameRef.child("winner"), winner)
    // Nobody else should be able to act (already because they are dead)

    // game is set to OVER (missiles finish hitting? like, can you still die?)
    // save the WINNER!

    // YOU WIN

    // kick the game back to zero
    // restart the game in 3 seconds!
    // then turn everyone back to alive! (the winner does this?)
  }

  function onWinner(state:IPlayerState, player:IPlayer) {

    // this can get called with null
    if (!player) {
      state.winner = null
      state.taunt = null
      return
    }

    // don't "WIN" twice if you're already the winner
    if (state.winner && state.winner.name == player.name)
      return

    // set the winner on all computers
    state.winner = player
    state.taunt = TAUNT_LIST[Math.floor(Math.random()*TAUNT_LIST.length)];

    // only one person should reset the game
    //console.log("ON WINNER")
    //if (players.current) console.log(" - me ", players.current.name)
    //if (player) console.log(" - win", player.name)
    //if (players.winner) console.log(" - old", players.winner.name)
    //console.log("PASSED")

    if (state.current && state.current.name == player.name) {
      setTimeout(() => resetGame(state), 3000)
    }
  }

  function resetGame(state:IPlayerState) {
      console.log("Initialize Game")
      // build walls?? (how t
      // for each player, make them alive
      state.gameRef.child('winner').remove()

      state.all.forEach((player) => {
          player.x = Board.randomX()
          player.y = Board.randomY()
          player.sprite = 1
          player.facing = "down"
          player.state = STATE.ALIVE
          FB.update(state.playersRef.child(player.name), player)
      })
  }

  // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
  function killPlayer(state:IPlayerState, player:IPlayer, killerName:string) {
    player.state = STATE.DEAD
    player.losses += 1
    player.killer = killerName
    FB.update(state.playersRef.child(player.name), player)
  }

  function move(state:IPlayerState, player:IPlayer) {
    var playerRef = state.playersRef.child(player.name)
    FB.update(playerRef, player)
  }
  
  // just make them class members?
  // your function stuff is CRAP if you don't pass it in. no better than a class
  // property of PLAYERS
  function playerByName(players:IPlayer[], name:string):IPlayer {
    return players.filter((p) => (p.name == name))[0]
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

