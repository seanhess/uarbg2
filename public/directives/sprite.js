angular.module('directives')
	.directive('sprite', function($parse) {
			return function(scope, element, attrs) {
				// element is the player div
				// attrs.sprite is "player1"
				attrs.$observe("sprite", function(val) {
					console.log(scope.player.facing + val)
				});
			}
	})