angular.module('directives')
	.directive('sprite', function($parse) {
			return function(scope, element, attrs) {
				// element is the player div
				// attrs.sprite is "player1"

			var isWalking;
			var isDying;

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

			function startDying(index) {
				if(index == "1") {
					element.css('backgroundPositionY', '0px');
				}

				if(index == "2") {
					element.css('backgroundPositionY', '-50px');
				}

				if(index == "3") {
					element.css('backgroundPositionY', '-100px');
				}

				if(index == "4") {
					element.css('backgroundPositionY', '-150px');
				}

				if(index == "5") {
					element.css('backgroundPositionY', '-200px');
				}

				if(index == "6") {
					element.css('backgroundPositionY', '-250px');
				}

				if(index == "7") {
					element.css('backgroundPositionY', '-300px');
				}

				if(index == "0") {
					element.css('backgroundPositionY', '-350px');
					isDying = false;
				}
			}

			function walking() {
				var i = 0;
				var animateWalk = function() {
					return setTimeout(function(){
						setSprite(++i % 3);		
						if(isWalking) {
							animateWalk();
						}
					}, 70);
				}

				return animateWalk();
			}

			function dying(callback) {
				var i = 0;
				var animateDeath = function() {
					return setTimeout(function(){
						startDying(++i % 8);		
						if(isDying) {
							animateDeath();
						} else {
							callback();
						}
					}, 70);
				}

				return animateDeath();
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

	        scope.$watch(attrs.state, function(val) {
	        	if(val == "dead") {
	        		element.addClass('dead')
	        		element.css('backgroundPositionX', '0');
	        		isDying = true;
	        		dying(function() {
	        			element.removeClass('dead');
	        			element.hide();
	        		});
	        	} else {
	        		element.show();
	        		element.css('backgroundPositionY', '-150px');
	        		element.css('backgroundPositionX', '-50px');
	        	}
	        })

	        scope.$watch(attrs.spriteWalking, function(val) {
	        	if(val) {
	        		isWalking = true;
	        		walking();
	        	} else {
	        		isWalking = false;
	        	}
	        })

		}
	})
