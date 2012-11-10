///<reference path="../def/angular.d.ts"/>

interface IPreferencesStorage extends Storage {
  avatar:string;
  name:string;
  gameId:string;
}


angular.module('services').factory('CurrentPlayer', function() {
  // lets you share the current player

  var storage:IPreferencesStorage = <IPreferencesStorage> localStorage;

  function loadPreferences() {
    return {
      avatar: storage.avatar,
      name: storage.name,
      gameId: storage.gameId
    }
  }

  function savePreferences(player, gameId) {
    storage.avatar = player.avatar
    storage.name = player.name
    storage.gameId = gameId
  }


  return {
    player: null,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences
  }
})
