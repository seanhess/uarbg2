console.log("INITIALIZING MODULES");
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);
angular.module('controllers', [
    'services', 
    'filters', 
    'directives'
]);
var firebase;
(function (firebase) {
    var FB = (function () {
        function FB($rootScope) {
            this.$rootScope = $rootScope;
        }
        FB.prototype.game = function (gameId) {
            var ref = new Firebase("https://seanhess.firebaseio.com/uarbg2/" + gameId);
            return ref;
        };
        FB.prototype.apply = function (f) {
            var _this = this;
            return function (ref) {
                if((_this.$rootScope).$$phase) {
                    return f(ref.val());
                }
                _this.$rootScope.$apply(function () {
                    f(ref.val());
                });
            }
        };
        FB.prototype.update = function (ref, obj) {
            for(var key in obj) {
                if(obj[key] === undefined) {
                    delete obj[key];
                }
            }
            ref.set(_.omit(obj, "$$hashKey"));
        };
        return FB;
    })();
    firebase.FB = FB;    
})(firebase || (firebase = {}));

angular.module('services').factory('FB', function ($rootScope) {
    return new firebase.FB($rootScope);
});
angular.module('services').factory('AppVersion', function ($rootScope) {
    return "1.1";
});
angular.module('services').factory('Board', function ($rootScope) {
    var WIDTH = 800;
    var HEIGHT = 600;
    var UNIT = 50;
    var GRID = {
        x: WIDTH / UNIT,
        y: HEIGHT / UNIT
    };
    var Board = {
        move: move,
        getPosition: getPosition,
        isHit: isHit,
        randomX: makeRandomN(GRID.x),
        randomY: makeRandomN(GRID.y),
        LEFT: "left",
        RIGHT: "right",
        UP: "up",
        DOWN: "down"
    };
    return Board;
    function getPosition(direction) {
        if(direction === Board.UP) {
            return {
                axis: 'y',
                distance: -1
            };
        }
        if(direction === Board.RIGHT) {
            return {
                axis: 'x',
                distance: 1
            };
        }
        if(direction === Board.DOWN) {
            return {
                axis: 'y',
                distance: 1
            };
        }
        if(direction === Board.LEFT) {
            return {
                axis: 'x',
                distance: -1
            };
        } else {
            console.log("BAD DIRECTION", direction);
            return null;
        }
    }
    function move(object, position) {
        var axis = position.axis;
        var distance = position.distance;
        var potential = object[axis] + distance;
        var direction;
        if(axis == 'x' && distance > 0) {
            direction = Board.RIGHT;
        } else {
            if(axis == 'x' && distance < 0) {
                direction = Board.LEFT;
            } else {
                if(axis == 'y' && distance > 0) {
                    direction = Board.DOWN;
                } else {
                    if(axis == 'y' && distance < 0) {
                        direction = Board.UP;
                    } else {
                        console.log("BAD MOVE", axis, distance);
                    }
                }
            }
        }
        if(GRID[axis] <= potential || potential < 0) {
            return null;
        }
        return {
            axis: axis,
            location: potential,
            facing: direction
        };
    }
    function isHit(one, two) {
        return (one.x == two.x && one.y == two.y);
    }
    function makeRandomN(max) {
        return function () {
            return Math.floor(Math.random() * max);
        }
    }
});
angular.module('services').factory('Players', function ($rootScope, FB, Board, AppVersion) {
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
angular.module('services').factory('CurrentPlayer', function () {
    var storage = localStorage;
    function loadPreferences() {
        return {
            avatar: storage.avatar,
            name: storage.name,
            gameId: storage.gameId
        };
    }
    function savePreferences(player, gameId) {
        storage.avatar = player.avatar;
        storage.name = player.name;
        storage.gameId = gameId;
    }
    return {
        player: null,
        loadPreferences: loadPreferences,
        savePreferences: savePreferences
    };
});
console.log("Register: IdentifyCtrl");
angular.module('controllers').controller('IdentifyCtrl', function ($scope, $location, Players, CurrentPlayer, AppVersion) {
    $scope.intro = "intro";
    setTimeout(function () {
        $scope.$apply(function () {
            $scope.intro = "show";
        });
    }, 1200);
    $scope.version = AppVersion;
    $scope.player = CurrentPlayer.loadPreferences();
    $scope.gameId = $scope.player.gameId || "global";
    var players = Players.connect($scope.gameId);
    $scope.players = players;
    $scope.avatars = [
        'player2', 
        'player5', 
        'player3', 
        'player1', 
        'player4', 
        'player6'
    ];
    $scope.freeAvatars = [
        'player1', 
        'player2'
    ];
    $scope.avatarIsFree = function (avatarName) {
        return ($scope.freeAvatars.indexOf(avatarName) != -1);
    };
    $scope.avatarIsAvailable = function (avatarName) {
        return (players.isPaid || $scope.freeAvatars.indexOf(avatarName) != -1);
    };
    $scope.avatarIsLocked = function (avatarName) {
        return ($scope.avatarIsAvailable(avatarName) != true);
    };
    $scope.join = function () {
        if(!$scope.player || !$scope.player.avatar || !$scope.player.name) {
            $scope.error = "Please select a valid name and an avatar";
            return;
        }
        if(Players.playerByName(players.all, $scope.player.name)) {
            $scope.error = '"' + $scope.player.name + '" is already taken';
            return;
        }
        CurrentPlayer.player = $scope.player;
        CurrentPlayer.savePreferences(CurrentPlayer.player, $scope.gameId);
        $location.path("/game/" + $scope.gameId);
    };
    $scope.selectAvatar = function (name) {
        if($scope.avatarIsAvailable(name)) {
            $scope.player = $scope.player || {
            };
            $scope.player.avatar = name;
        } else {
            window.location.href = "https://spb.io/s/osgtq3F3kS";
        }
    };
    $scope.isPlayerAvatar = function (name) {
        return ($scope.player && $scope.player.avatar == name);
    };
});
console.log("app.ts");
var app = angular.module('app', [
    'controllers'
], function ($routeProvider) {
    console.log("In Router");
    $routeProvider.when('/game/:gameId', {
        templateUrl: 'partials/game.html',
        controller: "GameCtrl"
    });
    $routeProvider.when('/paid', {
        templateUrl: 'partials/paid.html',
        controller: "PaymentCtrl"
    });
    $routeProvider.when('/identify', {
        templateUrl: 'partials/identify.html',
        controller: "IdentifyCtrl"
    });
    $routeProvider.otherwise({
        redirectTo: '/identify'
    });
});
