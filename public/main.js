

angular.module('uarbg2', ['services'], function ($routeProvider) {
    $routeProvider.when('/test', {templateUrl: 'partials/test.html'})
    $routeProvider.when('/game', {templateUrl: 'partials/game.html', controller: GameCtrl})
    $routeProvider.otherwise({redirectTo: '/test'})
})

