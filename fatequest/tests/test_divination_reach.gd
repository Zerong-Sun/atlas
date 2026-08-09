extends RefCounted

const CatalogCore = preload("res://core/divination/catalog.gd")

## T2 reachability: every method admitted to a historical journey is learnable
## and usable there. Annex-only methods are deliberately excluded even if an
## archived mentor event still exists in the content corpus.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c: printerr("  FAIL: %s" % w); _f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	DivinationData.bind(db)
	DivinationBootstrap.register_all()
	var catalog = CatalogCore.new()
	catalog.configure(db.get_table("divination_catalog"))

	var city_ids: Dictionary = {}
	for c in db.cities():
		city_ids[String(c.get("id", ""))] = true

	var learn_events: Dictionary = {}  ## method -> {event id, choice index}
	var use_events: Dictionary = {}    ## method -> count
	for e in db.get_table("events"):
		var event_choices: Array = e.get("choices", [])
		for choice_index in event_choices.size():
			var ch: Dictionary = event_choices[choice_index]
			for ef in ch.get("effects", []):
				if String(ef.get("op", "")) == "learn_divination":
					var mid := String(ef.get("value", ""))
					if not learn_events.has(mid):
						learn_events[mid] = {
							"event": String(e.get("id", "")),
							"choice": choice_index,
						}
			var d := String(ch.get("divination", ""))
			if d != "":
				use_events[d] = int(use_events.get(d, 0)) + 1

	for rec in db.get_table("divinations"):
		var mid := String(rec.get("id", ""))
		_ok(catalog.available_in_annex(mid), "%s is represented in the annex" % mid)
		var catalog_entry := catalog.get_entry(mid)
		if "journey" not in catalog_entry.get("playSpaces", []):
			continue
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
		var cond := ConditionEvaluator.new(db)
		var ex := EffectExecutor.new()
		var em := EventMachine.new(db, cond, ex)
		var teaching: Dictionary = learn_events.get(mid, {})
		var mentor_id := String(teaching.get("event", ""))
		var mentor: Dictionary = db.get_record(mentor_id)
		_ok(not mentor.is_empty(), "%s mentor event loaded" % mid)
		var learn_idx := int(teaching.get("choice", -1))
		_ok(learn_idx >= 0, "%s mentor has learn choice" % mid)
		if learn_idx >= 0:
			var mentor_cities: Array = mentor.get("when", {}).get("cities", [])
			_ok(not mentor_cities.is_empty(), "%s mentor event names its city" % mid)
			if not mentor_cities.is_empty():
				st.city = String(mentor_cities[0])
				_ok(st.city in learn_at, "%s mentor city is declared in learnAt" % mid)
			em.choose(mentor, learn_idx, st, Rng.new("learn-" + mid), {
				"lesson_passed": mid,
			})
			_ok(mid in st.learned_divinations, "%s learned after mentor" % mid)
			var cast := DivinationRegistry.cast(mid, DivinationContext.new(st, Rng.new("cast-" + mid)))
			_ok(not cast.is_empty(), "%s cast succeeds after learn" % mid)
			_ok(not (cast.get("effects", []) as Array).is_empty(), "%s effects non-empty after learn" % mid)

	print("test_divination_reach: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
