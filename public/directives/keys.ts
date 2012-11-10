///<reference path="../def/angular.d.ts"/>
///<reference path="../def/jquery.d.ts"/>

angular.module('directives')

.directive('keypress', function($parse) {
  return function(scope:ng.IScope, element:JQuery, attrs) {
    // element is a jquery element

    // focus the div
    element.attr('tabindex', 0)

    var onPress = $parse(attrs.keypress)
    var isPressed = false

    element.keydown(function(e) {
        if (isPressed) return
        isPressed = true
        scope.$apply(function() {
          onPress(scope, {e:e})
        })
    });				

    element.keyup(function(e) {
      isPressed = false
    })
  }
})
