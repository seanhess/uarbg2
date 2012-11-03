angular.module('services')
.factory('CurrentPlayer', function() {
  // lets you share the current player

  function loadPreferences() {
    return {
      avatar: localStorage.avatar,
      name: localStorage.name,
      gameId: localStorage.gameId
    }
  }

  function savePreferences(player, gameId) {
    localStorage.avatar = player.avatar
    localStorage.name = player.name
    localStorage.gameId = gameId
  }


  return {
    player: null,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences
  }
})

