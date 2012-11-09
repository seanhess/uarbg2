define(["require", "exports", "../app"], function(require, exports, __app__) {
    var app = __app__;

    
    var TAUNT_LIST = [
        "Oooh yeah!", 
        "I fart in your general direction.", 
        "Your mother was a hamster and your father smelt of elderberries.", 
        "All your base are belong to us!", 
        "OK, next round, try it WITH your glasses on.", 
        "If your daddy's aim is as bad as yours, I'm surprised you're here at all!"
    ];
    var STATE = {
        DEAD: "dead",
        ALIVE: "alive"
    };
    app.main.factory('Players', function ($rootScope, FB, Board, AppVersion) {
        return function (gameId) {
            var gameRef = new FB(gameId);
            var playersRef = gameRef.child('players');
            var myname;
            var players = {
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
                latestVersion: latestVersion
            };
            function join(player) {
                myname = player.name;
                player.x = Board.randomX();
                player.y = Board.randomY();
                player.sprite = '1';
                player.facing = "down";
                player.state = STATE.ALIVE;
                player.wins = player.wins || 0;
                player.losses = player.losses || 0;
                player.message = null;
                player.version = AppVersion;
                var ref = playersRef.child(player.name);
                ref.removeOnDisconnect();
                FB.update(ref, player);
            }
            function listen() {
                playersRef.on('child_added', FB.apply(onJoin));
                playersRef.on('child_changed', FB.apply(onUpdate));
                playersRef.on('child_removed', FB.apply(onQuit));
            }
            function onJoin(player) {
                if(!players.current && player.name == myname) {
                    players.current = player;
                }
                players.all.push(player);
            }
            function onUpdate(remotePlayer) {
                var player = playerByName(remotePlayer.name);
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
                    checkWin();
                }
            }
            function onQuit(player) {
                players.all = players.all.filter(function (p) {
                    return p.name != player.name;
                });
            }
            function checkWin() {
                var alive = alivePlayers();
                if(alive.length > 1) {
                    return;
                }
                var winner = alive[0];
                if(players.current == null || winner != players.current) {
                    return;
                }
                winner.wins += 1;
                playersRef.child(winner.name).child("wins").set(winner.wins);
                gameRef.child("winner").removeOnDisconnect();
                FB.update(gameRef.child("winner"), winner);
            }
            function onWinner(player) {
                if(!player) {
                    players.winner = null;
                    players.taunt = null;
                    return;
                }
                if(players.winner && players.winner.name == player.name) {
                    return;
                }
                players.winner = player;
                players.taunt = TAUNT_LIST[Math.floor(Math.random() * TAUNT_LIST.length)];
                if(players.current && players.current.name == player.name) {
                    setTimeout(resetGame, 3000);
                }
            }
            function resetGame() {
                console.log("Initialize Game");
                gameRef.child('winner').remove();
                players.all.forEach(function (player) {
                    player.x = Board.randomX();
                    player.y = Board.randomY();
                    player.sprite = '1';
                    player.facing = "down";
                    player.state = STATE.ALIVE;
                    FB.update(playersRef.child(player.name), player);
                });
            }
            function killPlayer(player, killerName) {
                player.state = STATE.DEAD;
                player.losses += 1;
                player.killer = killerName;
                console.log("KILL PLAYER", player);
                FB.update(playersRef.child(player.name), player);
            }
            function move(player) {
                var playerRef = getPlayerRef(player.name);
                FB.update(playerRef, player);
            }
            function getPlayerRef(name) {
                return playersRef.child(name);
            }
            function playerByName(name) {
                return players.all.filter(function (p) {
                    return (p.name == name);
                })[0];
            }
            function isAlive(p) {
                return (p.state == STATE.ALIVE);
            }
            function alivePlayers() {
                return players.all.filter(isAlive);
            }
            function isPaid() {
                return (localStorage.getItem("payment_status") == "paid");
            }
            function latestVersion() {
                return _.max(players.all, function (player) {
                    return player.version;
                });
            }
            return players;
        }
    });
})

