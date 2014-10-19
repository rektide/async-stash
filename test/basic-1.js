var tape= require('tape'),
  stash= require('..')

tape('in order getter', function(t){
	var s= stash()
	s.set('a', 22)
	s.getter('a')(function(err,val){
		t.equal(val, 22)
		t.end()
	})
})

tape('out of order getter', function(t){
	var s= stash()
	s.getter('a')(function(err,val){
		t.equal(val, 23)
		t.end()
	})
	s.set('a', 23)
})

tape('composite key', function(t){
	var s= stash()
	s.getter('a', 'b', 3)(function(err,val){
		t.equal(val, 23)
		t.end()
	})
	s.set('a', 'b', 3, 23)
})

