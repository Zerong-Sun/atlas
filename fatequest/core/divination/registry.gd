class_name DivinationRegistry
extends RefCounted

## Open registry. The number of divination methods is uncapped by design;
## this is the seam that keeps it that way.

static var _methods: Dictionary = {}


static func register(m: DivinationMethod) -> void:
	var mid := m.id()
	assert(mid != "", "divination method with empty id")
	assert(not _methods.has(mid), "duplicate divination id: " + mid)
	_methods[mid] = m


static func get_method(mid: String) -> DivinationMethod:
	return _methods.get(mid)


static func has(mid: String) -> bool:
	return _methods.has(mid)


static func ids() -> Array:
	var out := _methods.keys()
	out.sort()
	return out


static func all() -> Array:
	return _methods.values()


static func clear() -> void:
	_methods.clear()


## Cast and convert in one step. Asserts the non-empty-effects rule at runtime
## so a badly written method fails loudly in dev rather than shipping as
## decoration.
static func cast(mid: String, ctx: DivinationContext) -> Dictionary:
	var m := get_method(mid)
	if m == null:
		push_error("unknown divination method: " + mid)
		return {}
	var raw := m.cast(ctx)
	var effects := m.to_effects(raw, ctx)
	if effects.is_empty():
		push_error("divination '%s' produced no effects (GDD 8.2 / gate G3)" % mid)
	return {
		"method": mid,
		"raw": raw,
		"effects": effects,
		"reading": m.reading_keys(raw, ctx),
	}
