angular.module('services')
.factory('CurrentPlayer', function() {
  // lets you share the current player

  function loadPreference() {
    return {
      avatar: localStorage.avatar,
      name: localStorage.name
    }
  }

  function savePreference(player) {
    localStorage.avatar = player.avatar
    localStorage.name = player.name
  }


  return {
    player: null,
    loadPreference: loadPreference,
    savePreference: savePreference
  }
})

