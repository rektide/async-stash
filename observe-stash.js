'use strict';

/// Create a Map one can .get from before the key exists.
function stash(opts){
	var optSlowGet= opts && opts.slowGet || false,
	  optsLateSet= opts && opts.lateSet || false,
	  optArgsHash= opts && opts.argsHash,
	  isMap= opts && opts.underlay && opts.underlay.get && opts.underlay.set

	var awaits= {},
	  underlay= opts && opts.underlay || {}

	function argsHash(args, drop, rest){
		return (optArgsHash || stash.argsHash)(args, drop, rest)
	}

	// EXPORTS

	var _get, _set
	if(isMap){
		_get= function(k){
			return underlay.get(k)
		}
		_set= function(k, v){
			underlay.set(k,v)
		}
	}else{
		_get= function(k){
			return underlay[k]
		}
		_set= function(k, v){
			underlay[k]= v
		}
	}

	function get(){
		var key= argsHash(arguments)
		return _get(key)
	}

	/// return a thunk of a get which will immediately happen or when the key is fulfilled
	/// @zalgo
	function getterZalgo(key){
		return function(done){
			if(!done)
				return
			var resolved= _get(key)
			if(resolved){
				done(undefined, resolved)
			}else{
				var wait= awaits[key]
				if(wait)
					wait.push(done)
				else
					awaits[key]= [done]
			}
		}
	}
	/// return a thunk of a get which will happen in the tick after a key is fulfilled
	function getterLeashed(key){
		return function(done){
			if(!done)
				return
			var resolved= _get(key)
			if(resolved){
				setTimeout(function(){done(undefined, resolved)})
			}else{
				//done.slow= true // set always leashes zalgo
				var wait= awaits[key]
				if(wait)
					wait.push(done)
				else
					awaits[key]= [done]
			}
		}
	}
	/// return a thunk which will resolve the get when available
	function getter(){
		var key= argsHash(arguments)
		if(optSlowGet)
			return getterLeashed(key)
		else
			return getterZalgo(key)
	}
	Object.defineProperty(getter, 'slow', {
		get: function(){
			return optSlowGet
		},
		set: function(value){
			optSlowGet= value
		}
	})

	/// sets a value by indicies
	function set(){
		var key= argsHash(arguments, 1),
		  val= arguments[arguments.length-1],
		  waits= awaits[key],
		  late= optsLateSet
		if(waits && waits.length){
			// remove all waits, and in the future trigger them
			setTimeout(function(){
				for(var i= 0; i< waits.length; ++i){
					var wait= waits[i]
					if(wait.late || late){
						wait(undefined, _get(key)) // resolve late
					}else
						wait(undefined, val)
				}
			}, 0)
			awaits[key]= null
		}
		// set
		_set(key, val)
	}
	Object.defineProperty(set, 'late', {
		get: function(){
			return optsLateSet
		},
		set: function(value){
			optsLateSet= !!value
		}
	})

	/// Provide a Node-style function handler for setting a key
	function setter(){
		var key= argsHash(arguments)
		return function(err, ok){
			if(err)
				return
			set(key, ok)
		}
	}

	/// iterate through keys
	function *keys(){
		if(isMap)
			return underlay.keys()

		for(var i in underlay){
			yield i
		}
	}

	/// iterate through all items
	function *items(){
		if(isMap)
			return underlay.items()

		for(var i of keys()){
			yield [i, underlay[i]]
		}
	}

	/// iterate through all values
	function *values(){
		if(isMap)
			return underlay.values()

		for(var i of keys()){
			yield underlay[i]
		}
	}

	/// iterate through values looking for specific elements
	function *filter(predicate){
		for(var i of keys()){
			var val= isMap ? underlay.get(i) : underlay[i]
			if(predicate(val, i, underlay)){
				yield val
			}
		}
	}

	/// ingest events into the map
	function handler(event, name, indexer, transform){
		return event.on(name, function(e){
			// `transform` happening event
			var orig= e
			if(transform)
				e= transform(e)
			// bail if blank
			if(e === undefined)
				return
			// lookup the key for an event in `indexer`
			var key= indexer(e, name, orig)
			key= argsHash(key)
			// store event
			if(key)
				// set
				set(key, e)
		})
	}

	return {
		get: get,
		getter: getter,
		set: set,
		setter: setter,
		keys: keys,
		values: values,
		items: items,
		filter: filter,
		handler: handler
	}
}

module.exports= stash
module.exports.argsHash = require('./args-hash')
