angular.module('services').factory('CurrentPlayer', function () {
    var storage = localStorage;
    function loadPreferences() {
        return {
            avatar: storage.avatar,
            name: storage.name,
            gameId: storage.gameId
        };
    }
    function savePreferences(player, gameId) {
        storage.avatar = player.avatar;
        storage.name = player.name;
        storage.gameId = gameId;
    }
    return {
        player: null,
        loadPreferences: loadPreferences,
        savePreferences: savePreferences
    };
});
