var stash= require('..'),
  tape= require('tape')

tape('regular post get', function(t){
	var i= 0
	var s= stash()
	s.set('a', 'foobar')
	s.get('a')(function(err,val){
		t.equal(i, 0, 'get happens immediately if data available')
		t.end()
	})
	i++
})
tape('regular preemptive get', function(t){
	var i= 0
	var s= stash()
	s.get('a')(function(err,val){
		t.equal(i, 1, 'set won\'t immediately fire gets')
		t.end()
	})
	s.set('a', 'foobar')
	i++
})

tape('slow get', function(t){
	var i= 0
	var s= stash()
	s.set('a', 'foobar')
	s.get.slow= true
	s.get('a')(function(err,val){
		t.equal(i, 1, 'additional timeout before in order get completes')
		t.end()
	})
	i++
})

tape('set signals the first set value', function(t){
	var s= stash()
	s.get('a')(function(err,val){
		t.equal(val, 'foo', 'first value is received')
		t.end()
	})
	s.set('a', 'foo')
	s.set('a', 'bar')
	s.set('a', 'baz')
})

tape('setter late mode', function(t){
	var s= stash()
	s.get('a')(function(err,val){
		t.equal(val, 'baz', 'late value gotten via set.late')
		t.end()
	})
	s.set.late= true
	s.set('a', 'foo')
	s.set('a', 'bar')
	s.set('a', 'baz')
})

tape('individual getter can designate late', function(t){
	var s= stash()
	function gotten(err,val){
		t.equal(val, 'baz', 'late value gotten via get.late')
		t.end()
	}
	gotten.late= true
	s.get('a')(gotten)
	s.set('a', 'foo')
	s.set('a', 'bar')
	s.set('a', 'baz')
})

tape('set.late only effects following sets', function(t){
	t.plan(2)
	var s= stash()
	function gotA(err,val){
		t.equal(val, 'foo', 'non-late get')
	}
	function gotB(err,val){
		t.equal(val, 2, 'late get')
	}
	s.get('a')(gotA)
	s.get('b')(gotB)
	s.set('a', 'foo')
	s.set('a', 'bar')
	s.set('a', 'baz')
	s.set.late= true
	s.set('b', 1)
	s.set('b', 2)
})

