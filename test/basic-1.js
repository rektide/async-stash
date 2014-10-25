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

tape('setter', function(t){
	t.plan(7)
	var s= stash()

	var setterA= s.setter('a')
	s.getter('a')(function(err, val){
		t.notOk(err, 'setter does not fail')
		t.equal(val, 41, 'set value is correct')
	})
	setterA(undefined, 41)

	var setterB= s.setter('b')
	var getterB= s.getter('b')
	setterB(undefined, 42)
	getterB(function(err, val){
		t.notOk(err, 'setter does not fail')
		t.equal(val, 42, 'set value is correct')
	})

	s.setter('c')(undefined, 43)
	s.getter('c')(function(err, val){
		t.notOk(err, 'setter does not fail')
		t.equal(val, 43, 'set value is correct')
	})

	var o= {}
	for(var kv of s.items()){
		o[kv[0]]= kv[1]
	}
	t.deepEqual(o, {
		a: 41,
		b: 42,
		c: 43
	}, 'final values are correct')
})
