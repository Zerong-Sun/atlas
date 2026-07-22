extends RefCounted

## Proves the registry is genuinely open: a method defined entirely outside
## core/divination/methods/ registers and casts with no kernel change.

class FakeMethod extends DivinationMethod:
	func id() -> String: return "fake-bones"
	func inputs() -> Array: return ["object"]
	func reads() -> Array: return ["route"]
	func cast(ctx: DivinationContext) -> Dictionary:
		return {"crack": ctx.rng.next_int(4)}
	func to_effects(raw: Dictionary, _c: DivinationContext) -> Array:
		return [{"op": "flag", "value": "fl-bones-%d" % raw["crack"], "reason": "bone-cast"}]

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c: printerr("  FAIL: %s" % w); _f += 1


func run() -> bool:
	DivinationBootstrap.register_all()
	_ok(DivinationRegistry.has("iching"), "iching registered by bootstrap")

	var st := WorldState.new()
	st.seed = "div-test"
	st.city = "lop"
	var ctx := DivinationContext.new(st, Rng.new("div-test"))

	var r := DivinationRegistry.cast("iching", ctx)
	_ok(not r.is_empty(), "iching casts")
	var raw: Dictionary = r["raw"]
	_ok((raw["lines"] as Array).size() == 6, "six lines thrown")
	for l in raw["lines"]:
		_ok(l >= 6 and l <= 9, "line value in 6..9")
	# Non-empty effects is the G3 rule enforced in code, not just in the linter.
	_ok(not (r["effects"] as Array).is_empty(), "iching produces effects")
	for e in r["effects"]:
		_ok(e.has("reason"), "every effect carries a reason")

	# Same seed -> same hexagram.
	var r2 := DivinationRegistry.cast("iching", DivinationContext.new(st, Rng.new("div-test")))
	_ok(r2["raw"]["primary"] == raw["primary"], "same seed reproduces the hexagram")

	# Extensibility: register an 11th method with zero kernel edits.
	var before := DivinationRegistry.ids().size()
	DivinationRegistry.register(FakeMethod.new())
	_ok(DivinationRegistry.ids().size() == before + 1, "new method registers")
	var fr := DivinationRegistry.cast("fake-bones", ctx)
	_ok(not (fr["effects"] as Array).is_empty(), "new method casts and yields effects")

	print("test_divination: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
