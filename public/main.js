angular.module('services', [])
angular.module('directives', [])
angular.module('filters', [])

angular.module('uarbg2', ['services', 'directives', 'filters'], function ($routeProvider) {
    $routeProvider.when('/game/:gameId', {templateUrl: 'partials/game.html', controller: GameCtrl})
    $routeProvider.when('/identify', {templateUrl: 'partials/identify.html', controller: IdentifyCtrl})
    $routeProvider.when('/paid', {templateUrl: 'partials/paid.html', controller: PaymentCtrl})
    $routeProvider.otherwise({redirectTo: '/identify'})
})

//var myDataReference = new Firebase('https://seanhess.firebaseio.com/');
//myDataReference.set('I am now writing data into Firebase!');
