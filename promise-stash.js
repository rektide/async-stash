'use strict';

var Promise= require('native-or-bluebird'),
  argsHash= require('./args-hash')

module.exports= (function stash(opts){
	var stash= {}
	/// retrieve a record asynchronously
	/// @param indexes (varidac) indexes in to the stash to lookup.
	/// @param cb final parameter is a callback which accepts the final value
	function get(){
		var len= arguments.length,
		  cb= arguments[len-1],
		  key= argsHash(arguments),
		  value= stash[key]
		if(!value){
			var defer= Promise.defer()
			value= stash[key]= defer
		}
	
		if(value.promise){
			value.promise.then(function(val){
				cb(undefined, val)
			}, function(err){
				cb(err)
			})
		}else if(val.then){
			val.then(function(val){
				cb(undefined, val)
			}, function(err){
				cb(err)
			})
		}else if(val){
			setTimeout(function(){
				cb(null, val)
			}, 0)
		}
	}

	/// @param set a record
	/// @param indexes (varidac) indexes in the stash for where to set
	/// @param value the value to set this entry in the stash to (or promise)
	function set(){
		var len= arguments.length,
		  val= arguments[len-1],
		  key= argsHash(arguments),
		  cur= stash[key]
		if(cur.resolve){
			cur.resolve(val)
		}
		stash[key]= val
		if(val.then){
			if(options.timeout){
				setTimeout(function(){
					stash[key]= null
				}, options.timeout)
			}
		}
	}

	return {
		get: get,
		set: set
	}
})
