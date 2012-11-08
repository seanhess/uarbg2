define(["require", "exports", 'controllers/Identify'], function(require, exports, __Identify__) {
    var Identify = __Identify__;

    var app = angular.module('uarbg2', [], function ($routeProvider) {
        $routeProvider.when('/game/:gameId', {
            templateUrl: 'partials/game.html',
            controller: "GameCtrl"
        });
        $routeProvider.when('/paid', {
            templateUrl: 'partials/paid.html',
            controller: "PaymentCtrl"
        });
        $routeProvider.when('/identify', {
            templateUrl: 'partials/identify.html',
            controller: Identify.Controller
        });
        $routeProvider.otherwise({
            redirectTo: '/identify'
        });
    });
    exports.main = app;
})

