extends RefCounted

## Kernel smoke test: EffectExecutor + ConditionEvaluator, driven by the real
## content tables. Walks the minimal playable path Lop -> Sachiu.

var _fails := 0


func _ok(cond: bool, what: String) -> void:
	if not cond:
		printerr("  FAIL: %s" % what)
		_fails += 1


func _load_table(path: String) -> Array:
	var f := FileAccess.open(path, FileAccess.READ)
	assert(f != null, "missing content file: " + path)
	return (JSON.parse_string(f.get_as_text()) as Dictionary)["records"]


func run() -> bool:
	var cities := _load_table("res://content/tables/cities/central_asia.json")
	var sites := _load_table("res://content/tables/events/site.json")
	var entries := _load_table("res://content/tables/events/entry.json")

	var by_id := {}
	for r in sites + entries:
		by_id[r["id"]] = r

	# ---------------------------------------------------------------- setup
	var state := WorldState.new()
	state.seed = "test-run"
	state.city = "lop"
	state.coins = 1000
	var ex := EffectExecutor.new()
	var ce := ConditionEvaluator.new()

	# ------------------------------------------------- conditions
	_ok(ce.evaluate({"cities": ["lop"]}, state), "cities matches current city")
	_ok(not ce.evaluate({"cities": ["sachiu"]}, state), "cities rejects other city")
	_ok(ce.evaluate({}, state), "empty condition is true")
	_ok(ce.evaluate(null, state), "null condition is true")
	_ok(ce.evaluate({"coins": {"min": 400}}, state), "coins min passes")
	_ok(not ce.evaluate({"coins": {"min": 5000}}, state), "coins min fails when poor")
	_ok(ce.evaluate({"not_flags": ["fl-nope"]}, state), "not_flags passes when unset")
	_ok(ce.evaluate({"any": [{"cities": ["nowhere"]}, {"cities": ["lop"]}]}, state), "any combinator")
	_ok(not ce.evaluate({"all": [{"cities": ["lop"]}, {"coins": {"min": 9999}}]}, state), "all combinator")
	_ok(not ce.evaluate({"not": {"cities": ["lop"]}}, state), "not combinator")

	# explain() must name the unmet requirement, not just say "no"
	var why := ce.explain({"coins": {"min": 9999}}, state)
	_ok(why.size() == 1 and why[0].begins_with("explain.need_coins"), "explain names the shortfall")

	# ------------------------------------------------- preview isolation
	var buy: Array = by_id["ev-lop-bazaar"]["choices"][0]["effects"]
	var before := state.coins
	var pv := ex.preview(state, buy, {"event_id": "preview-test"})
	_ok(state.coins == before, "preview does NOT mutate the real state")
	_ok(pv.applied.size() == 4, "preview still reports what would apply")

	# ------------------------------------------------- execute
	var res := ex.execute(state, buy, {"event_id": "ev-lop-bazaar"})
	_ok(state.coins == before - 400, "coins deducted")
	_ok(state.goods.get("jade", 0) == 1, "jade acquired")
	_ok("st-lop-jade" in state.stickers, "sticker recorded")
	_ok(res.applied.size() == 4 and res.rejected.is_empty(), "all four effects applied")
	_ok(res.log_lines.size() == 4, "log lines emitted for UI")

	# ------------------------------------------------- guards
	var poor := WorldState.new()
	poor.seed = "poor"
	poor.coins = 10
	var r2 := ex.execute(poor, buy, {"event_id": "guard-test"})
	_ok(poor.coins == 10, "cannot go into debt")
	_ok(r2.rejected.size() >= 1, "insufficient funds rejected")

	# fate clamps to 0-31, never wraps
	var s3 := WorldState.new()
	s3.seed = "clamp"
	s3.fate = {"travel": 30}
	ex.execute(s3, [{"op": "fate", "id": "travel", "value": 10, "reason": "t"}], {})
	_ok(s3.fate["travel"] == 31, "fate clamps at 31")
	ex.execute(s3, [{"op": "fate", "id": "travel", "value": -99, "reason": "t"}], {})
	_ok(s3.fate["travel"] == 0, "fate clamps at 0")

	# reveal_map saturates at intel level 3
	var s4 := WorldState.new()
	s4.seed = "intel"
	for i in 6:
		ex.execute(s4, [{"op": "reveal_map", "value": "rt-lop-sachiu", "reason": "t"}], {})
	_ok(s4.revealed["rt-lop-sachiu"] == 3, "intel saturates at 3")

	# missing reason is refused (G10 at runtime, not just in schema)
	var s5 := WorldState.new()
	s5.seed = "noreason"
	s5.coins = 100
	ex.execute(s5, [{"op": "coins", "value": -50}], {})
	_ok(s5.coins == 100, "effect without reason is refused")

	# ------------------------------------------------- determinism
	var a := _replay("same-seed")
	var b := _replay("same-seed")
	var c := _replay("other-seed")
	_ok(a == b, "same seed -> identical result")
	_ok(a != c, "different seed -> different result")

	# ------------------------------------------------- content sanity
	var lop: Dictionary = {}
	for c2 in cities:
		if c2["id"] == "lop":
			lop = c2
	_ok(lop.get("tier") == "metropolis", "lop is a metropolis")
	_ok((lop.get("sites") as Array).size() == 3, "lop has exactly 3 sites")
	for s in lop["sites"]:
		_ok(by_id.has(s), "site %s exists in the event tables" % s)

	print("test_kernel: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0


## Runs a chance-gated effect stream and returns the applied count — the
## replay signature used to assert determinism.
func _replay(seed: String) -> int:
	var st := WorldState.new()
	st.seed = seed
	st.coins = 100000
	var ex := EffectExecutor.new()
	var effects: Array = []
	for i in 40:
		effects.append({"op": "coins", "value": -1, "reason": "roll", "chance": 0.5})
	var r := ex.execute(st, effects, {"rng": Rng.new(seed), "event_id": "replay"})
	return r.applied.size()
