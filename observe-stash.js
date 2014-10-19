'use strict';

var argsHash= require('./args-hash')

/// Create a Map one can .get from before the key exists.
var stash= module.exports= (function stash(opts){
	var slowGet= false,
	  lateSet= false

	var awaits= {},
	  resolves= {}

	function get(){
		var key= argsHash(arguments, 0)
		return resolves[key]
	}

	/// return a thunk of a get which will immediately happen or when the key is fulfilled
	function getter(){
		var key= argsHash(arguments, 0)
		return function(done){
			var resolved= resolves[key]
			if(resolved){
				if(slowGet)
					setTimeout(function(){done(undefined, resolved)})
				else
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
	Object.defineProperty(getter, 'slow', {
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
		  val= arguments[arguments.length-1],
		  waits= awaits[key],
		  late= lateSet
		if(waits && waits.length){
			// remove all waits, and in the future trigger them
			setTimeout(function(){
				for(var i= 0; i< waits.length; ++i){
					var wait= waits[i]
					if(wait.late || late){
						wait(undefined, resolves[key]) // resolve late
					}else
						wait(undefined, val)
				}
			}, 0)
			awaits[key]= null
		}
		// set
		resolves[key]= val
	}
	Object.defineProperty(set, 'late', {
		get: function(){
			return lateSet
		},
		set: function(value){
			lateSet= !!value
		}
	})

	/// iterate through keys
	function *keys(){
		for(var i in resolves){
			yield i
		}
	}

	/// iterate through all items
	function *items(){
		for(var i of keys()){
			yield [i, resolves[i]]
		}
	}

	/// iterate through all values
	function *values(){
		for(var i of keys()){
			yield resolves[i]
		}
	}

	/// iterate through values looking for specific elements
	function *filter(predicate){
		for(var i of keys()){
			var val= resolves[i]
			if(predicate(val, i, resolves)){
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
		keys: keys,
		values: values,
		items: items,
		filter: filter,
		handler: handler
	}
})
