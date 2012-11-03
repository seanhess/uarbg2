angular.module('directives')
	.directive('sprite', function($parse) {
			return function(scope, element, attrs) {
				// element is the player div
				// attrs.sprite is "player1"

			function setFacing(facing) {
				var facing = (typeof facing == 'undefined') ? "down" : facing;

				if(facing == "up") {
					element.css('backgroundPositionY', '-100px');
				}

				if(facing == "right") {
					element.css('backgroundPositionY', '-50px');
				}

				if(facing == "down") {
					element.css('backgroundPositionY', '-150px');
				}

				if(facing == "left") {
					element.css('backgroundPositionY', '0px');
				}
			}

			function setSprite(sprite) {
				if(sprite == 0) {
					element.css('backgroundPositionX', '0');
				}

				if(sprite == 1) {
					element.css('backgroundPositionX', '-50px');
				}

				if(sprite == 2) {
					element.css('backgroundPositionX', '-100px');
				}
			}

	        scope.$watch(attrs.sprite, function(val) {
	          setSprite(val, scope.player.facing);
	        })

	        scope.$watch(attrs.spriteFacing, function(val) {
	          setFacing(val);
	        })

		}
	})
