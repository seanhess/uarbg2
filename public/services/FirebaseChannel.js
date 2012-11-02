

console.log("FC")

angular.module('services')
.factory('FirebaseChannel', function($rootScope) {
  return function(gameId) {
    var ref = new Firebase("https://seanhess.firebaseio.com/uarbg2/" + gameId)
    return ref
  }
})
