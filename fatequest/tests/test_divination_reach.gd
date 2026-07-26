extends RefCounted

## T2 reachability: every mvp method is learnable and usable in content + via EventMachine.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c: printerr("  FAIL: %s" % w); _f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	DivinationData.bind(db)
	DivinationBootstrap.register_all()

	var city_ids: Dictionary = {}
	for c in db.cities():
		city_ids[String(c.get("id", ""))] = true

	var learn_events: Dictionary = {}  ## method -> event id
	var use_events: Dictionary = {}    ## method -> count
	for e in db.get_table("events"):
		for ch in e.get("choices", []):
			for ef in ch.get("effects", []):
				if String(ef.get("op", "")) == "learn_divination":
					var mid := String(ef.get("value", ""))
					learn_events[mid] = String(e.get("id", ""))
			var d := String(ch.get("divination", ""))
			if d != "":
				use_events[d] = int(use_events.get(d, 0)) + 1

	for rec in db.get_table("divinations"):
		if not bool(rec.get("mvp", false)):
			continue
		var mid := String(rec.get("id", ""))
		var learn_at: Array = rec.get("learnAt", [])
		_ok(not learn_at.is_empty(), "%s has non-empty learnAt" % mid)
		for cid in learn_at:
			_ok(city_ids.has(String(cid)), "%s learnAt city '%s' exists" % [mid, cid])
		_ok(learn_events.has(mid), "%s has a learn_divination event" % mid)
		_ok(int(use_events.get(mid, 0)) >= 1, "%s has a choices[].divination use" % mid)

		# Simulate: stand in first learnAt city, fire mentor learn, then cast
		var st := WorldState.new()
		st.seed = "reach-" + mid
		st.city = String(learn_at[0])
		st.coins = 100000
		st.jdn = 2200000
		var cond := ConditionEvaluator.new()
		var ex := EffectExecutor.new()
		var em := EventMachine.new(db, cond, ex)
		var mentor_id := String(learn_events[mid])
		var mentor: Dictionary = db.get_record(mentor_id)
		_ok(not mentor.is_empty(), "%s mentor event loaded" % mid)
		var learn_idx := -1
		var choices: Array = mentor.get("choices", [])
		for i in choices.size():
			var ch: Dictionary = choices[i]
			for ef in ch.get("effects", []):
				if String(ef.get("op", "")) == "learn_divination" and String(ef.get("value", "")) == mid:
					learn_idx = i
					break
			if learn_idx >= 0:
				break
		_ok(learn_idx >= 0, "%s mentor has learn choice" % mid)
		if learn_idx >= 0:
			em.choose(mentor, learn_idx, st, Rng.new("learn-" + mid), {})
			_ok(mid in st.learned_divinations, "%s learned after mentor" % mid)
			var cast := DivinationRegistry.cast(mid, DivinationContext.new(st, Rng.new("cast-" + mid)))
			_ok(not cast.is_empty(), "%s cast succeeds after learn" % mid)
			_ok(not (cast.get("effects", []) as Array).is_empty(), "%s effects non-empty after learn" % mid)

	print("test_divination_reach: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
