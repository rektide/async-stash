'use strict';

var argsHash= require('./args-hash')

var stash= module.exports= (function stash(opts){
	var awaits= {},
	  resolves= {}

	function get(){
		var key= argsHash(arguments, 0)
		return function(done){
			var resolved= resolves[key]
			if(resolved)
				done(resolved)
			else{
				var wait= awaits[key]
				if(wait)
					wait.push(done)
				else
					awaits[key]= [done]
			}
		}
	}

	/// sets a value by indicies
	function set(){
		var key= argsHash(arguments),
		  val= arguments[arguments.length-1],
		  waits= awaits[key]
		setTimeout(function(){
			for(var i= 0; i< waits.length; ++i){
				waits[i](val)
			}
		}, 0)
		awaits[key]= null
		resolves[key]= val
	}

	return {
		get: get,
		set: set
	}
})
