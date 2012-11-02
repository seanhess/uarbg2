
angular.module('uarbg2', [], function ($routeProvider) {
    $routeProvider.when('/test', {templateUrl: 'partials/test.html'})
    $routeProvider.otherwise({redirectTo: '/test'})
})

