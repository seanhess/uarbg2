define(["require", "exports", "../app"], function(require, exports, __app__) {
    var app = __app__;

    
    
    var PlayerService = (function () {
        function PlayerService($rootScope, FB, Board, AppVersion) {
            this.$rootScope = $rootScope;
            this.FB = FB;
            this.Board = Board;
            this.AppVersion = AppVersion;
        }
        PlayerService.prototype.connect = function (gameId) {
            var _this = this;
            var gameRef = this.FB.game(gameId);
            var playersRef = gameRef.child('players');
            var state = {
                myname: null,
                gameRef: gameRef,
                playersRef: playersRef,
                current: null,
                winner: null,
                taunt: null,
                isPaid: this.isPaid(),
                all: []
            };
            playersRef.on('child_added', this.FB.apply(function (p) {
                return _this.onJoin(state, p);
            }));
            playersRef.on('child_changed', this.FB.apply(function (p) {
                return _this.onUpdate(state, p);
            }));
            playersRef.on('child_removed', this.FB.apply(function (p) {
                return _this.onQuit(state, p);
            }));
            return state;
        };
        PlayerService.prototype.isAlive = function (p) {
            return (p.state == STATE.ALIVE);
        };
        PlayerService.prototype.alivePlayers = function (players) {
            return players.filter(this.isAlive);
        };
        PlayerService.prototype.join = function (state, player) {
            state.myname = player.name;
            player.x = this.Board.randomX();
            player.y = this.Board.randomY();
            player.sprite = '1';
            player.facing = "down";
            player.state = STATE.ALIVE;
            player.wins = player.wins || 0;
            player.losses = player.losses || 0;
            player.message = null;
            player.version = this.AppVersion.num;
            var ref = state.playersRef.child(player.name);
            ref.removeOnDisconnect();
            this.FB.update(ref, player);
        };
        PlayerService.prototype.onJoin = function (state, player) {
            if(!state.current && player.name == state.myname) {
                state.current = player;
            }
            state.all.push(player);
        };
        PlayerService.prototype.onUpdate = function (state, remotePlayer) {
            var player = this.playerByName(state.all, remotePlayer.name);
            if(!player) {
                return console.log("Error, player not found: " + remotePlayer.name);
            }
            player.x = remotePlayer.x;
            player.y = remotePlayer.y;
            player.facing = remotePlayer.facing;
            player.state = remotePlayer.state;
            player.wins = remotePlayer.wins;
            player.losses = remotePlayer.losses;
            if(remotePlayer.killer) {
                player.killer = remotePlayer.killer;
            }
            if(player.state == STATE.DEAD) {
                this.$rootScope.$broadcast("kill", player);
                this.checkWin(state);
            }
        };
        PlayerService.prototype.onQuit = function (state, player) {
            state.all = state.all.filter(function (p) {
                return p.name != player.name;
            });
        };
        PlayerService.prototype.checkWin = function (state) {
            var alive = this.alivePlayers(state.all);
            if(alive.length > 1) {
                return;
            }
            var winner = alive[0];
            if(state.current == null || winner != state.current) {
                return;
            }
            winner.wins += 1;
            state.playersRef.child(winner.name).child("wins").set(winner.wins);
            state.gameRef.child("winner").removeOnDisconnect();
            this.FB.update(state.gameRef.child("winner"), winner);
        };
        PlayerService.prototype.onWinner = function (state, player) {
            var _this = this;
            if(!player) {
                state.winner = null;
                state.taunt = null;
                return;
            }
            if(state.winner && state.winner.name == player.name) {
                return;
            }
            state.winner = player;
            state.taunt = TAUNT_LIST[Math.floor(Math.random() * TAUNT_LIST.length)];
            if(state.current && state.current.name == player.name) {
                setTimeout(function () {
                    return _this.resetGame(state);
                }, 3000);
            }
        };
        PlayerService.prototype.resetGame = function (state) {
            var _this = this;
            console.log("Initialize Game");
            state.gameRef.child('winner').remove();
            state.all.forEach(function (player) {
                player.x = _this.Board.randomX();
                player.y = _this.Board.randomY();
                player.sprite = '1';
                player.facing = "down";
                player.state = STATE.ALIVE;
                _this.FB.update(state.playersRef.child(player.name), player);
            });
        };
        PlayerService.prototype.killPlayer = function (state, player, killerName) {
            player.state = STATE.DEAD;
            player.losses += 1;
            player.killer = killerName;
            this.FB.update(state.playersRef.child(player.name), player);
        };
        PlayerService.prototype.move = function (state, player) {
            var playerRef = state.playersRef.child(player.name);
            this.FB.update(playerRef, player);
        };
        PlayerService.prototype.playerByName = function (players, name) {
            return players.filter(function (p) {
                return (p.name == name);
            })[0];
        };
        PlayerService.prototype.latestVersion = function (players) {
            return _.max(players, function (player) {
                return player.version;
            });
        };
        PlayerService.prototype.isPaid = function () {
            return (localStorage.getItem("payment_status") == "paid");
        };
        return PlayerService;
    })();
    exports.PlayerService = PlayerService;    
    app.main.factory('Players', function ($rootScope, FB, Board, AppVersion) {
        return new PlayerService($rootScope, FB, Board, AppVersion);
    });
    var TAUNT_LIST = [
        "Oooh yeah!", 
        "I fart in your general direction.", 
        "Your mother was a hamster and your father smelt of elderberries.", 
        "All your base are belong to us!", 
        "OK, next round, try it WITH your glasses on.", 
        "If your daddy's aim is as bad as yours, I'm surprised you're here at all!", 
        "Boom!"
    ];
    var STATE = {
        DEAD: "dead",
        ALIVE: "alive"
    };
})

