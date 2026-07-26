extends RefCounted

## P3 + T2: registry 24; MVP cast; F-3 learned guard; second-batch engines.

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


func _assert_method(st: WorldState, mid: String) -> void:
	st.learned_divinations = [mid]
	var r := DivinationRegistry.cast(mid, DivinationContext.new(st, Rng.new(mid + "-a")))
	_ok(not r.is_empty(), "%s casts when learned" % mid)
	_ok(not (r["effects"] as Array).is_empty(), "%s 产出非空 effects" % mid)
	for e in r["effects"]:
		_ok(e.has("reason"), "%s 每条 effect 带 reason" % mid)
	var r2 := DivinationRegistry.cast(mid, DivinationContext.new(st, Rng.new(mid + "-a")))
	_ok(r2.get("raw", {}) == r.get("raw", {}), "%s 同种子同结果" % mid)


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	DivinationData.bind(db)
	DivinationBootstrap.register_all()

	_ok(DivinationRegistry.ids().size() == 24, "registry has 24 methods (got %d)" % DivinationRegistry.ids().size())
	for mid in ["iching", "bazi", "lot", "tarot", "jiaobei", "astrodice", "geomancy", "runes"]:
		_ok(DivinationRegistry.has(mid), "%s registered" % mid)

	var st := WorldState.new()
	st.seed = "div-test"
	st.city = "lop"
	st.jdn = 2200000
	st.birthdate_jdn = 2195000

	# F-3: unlearned cast is empty
	st.learned_divinations = []
	var denied := DivinationRegistry.cast("iching", DivinationContext.new(st, Rng.new("div-test")))
	_ok(denied.is_empty(), "F-3: unlearned cast returns empty")

	st.learned_divinations = ["iching", "lot", "tarot", "bazi", "jiaobei", "astrodice", "geomancy", "runes", "dream"]
	var ctx := DivinationContext.new(st, Rng.new("div-test"))

	var r := DivinationRegistry.cast("iching", ctx)
	_ok(not r.is_empty(), "iching casts")
	var raw: Dictionary = r["raw"]
	_ok((raw["lines"] as Array).size() == 6, "six lines thrown")
	for l in raw["lines"]:
		_ok(l >= 6 and l <= 9, "line value in 6..9")
	_ok(not (r["effects"] as Array).is_empty(), "iching produces effects")
	for e in r["effects"]:
		_ok(e.has("reason"), "every effect carries a reason")

	var r2 := DivinationRegistry.cast("iching", DivinationContext.new(st, Rng.new("div-test")))
	_ok(r2["raw"]["primary"] == raw["primary"], "same seed reproduces the hexagram")

	var lot := DivinationRegistry.cast("lot", DivinationContext.new(st, Rng.new("lot-test")))
	_ok(not (lot["effects"] as Array).is_empty(), "lot produces effects")
	_ok(String(lot["raw"].get("sign_id", "")) != "", "lot drew a sign")

	var tctx := DivinationContext.new(st, Rng.new("tarot-test"))
	tctx.spread = "choice-gate"
	tctx.exit_a = "rt-a"
	tctx.exit_b = "rt-b"
	var tarot := DivinationRegistry.cast("tarot", tctx)
	_ok((tarot["raw"].get("cards", []) as Array).size() == 5, "choice-gate draws 5 cards")
	_ok(not (tarot["effects"] as Array).is_empty(), "tarot produces effects")
	var tarot_ops: Array = []
	for e in tarot["effects"]:
		tarot_ops.append(e.get("op"))
	_ok("reveal_map" in tarot_ops, "tarot choice-gate reveals map")

	var bazi := DivinationRegistry.cast("bazi", DivinationContext.new(st, Rng.new("bazi-test")))
	_ok(bazi["raw"].has("pillars"), "bazi returns pillars")
	_ok(not (bazi["effects"] as Array).is_empty(), "bazi produces effects")

	for mid in ["jiaobei", "astrodice", "geomancy", "runes"]:
		_assert_method(st, mid)

	# Soft methods still register and cast when learned
	st.learned_divinations = ["dream"]
	var soft := DivinationRegistry.cast("dream", DivinationContext.new(st, Rng.new("dr")))
	_ok((soft["effects"] as Array).size() == 1, "soft method single codex effect")
	_ok(String(soft["effects"][0].get("op")) == "codex", "soft effect is codex")

	# EventMachine integration: learned tarot at fork changes revealed
	st.learned_divinations = ["tarot"]
	st.revealed.clear()
	var executor := EffectExecutor.new()
	var conditions := ConditionEvaluator.new()
	var em := EventMachine.new(db, conditions, executor)
	var fork := {
		"id": "ev-test-fork",
		"choices": [{
			"label": "cast",
			"needs": {"learned_divination": ["tarot"]},
			"divination": "tarot",
			"spread": "one-card",
			"subject": "lop",
			"pass": {"effects": [{"op": "flag", "value": "fl-ok", "reason": "pass"}]},
			"fail": {"effects": [{"op": "flag", "value": "fl-fail", "reason": "fail"}]},
		}],
	}
	var before := int(st.revealed.get("lop", 0))
	var res := em.choose(fork, 0, st, Rng.new("em-div"), {})
	_ok(not res.reading.is_empty(), "EventMachine stores reading")
	_ok(int(st.revealed.get("lop", 0)) > before or st.flags.has("fl-ok") or st.flags.has("fl-fail"),
		"cast changed world state")

	var before_n := DivinationRegistry.ids().size()
	DivinationRegistry.register(FakeMethod.new())
	_ok(DivinationRegistry.ids().size() == before_n + 1, "new method registers")
	st.learned_divinations = ["fake-bones"]
	var fr := DivinationRegistry.cast("fake-bones", DivinationContext.new(st, Rng.new("fb")))
	_ok(not (fr["effects"] as Array).is_empty(), "new method casts and yields effects")

	print("test_divination: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
