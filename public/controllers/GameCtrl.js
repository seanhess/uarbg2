
function GameCtrl($scope, Players) {
  $scope.players = Players
  console.log("TEST", Players)
  $scope.position = function (player) {
    return {left: player.x * 30 + "px", top: player.y * 30 + "px"}
  }

  $scope.moveRight = function (player) {
    player.x += 1
  }

  // temporary
  $scope.clickBoard = function() {

  }

  Players.join({name:"sean"})
}
