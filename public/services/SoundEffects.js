
angular.module('services').factory('SoundEffects', function() {


  // simple sound, lets you play/pause, with a beginning offset
  function simpleSound(file, seconds) {
    return {
      // plays the sound, starting at the offset
      play: function() {
        play(audio, seconds)
      }
    }
  }

  var bgMusic = new Audio("/audio/g-style.mp3")
  var underwater = new Audio("/audio/Underwater.mp3")

  function makeMusic(audio, seconds) {
    seconds = seconds || 0
    return function() {
      $(audio).bind("canplay", function() {
        audio.currentTime = seconds
        audio.play()
      })
    }
  }

  // all parameters required
  function makeSound(audio, seconds, duration) {
    return function() {
      // we don't want the canplay thing if we're going to play it after it's been really loaded.
      //$(audio).bind("canplay", function() {
        audio.currentTime = seconds
        audio.play()
        setTimeout(function() {
          audio.pause()
        }, duration)
      //})
    }
  }

  return {
    music: makeMusic(bgMusic, 8), // start at 8 seconds
    levelUp: makeSound(underwater, 76, 2500)
  }

})