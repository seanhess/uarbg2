///<reference path="def/angular.d.ts"/>

import Identify = module('controllers/Identify')

var app = angular.module('uarbg2', [], function ($routeProvider: ng.IRouteProviderProvider) {
  $routeProvider.when('/game/:gameId', {templateUrl: 'partials/game.html', controller: "GameCtrl"})
  $routeProvider.when('/paid', {templateUrl: 'partials/paid.html', controller: "PaymentCtrl"})
  $routeProvider.when('/identify', {templateUrl: 'partials/identify.html', controller: Identify.Controller})

  $routeProvider.otherwise({redirectTo: '/identify'})
})

// so app.main would be your thing
export var main = app

// I want to EXPORT this thing.
