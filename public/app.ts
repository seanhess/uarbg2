///<reference path="def/jquery.d.ts"/>
///<reference path="def/angular.d.ts"/>
///<reference path="def/underscore.d.ts"/>

// Require stuff (modules.js must be first! to initialize modules)
///<reference path="modules.ts"/>
///<reference path="controllers/Identify.ts"/>
///<reference path="controllers/GameCtrl.ts"/>
///<reference path="controllers/PaymentCtrl.ts"/>

// sometimes you're going to want to reference controllers dynamically. 
// so register them

var app = angular.module('app', ['controllers'], function ($routeProvider: ng.IRouteProviderProvider) {
  $routeProvider.when('/game/:gameId', {templateUrl: 'partials/game.html', controller: "GameCtrl"})
  $routeProvider.when('/paid', {templateUrl: 'partials/paid.html', controller: "PaymentCtrl"})
  $routeProvider.when('/identify', {templateUrl: 'partials/identify.html', controller: "IdentifyCtrl"})

  $routeProvider.otherwise({redirectTo: '/identify'})
})
