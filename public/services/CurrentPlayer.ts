///<reference path="../def/angular.d.ts"/>

interface IPreferences {
  avatar:string;
  name:string;
  gameId:string;
}

interface ICurrentPlayerService {
  player:IPlayer;
  loadPreferences():IPreferences;
  savePreferences(player:IPlayer, gameId:string);
}

angular.module('services').factory('CurrentPlayer', function():ICurrentPlayerService {
  // lets you share the current player

  function loadPreferences():IPreferences {
    return {
      avatar: localStorage.getItem("avatar"),
      name: localStorage.getItem("name"),
      gameId: localStorage.getItem("gameId"),
    }
  }

  function savePreferences(player:IPlayer, gameId:string) {
    localStorage.setItem("avatar", player.avatar)
    localStorage.setItem("name", player.name)
    localStorage.setItem("gameId", gameId)
  }

  return {
    player: null,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences
  }
})
