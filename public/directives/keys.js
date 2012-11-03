angular.module('directives')
	.directive('keypress', function($parse) {
			return function(scope, element, attrs) {
				// element is a jquery element

        // focus the div
        element.attr('tabindex', 0)

				var onPress = $parse(attrs.keypress)
				element.bind('keydown', function(e) {
				    scope.$apply(function() {
				    	onPress(scope, {e:e})
				   	})
				});				
			}
	})
