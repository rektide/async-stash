var tape= require('tape'),
  stash= require('..')

tape('in order get', function(t){
	var s= stash()
	s.set('a', 22)
	s.get('a')(function(err,val){
		t.equal(val, 22)
		t.end()
	})
})

tape('out of order get', function(t){
	var s= stash()
	s.get('a')(function(err,val){
		t.equal(val, 23)
		t.end()
	})
	s.set('a', 23)
})

tape('composite key', function(t){
	var s= stash()
	s.get('a', 'b', 3)(function(err,val){
		t.equal(val, 23)
		t.end()
	})
	s.set('a', 'b', 3, 23)
})

