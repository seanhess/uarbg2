var PORT = process.env.PORT || 3000
var express = require('express')
var stylus = require('stylus')
var nib = require('nib')

app = express()

app.configure(function() {
  app.use(stylus.middleware({
    src: 'public',
    compile: function(str, path) {
      return stylus(str).use(nib()).import('nib').set('filename', path)
    }
  }))
  app.use(express.static(__dirname + '/public'))
  app.use('/components', express.static(__dirname + '/components'))
})

app.listen(PORT, function() {
  return console.log("RUNNING " + PORT)
})
