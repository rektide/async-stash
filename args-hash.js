var _= require('lodash')

/// for an array, generate a primitive hash
/// @param drop remove this many from the end
/// @param rest remove this many from the front
module.exports= (function keyHash(args, drop, rest){
	drop= drop === undefined || drop === null ? 0 : drop
	rest= rest === undefined ? 0 : rest

	var len= args.length
	return _.chain(args)
		.rest(rest)
		.first(len-drop)
		.map(function(i){
			return i.toString()
		})
		.join('')
		.value()
})
