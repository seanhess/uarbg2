angular.module('services')
.factory('FB', function($rootScope) {
  var FB = function(gameId) {
    var ref = new Firebase("https://seanhess.firebaseio.com/uarbg2/" + gameId)
    return ref
  }

  // helps you bind to firebase events
  FB.apply = function(f) {
    return function(ref) {
      if ($rootScope.$$phase)
        return f(ref.val())
      $rootScope.$apply(function() {
        f(ref.val())
      })
    }
  }

  // just updates everything, ignore angular $$hashKey
  FB.update = function(ref, obj) {
    ref.set(_.omit(obj, "$$hashKey"))
  }

  return FB
})
