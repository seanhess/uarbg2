// need to convert these all to requirejs

define(function(require) {
  var app = require('app')
	app.main.directive('keypress', function($parse) {
			return function(scope, element, attrs) {
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
})
