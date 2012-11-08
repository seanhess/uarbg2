require.config({
  // we don't need much config right now, since we HAVE to load angular and jquery globally
  // Typescript is stupid about AMD-loading 3rd party modules with ambient files right now

  //paths: {
    //jquery: '../lib/jquery/jquery-1.8.2.min',
    //underscore: '../lib/underscore/underscore',
    //angular: '../lib/angular/angular',
    //angularResource: '../lib/angular/angular-resource',
    //text: '../lib/require/text'
  //},
  //shim: {
    //'angular' : {'exports' : 'angular'},
    //'angular-resource' : {deps:['angular']},
    //'bootstrap': {deps:['jquery']},
    //'underscore': {exports: '_'}
  //},
  //priority: [
    //"angular"
  //],
  //urlArgs: 'v=1.1'
});

// put EVERYTHING you want loaded in here
// since we're using Angular, the TS modules won't load each other automatically
require([
  'app',
  'controllers/Identify',
  'controllers/GameCtrl',
  'controllers/PaymentCtrl',
  'services/Board',
  'services/Players',
  'services/Missiles',
  'services/FB',
  'services/CurrentPlayer',
  'services/SoundEffects',
  'services/AppVersion',
  'directives/keys',
  'directives/sprite',
  'filters/position'
], function(app) {

  //This function will be called when all the dependencies
  //listed above are loaded. Note that this function could
  //be called before the page is loaded.
  //This callback is optional.

  angular.element(document).ready(function () {
    angular.bootstrap(document, ['uarbg'])
  })

})
