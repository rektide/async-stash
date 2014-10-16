var stash= require('..'),
  tape= require('tape')

tape('keys', function(t){
	t.plan(3)

	var s= stash()
	s.set('a', 1)
	s.set('b', 2)
	s.set('c', 3)

	var i= 'a'
	for(var k of s.keys()){
		t.equal(k, i, 'has key')
		i= String.fromCharCode(i.charCodeAt(0)+1)
	}
})

tape('values', function(t){
	t.plan(3)

	var s= stash()
	s.set('a', 1)
	s.set('b', 2)
	s.set('c', 3)

	var i= 1
	for(var k of s.values()){
		t.equal(k, i++, 'has value')
	}
})

tape('items', function(t){
	t.plan(3)

	var s= stash()
	s.set('a', 1)
	s.set('b', 2)
	s.set('c', 3)

	var i= 'a', j= 1
	for(var k of s.items()){
		t.deepEqual(k, [i, j++], 'has value')
		i= String.fromCharCode(i.charCodeAt(0)+1)
	}
})

tape('predicate', function(t){
	t.plan(2)

	var s= stash()
	s.set('a', 1)
	s.set('b', 2)
	s.set('c', 3)
	s.set('d', 4)

	function latter(o, i){
		var ok = o == 3 || i == 'd'
		return ok
	}
	var i= 3
	for(var o of s.filter(latter)){
		t.equal(o, i++)
	}
})
