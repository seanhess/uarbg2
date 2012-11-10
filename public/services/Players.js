define(["require", "exports", "../app"], function(require, exports, __app__) {
    var app = __app__;

    
    
    
    app.main.factory('Players', function ($rootScope, FB, Board, AppVersion) {
        return {
            isAlive: isAlive,
            alivePlayers: alivePlayers,
            playerByName: playerByName,
            latestVersion: latestVersion,
            connect: connect,
            join: join,
            killPlayer: killPlayer,
            move: move
        };
        function connect(gameId) {
            var gameRef = FB.game(gameId);
            var playersRef = gameRef.child('players');
            var state = {
                myname: null,
                gameRef: gameRef,
                playersRef: playersRef,
                current: null,
                winner: null,
                taunt: null,
                isPaid: isPaid(),
                all: []
            };
            playersRef.on('child_added', FB.apply(function (p) {
                return onJoin(state, p);
            }));
            playersRef.on('child_changed', FB.apply(function (p) {
                return onUpdate(state, p);
            }));
            playersRef.on('child_removed', FB.apply(function (p) {
                return onQuit(state, p);
            }));
            return state;
        }
        function isAlive(p) {
            return (p.state == STATE.ALIVE);
        }
        function alivePlayers(players) {
            return players.filter(isAlive);
        }
        function join(state, player) {
            state.myname = player.name;
            player.x = Board.randomX();
            player.y = Board.randomY();
            player.sprite = '1';
            player.facing = "down";
            player.state = STATE.ALIVE;
            player.wins = player.wins || 0;
            player.losses = player.losses || 0;
            player.message = null;
            player.version = AppVersion.num;
            var ref = state.playersRef.child(player.name);
            ref.removeOnDisconnect();
            FB.update(ref, player);
        }
        function onJoin(state, player) {
            if(!state.current && player.name == state.myname) {
                state.current = player;
            }
            state.all.push(player);
        }
        function onUpdate(state, remotePlayer) {
            var player = playerByName(state.all, remotePlayer.name);
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
                $rootScope.$broadcast("kill", player);
                checkWin(state);
            }
        }
        function onQuit(state, player) {
            state.all = state.all.filter(function (p) {
                return p.name != player.name;
            });
        }
        function checkWin(state) {
            var alive = alivePlayers(state.all);
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
            FB.update(state.gameRef.child("winner"), winner);
        }
        function onWinner(state, player) {
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
                    return resetGame(state);
                }, 3000);
            }
        }
        function resetGame(state) {
            console.log("Initialize Game");
            state.gameRef.child('winner').remove();
            state.all.forEach(function (player) {
                player.x = Board.randomX();
                player.y = Board.randomY();
                player.sprite = '1';
                player.facing = "down";
                player.state = STATE.ALIVE;
                FB.update(state.playersRef.child(player.name), player);
            });
        }
        function killPlayer(state, player, killerName) {
            player.state = STATE.DEAD;
            player.losses += 1;
            player.killer = killerName;
            FB.update(state.playersRef.child(player.name), player);
        }
        function move(state, player) {
            var playerRef = state.playersRef.child(player.name);
            FB.update(playerRef, player);
        }
        function playerByName(players, name) {
            return players.filter(function (p) {
                return (p.name == name);
            })[0];
        }
        function latestVersion(players) {
            return _.max(players, function (player) {
                return player.version;
            });
        }
        function isPaid() {
            return (localStorage.getItem("payment_status") == "paid");
        }
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

