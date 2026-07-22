class_name Rng
extends RefCounted

## Deterministic PRNG (mulberry32), ported from atlas/packages/engines/src/seed.ts.
##
## This is the ONLY source of randomness in core/. Calling randi()/randf() from
## core/ is a CI failure (docs/CODE_PLAN.md G11) because it breaks the
## (seed, inputs) -> world guarantee that saves, tests and balance sims rely on.
##
## Parity with the TypeScript original is asserted by tests/test_rng.gd against
## tools/parity/rng_fixture.json. Do not "clean up" the bit twiddling below —
## every mask reproduces a specific JavaScript coercion.

const _U32 := 0xFFFFFFFF

var _state: int


func _init(seed: String) -> void:
	_state = hash_seed(seed)


## JS Math.imul: 32-bit integer multiply with wraparound.
## Split into 16-bit halves so the intermediate product cannot overflow int64.
static func _imul(a: int, b: int) -> int:
	a &= _U32
	b &= _U32
	var lo := a & 0xFFFF
	var hi := (a >> 16) & 0xFFFF
	return (lo * b + (((hi * b) & 0xFFFF) << 16)) & _U32


static func hash_seed(seed: String) -> int:
	var h := (1779033703 ^ seed.length()) & _U32
	for i in seed.length():
		# unicode_at() matches JS charCodeAt() for the Basic Multilingual Plane.
		# Ids are ASCII by convention (docs/DATA_MODEL.md §2), so the surrogate
		# -pair divergence above U+FFFF is unreachable for real seeds.
		h = _imul(h ^ seed.unicode_at(i), 3432918353)
		h = (((h << 13) & _U32) | (h >> 19)) & _U32
	return h if h != 0 else 1


## Next float in [0, 1).
func next() -> float:
	_state = (_state + 0x6D2B79F5) & _U32
	var t := _imul(_state ^ (_state >> 15), 1 | _state)
	t = ((t + _imul(t ^ (t >> 7), 61 | t)) & _U32) ^ t
	return float((t ^ (t >> 14)) & _U32) / 4294967296.0


## Next int in [0, n).
func next_int(n: int) -> int:
	assert(n > 0, "Rng.next_int needs a positive bound")
	return int(next() * n)


func pick(arr: Array) -> Variant:
	assert(not arr.is_empty(), "Rng.pick on an empty array")
	return arr[next_int(arr.size())]


## Fisher-Yates on a copy. Never shuffles in place — callers routinely hold the
## source array as authoritative content data.
func shuffle(arr: Array) -> Array:
	var out := arr.duplicate()
	for i in range(out.size() - 1, 0, -1):
		var j := next_int(i + 1)
		var tmp: Variant = out[i]
		out[i] = out[j]
		out[j] = tmp
	return out


## Derive a named independent stream.
##
## Every random point in the game must draw from its own fork, never from a
## shared parent stream. Otherwise the NUMBER of draws in one system leaks into
## another: refreshing a market one more time would change a storm at sea three
## weeks later. That class of bug is invisible in testing and fatal to replay.
func fork(label: String) -> Rng:
	return Rng.new("%d:%s" % [_state, label])
