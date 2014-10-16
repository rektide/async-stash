var _= require('lodash')

module.exports= (function keyHash(args, n){
	n= n === undefined ? 1 : n
	var len= args.length
	return _.chain(args)
		.first(len-n)
		.map(function(i){
			return i.toString()
		})
		.join('')
		.value()
})
