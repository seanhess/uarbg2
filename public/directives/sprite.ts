///<reference path="../def/angular.d.ts"/>

angular.module('directives')

.directive('sprite', function($parse) {
  return function(scope, element, attrs) {
    // element is the player div
    // attrs.sprite is "player1"

    var isWalking;

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
      setSprite(val);
    })

    scope.$watch(attrs.spriteFacing, function(val) {
      setFacing(val);
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
