
// I have a freaking circular reference. LAME!
// There's no reason to, I guess
// Except that I have no way to bind it otherwise :)
import app = module("../app")
import fb = module("./FB")
import av = module("./AppVersion")

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

export interface IPlayerState {
  current: IPlayer;
  winner: IPlayer;
  taunt: string;
  isPaid: bool;
  all: IPlayer [];

  // private stuff. not for binding
  myname:string;
  gameRef:fb.IRef;
  playersRef:fb.IRef;
}

export class PlayerService {

  // dependencies
  constructor( 
    private $rootScope:ng.IRootScopeService,
    private FB:fb.FB,
    private Board,
    private AppVersion:av.IAppVersion
  ) {}

  // the big cheese. Does the deed
  // you can make fancy bindings here, no?

  connect(gameId:string):IPlayerState {

    var gameRef = this.FB.game(gameId)
    var playersRef = gameRef.child('players')

    var state:IPlayerState = {
      myname:null,
      gameRef:gameRef,
      playersRef:playersRef,

      current: null,
      winner: null,
      taunt: null,
      isPaid: this.isPaid(),
      all: []
    }

    // better way to bind? nope! that's what they are for!
    playersRef.on('child_added', this.FB.apply((p) => this.onJoin(state,p)))
    playersRef.on('child_changed', this.FB.apply((p) => this.onUpdate(state,p)))
    playersRef.on('child_removed', this.FB.apply((p) => this.onQuit(state,p)))

    return state
  }

  isAlive(p:IPlayer):bool {
    return (p.state == STATE.ALIVE)
  }

  alivePlayers(players:IPlayer[]):IPlayer[] {
    return players.filter(this.isAlive)
  }

  // you need to define the functions in here, so they have access to the state!
  join(state:IPlayerState, player:IPlayer) {

    state.myname = player.name

    player.x = this.Board.randomX()
    player.y = this.Board.randomY()
    player.sprite = '1'
    player.facing = "down"
    player.state = STATE.ALIVE
    player.wins = player.wins || 0
    player.losses = player.losses || 0
    player.message = null
    player.version = this.AppVersion.num

    var ref = state.playersRef.child(player.name)
    ref.removeOnDisconnect();
    this.FB.update(ref, player)
  }

  // what can change on a person?
  // position = {x, y, facing}
  // then you can bind to it separately

  onJoin(state:IPlayerState, player:IPlayer) {
    if (!state.current && player.name == state.myname) {
      state.current = player
    }
    state.all.push(player)
  }

  onUpdate(state:IPlayerState, remotePlayer:IPlayer) {
    var player = this.playerByName(state.all, remotePlayer.name)
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
      this.$rootScope.$broadcast("kill", player)
      this.checkWin(state)
    }
  }

  onQuit(state:IPlayerState, player:IPlayer) {
    state.all = state.all.filter((p) => p.name != player.name)
  }

  checkWin(state:IPlayerState) {
    var alive = this.alivePlayers(state.all)

    if (alive.length > 1) return
    var winner = alive[0]
    if (state.current == null || winner != state.current) return

    // only if is ME
    // why not share the winner with everyone?
    winner.wins += 1
    state.playersRef.child(winner.name).child("wins").set(winner.wins)
    state.gameRef.child("winner").removeOnDisconnect();
    this.FB.update(state.gameRef.child("winner"), winner)
    // Nobody else should be able to act (already because they are dead)

    // game is set to OVER (missiles finish hitting? like, can you still die?)
    // save the WINNER!

    // YOU WIN

    // kick the game back to zero
    // restart the game in 3 seconds!
    // then turn everyone back to alive! (the winner does this?)
  }

  onWinner(state:IPlayerState, player:IPlayer) {

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
      setTimeout(() => this.resetGame(state), 3000)
    }
  }

  resetGame(state:IPlayerState) {
      console.log("Initialize Game")
      // build walls?? (how t
      // for each player, make them alive
      state.gameRef.child('winner').remove()

      state.all.forEach((player) => {
          player.x = this.Board.randomX()
          player.y = this.Board.randomY()
          player.sprite = '1'
          player.facing = "down"
          player.state = STATE.ALIVE
          this.FB.update(state.playersRef.child(player.name), player)
      })
  }

  // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
  killPlayer(state:IPlayerState, player:IPlayer, killerName:string) {
    player.state = STATE.DEAD
    player.losses += 1
    player.killer = killerName
    this.FB.update(state.playersRef.child(player.name), player)
  }

  move(state:IPlayerState, player:IPlayer) {
    var playerRef = state.playersRef.child(player.name)
    this.FB.update(playerRef, player)
  }
  
  // just make them class members?
  // your function stuff is CRAP if you don't pass it in. no better than a class
  // property of PLAYERS
  playerByName(players:IPlayer[], name:string):IPlayer {
    return players.filter((p) => (p.name == name))[0]
  }

  latestVersion(players:IPlayer[]):string {
    return _.max(players, (player) => player.version)
  }

  // TODO move me into another service
  isPaid():bool {
    return (localStorage.getItem("payment_status") == "paid");
    //return FB.apply(function () {return (localStorage.getItem("payment_status") == "paid")});
  }
}

app.main.factory('Players', function($rootScope:ng.IScope, FB:fb.FB, Board, AppVersion:av.IAppVersion) {
    return new PlayerService($rootScope, FB, Board, AppVersion)
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

