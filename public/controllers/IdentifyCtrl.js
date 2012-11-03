
// https://seanhess.firebaseio.com/

function IdentifyCtrl($scope, Players, CurrentPlayer, $location) {

  // HACKY way to do the transition
  $scope.intro = "intro"

  // hacky way to do this. cssTransitionEnd would be better
  setTimeout(function() {
      $scope.$apply(function() {
        $scope.intro = "show"
      })
  }, 1200)


  // [ ] detect which game to join ("global")
  $scope.gameId = "global"
  var players = new Players($scope.gameId)

  // [ ] provide current players with avatars for that game
  $scope.players = players

  // available avatars
  $scope.avatars = ['player1']

  // [ ] Pick a name and avatar
  // set a service with the currently selected player. the name and avatar, etc
  // must be set by the time you get to game

  // If game doesn't have a current player, then go back to the identify/matchmaking screen!

  $scope.join = function() {
    if (!$scope.player || !$scope.player.avatar || !$scope.player.name)
      return alert("Please select a valid name and an avatar")

    CurrentPlayer.player = $scope.player
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
