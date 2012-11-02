angular.module('services')
.factory('CurrentPlayer', function() {
  // lets you share the current player
  return {
    player: null
  }
})

