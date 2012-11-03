
angular.module('services').factory('SoundEffects', function() {


  // simple sound, lets you play/pause, with a beginning offset
  function simpleSound(file, seconds) {
    var audio = new Audio(file)
    return {
      play: function() {
        play(audio, seconds)
      }
    }
  }

  function play(audio, seconds) {
    seconds = seconds || 0
    $(audio).bind("canplay", function() {
      audio.currentTime = seconds
      audio.play()
    })
  }

  var music = simpleSound("/audio/g-style.mp3", 8)
  //music.play = function() { play(music, 8) }

  return {
    music: music,
    play: play
  }

})
