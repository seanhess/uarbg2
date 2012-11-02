console.log("DIRECTIVE")

angular.module('directives', [])
	.directive('keypress', function($parse) {
			return function(scope, element, attrs) {
				// element is a jquery element
				var onPress = $parse(attrs.keypress)
				$(document).keydown(function(e) {
					e.preventDefault();
				    scope.$apply(function() {
				    	onPress(scope, {e:e})
				   	})
				});				
			}
	})