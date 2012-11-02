
// https://seanhess.firebaseio.com/

function IdentifyCtrl($scope, Players, CurrentPlayer, $location) {

  // [ ] detect which game to join ("global")
  $scope.gameId = "global"
  var players = new Players($scope.gameId)

  // [ ] provide current players with avatars for that game
  $scope.players = players

  // [ ] Pick a name and avatar
  // set a service with the currently selected player. the name and avatar, etc
  // must be set by the time you get to game

  // If game doesn't have a current player, then go back to the identify/matchmaking screen!

  $scope.join = function() {
    // HACK
    $scope.player.avatar = "player1"
    CurrentPlayer.player = $scope.player
    $location.path("/game/" + $scope.gameId)
  }

  players.listen()
}
