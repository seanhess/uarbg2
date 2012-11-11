uarbg2
======

Underwater Adventure Rocket Bazooka Guys v2

Install
-------

    make install

Compiling
---------

    make

Hit List
--------
* Fix rounds / winning
* Fix closed-lid players
* Explosion
* Rocket animation?
* BUG: must click to play

* use signals/events instead of $rootScope.broadcast

* CLEANUP: going back to the main page should clean up the game. 
* IDEA: switch game/matches when you switch matches?

* DONE move/fire after dead

Next Features
-------------
* facebook / twitter login
* invite only

Not Yet
-------
* Update payments
* matchmaking via geolocation
* Cannonical server? Ditch firebase?




If you can only kill yourself, you have that stupid timeout problem
  - mark someone as pending dead
  - then change to dead unless they correct it in the meantime

Something simple?
  - killer marks you as dead, rather than vice versa.
  - simple way, haven't even tried it the other way :)

Solve the timeout problem:
  - heartbeat?

Long term fix: use your own system
  + heartbeat
  + server evaluates hits

