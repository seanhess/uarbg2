define(["require", "exports"], function(require, exports) {
    
    var Controller = (function () {
        function Controller($scope, $location, Players, CurrentPlayer, AppVersion) {
            $scope.intro = "intro";
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.intro = "show";
                });
            }, 1200);
            console.log("WAHOO");
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
        }
        return Controller;
    })();
    exports.Controller = Controller;    
})

