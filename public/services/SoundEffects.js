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
  //var underwater = new Audio("/audio/Underwater.mp3")
  var epic = new Audio("/audio/UnderwaterEpicBattle.mp3")

  function makeMusic(audio, seconds) {
    console.log("makeMusic ",audio.networkState, " / ", audio.readyState)
    seconds = seconds || 0
    
    return function() {
      audio.play();
    }
    /*
    var callback = function() {
      $(audio).bind("canplay", function() {
        console.log("makeMusic - canplay")
        audio.currentTime = seconds
        audio.play()
      })
    }
    audio.load()
    return callback*/
  }

  // all parameters required
  function makeSound(audio, seconds, duration) {
    return function() {
      audio.pause()
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
    explosion: makeSound(epic, 0, 750), // 1 - 1.5
    rocket: makeSound(epic, 1, 500)
    //levelUp: makeSound(underwater, 76, 2500)
  }

})
