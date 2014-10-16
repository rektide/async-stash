'use strict';

var argsHash= require('./args-hash')

/// Create a Map one can .get from before the key exists.
var stash= module.exports= (function stash(opts){
	var slowGet= false

	var awaits= {},
	  resolves= {}

	/// return a thunk of a get which will immediately happen or when the key is fulfilled
	function get(key){
		var key= argsHash(arguments, 0)
		return function(done){
			var resolved= resolves[key]
			if(resolved)
				if(slowGet)
					setTimeout(function(){done(undefined, resolved)})
				else
					done(undefined, resolved)
			else{
				var wait= awaits[key]
				if(wait)
					wait.push(done)
				else
					awaits[key]= [done]
			}
		}
	}
	Object.defineProperty(get, 'slow', {
		get: function(){
			return slowGet
		},
		set: function(value){
			slowGet= value
		}
	})

	/// sets a value by indicies
	function set(){
		var key= argsHash(arguments, 1),
		  waits= awaits[key]
		if(waits && waits.length){
			// remove all waits, and in the future trigger them
			var val= arguments[arguments.length-1]
			setTimeout(function(){
				for(var i= 0; i< waits.length; ++i){
					var wait= waits[i]
					wait(val)
					// wait(await[key]) // live version!
				}
			}, 0)
			awaits[key]= null
		}
		// set
		resolves[key]= val
	}

	/// iterate through keys
	function *keys(){
		var val
		for(var i of resolves){
			if(val !== undefined)
				yield val
			val= resolves[i]
		}
		return val
	}

	/// iterate through all items
	function *items(){
		var first= true,
		  val
		for(var i in keys()){
			if(!first){
				yield val
			}else{
				first= false
			}
			val= [i, resolves[i]]
		}
		return val
	}

	/// iterate through all values
	function *values(){
		var first= true,
		  val
		for(var i in keys()){
			if(!first){
				yield val
			}else{
				first= false
			}
			val= resolves[i]
		}
		return val
	}

	/// iterate through values looking for specific elements
	function *filter(predicate){
		var hasVal= false,
		  val
		for(var i in keys()){
			var temp= resolves[i]
			if(predicate(temp)){
				if(hasVal){
					yield val
				}
				val= temp
				hasVal= true
			}
		}
		return val
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
			// store event
			if(key)
				// set
				set(key, e)
		})
	}

	return {
		get: get,
		set: set,
		keys: keys,
		values: values,
		filter: filter,
		handler: handler
	}
})
