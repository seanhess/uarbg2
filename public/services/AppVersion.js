define(function(require) {
  var app = require('app')
  app.main.factory('AppVersion', function($rootScope) {
    return "1.1"
  })
})
