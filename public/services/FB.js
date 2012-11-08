define(function(require) {
  var app = require('app')

  app.main.factory('FB', function($rootScope) {
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
    //console.log("UPDATE", obj)

    for (var key in obj) {
      if (obj[key] === undefined)
        delete obj[key]
    }

    ref.set(_.omit(obj, "$$hashKey"))
  }

  return FB
})

})
