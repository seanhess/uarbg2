console.log("app.ts");
var app = angular.module('app', [
    'controllers'
], function ($routeProvider) {
    console.log("In Router");
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
        controller: "IdentifyCtrl"
    });
    $routeProvider.otherwise({
        redirectTo: '/identify'
    });
});
