# Async Stash

Async Stash composes a Thunked-up `Map`++ interface on top of an Object.

* Whereas map only has get and set, Async Stash has getter and setter Thunks and callbacks.
** Getters are usable even no corresponding key has been set on them.
* Keys can have multiple indexes
* Use a Map or Object for the underlay.
