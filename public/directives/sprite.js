angular.module('directives')
	.directive('sprite', function($parse) {
			return function(scope, element, attrs) {
				// element is the player div
				// attrs.sprite is "player1"

        scope.$watch(attrs.sprite, function(val) {
          console.log("SPRITE", val)
        })

        scope.$watch(attrs.spriteFacing, function(val) {
          console.log("FACING", val)
        })

        //function render() {
					//console.log(scope.player.facing + val)
        //}


				//attrs.$observe("sprite", function(val) {
				//});
			}
	})
