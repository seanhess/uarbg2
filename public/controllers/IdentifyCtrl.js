
// https://seanhess.firebaseio.com/

function IdentifyCtrl($scope, Players, CurrentPlayer, $location, AppVersion) {

  // HACKY way to do the transition
  $scope.intro = "intro"

  // hacky way to do this. cssTransitionEnd would be better
  setTimeout(function() {
      $scope.$apply(function() {
        $scope.intro = "show"
      })
  }, 1200)

  $scope.version = AppVersion

  // see if they have a preferred name and gameId
  $scope.player = CurrentPlayer.loadPreferences()
  $scope.gameId = $scope.player.gameId || "global"

  // [ ] detect which game to join ("global")
  var players = new Players($scope.gameId)
  $scope.players = players

  // available avatars
  $scope.avatars = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6']

  // [ ] Pick a name and avatar
  // set a service with the currently selected player. the name and avatar, etc
  // must be set by the time you get to game

  // If game doesn't have a current player, then go back to the identify/matchmaking screen!

  $scope.join = function() {
    if (!$scope.player || !$scope.player.avatar || !$scope.player.name) {
      $scope.error = "Please select a valid name and an avatar"
      return
    }

    if (players.playerByName($scope.player.name)) {
      $scope.error = '"' + $scope.player.name + '" is already taken'
      return
    }

    CurrentPlayer.player = $scope.player
    CurrentPlayer.savePreferences(CurrentPlayer.player, $scope.gameId)
    $location.path("/game/" + $scope.gameId)
  }

  $scope.selectAvatar = function(name) {
    $scope.player = $scope.player || {}
    $scope.player.avatar = name
  }

  $scope.isPlayerAvatar = function(name) {
    return ($scope.player && $scope.player.avatar == name)
  }

  players.listen()
}
