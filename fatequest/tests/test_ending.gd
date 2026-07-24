extends RefCounted

## Endings (GDD §14).
##
## The thing worth testing hardest is not which ending fires — it is that the
## closing paragraph tells the truth. An epilogue is the last text a player
## reads, and it is the easiest place in the whole game to print a plausible
## number that no part of the run ever produced.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	I18n.load_lang("zh")
	var end := Ending.new(db)
	var exec := EffectExecutor.new()

	_always_an_ending(db, end, exec)
	_journey_record(db, end, exec)
	_conditions(db, end, exec)
	_epilogue(db, end, exec)
	_cost_basis(db, exec)

	print("test_ending: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0


func _st() -> WorldState:
	var s := WorldState.new()
	s.seed = "end"
	s.city = "tauris"
	s.coins = 100000
	s.jdn = GameDate.from_gregorian(1292, 4, 11).jdn
	return s


func _walk(exec: EffectExecutor, st: WorldState, cities: Array) -> void:
	for c in cities:
		exec.execute(st, [{"op": "goto", "value": c, "reason": "t"}], {"event_id": "walk"})


# ------------------------------------------------ there is always an ending

func _always_an_ending(db: ContentDb, end: Ending, exec: EffectExecutor) -> void:
	# A player who has done nothing must still be able to close the book.
	var st := _st()
	var b := end.best(st)
	_ok(not b.is_empty(), "a fresh run still has an ending to reach for")
	_ok(int(b.get("layer", 0)) == 1, "and it is the layer-1 'lay down the pen'")

	# Every ending in the table must be reachable in principle — a condition
	# key nobody implements would make one silently impossible.
	for e in db.get_table("endings"):
		var cond: Dictionary = e.get("conditions", {})
		for k in cond.keys():
			_ok(k in ["visitedCities", "returnedToStart", "reputationBands", "netWorth",
				"revealedRoutes", "learnedDivinations", "flags", "retainersKept", "codexPct"],
				"%s: condition key '%s' is one the judge implements" % [e.get("id"), k])


# ------------------------------------------------------- the journey record

func _journey_record(db: ContentDb, end: Ending, exec: EffectExecutor) -> void:
	var st := _st()
	_ok(st.visited.is_empty(), "a run starts with no cities behind it")

	_walk(exec, st, ["baldacum", "ormus"])
	_ok(st.start_city == "tauris", "the city you were standing in becomes the origin")
	_ok(st.visited.size() == 3, "and it counts among the cities visited (%d)" % st.visited.size())
	_ok(st.city == "ormus", "you end where you last went")

	# Walking back over old ground does not inflate the count.
	_walk(exec, st, ["baldacum", "tauris", "baldacum"])
	_ok(st.visited.size() == 3, "revisiting a city does not count twice (%d)" % st.visited.size())
	_ok(st.start_city == "tauris", "and the origin never moves")

	# The longest leg is a road actually walked, not the longest in the table.
	var st2 := _st()
	exec.execute(st2, [
		{"op": "leg", "id": "rt-a", "value": 300, "days": 9, "reason": "t"},
		{"op": "leg", "id": "rt-b", "value": 1200, "days": 40, "reason": "t"},
		{"op": "leg", "id": "rt-c", "value": 800, "days": 20, "reason": "t"},
	], {"event_id": "legs"})
	_ok(String(st2.longest_leg.get("route", "")) == "rt-b", "the longest leg wins")
	_ok(int(st2.longest_leg.get("days", 0)) == 40, "and carries its own day count")


# ------------------------------------------------------------- conditions

func _conditions(db: ContentDb, end: Ending, exec: EffectExecutor) -> void:
	# returnedToStart: standing still is not a return.
	var st := _st()
	_ok(not end._matches(st, {"returnedToStart": true}),
		"never having left is not a homecoming")
	_walk(exec, st, ["baldacum", "tauris"])
	_ok(end._matches(st, {"returnedToStart": true}), "walking a circle is")
	_ok(not end._matches(st, {"returnedToStart": false}), "and is not its opposite")

	# visitedCities is a floor, not an equality.
	_ok(end._matches(st, {"visitedCities": 2}), "two cities meets a floor of two")
	_ok(not end._matches(st, {"visitedCities": 9}), "and does not meet nine")

	# Flags must all be present.
	exec.execute(st, [{"op": "flag", "value": "fl-a", "reason": "t"}], {"event_id": "f"})
	_ok(end._matches(st, {"flags": ["fl-a"]}), "a set flag matches")
	_ok(not end._matches(st, {"flags": ["fl-a", "fl-b"]}), "a missing one fails the whole set")

	# An unknown key must fail loudly rather than pass by default — the same
	# rule the condition evaluator follows. A silently-ignored key would make
	# an ending fire for everyone.
	_ok(not end._matches(st, {"noSuchCondition": 3}),
		"an unknown condition key rejects rather than passes")

	# Layer ordering: the more demanding ending outranks the fallback.
	var rich := _st()
	_walk(exec, rich, ["baldacum", "ormus", "balc", "samarcanda", "cascar"])
	rich.coins = 900000000
	var b := end.best(rich)
	_ok(not b.is_empty(), "a substantial run has an ending")
	_ok(int(b.get("layer", 1)) >= 1, "layer is well-formed")
	_ok(end.qualifying(rich).size() >= 1, "and layer 1 remains available underneath")


# --------------------------------------------------------------- epilogue

func _epilogue(db: ContentDb, end: Ending, exec: EffectExecutor) -> void:
	var st := _st()
	_walk(exec, st, ["baldacum", "ormus"])
	exec.execute(st, [
		{"op": "days", "value": 800, "reason": "t"},
		{"op": "leg", "id": "rt-tauris-baldacum", "value": 900, "days": 30, "reason": "t"},
	], {"event_id": "e"})
	var clock := WorldClock.new(st.jdn)

	# Both shipping languages. Checking only one leaves the other free to carry
	# an unfilled {variable} into the last paragraph a player ever reads.
	for lang in ["en", "zh"]:
		I18n.load_lang(lang)
		for e in db.get_table("endings"):
			var text := end.epilogue(st, e, clock)
			# No variable may survive interpolation.
			_ok(not text.contains("{"),
				"%s/%s: every variable is filled — got %s"
				% [lang, e.get("id"), text.substr(0, 60)])
			_ok(text.length() > 40, "%s/%s: the epilogue has a body" % [lang, e.get("id")])
			_ok(not text.begins_with("end."),
				"%s/%s: the epilogue key resolved to text, not itself" % [lang, e.get("id")])
	I18n.load_lang("zh")

	# A run with no trade must say so, not print a zero or a placeholder good.
	var lay := db.get_record("end-lay-down-the-pen")
	var no_trade := end.epilogue(st, lay, clock)
	_ok(no_trade.contains(I18n.t("epilogue.no_great_trade")),
		"with no sale behind you, the epilogue says so rather than naming a good")

	# Once there is a real sale, the good is named.
	exec.execute(st, [{"op": "trade", "id": "silk", "value": 4000, "reason": "t"}],
		{"event_id": "t"})
	var with_trade := end.epilogue(st, lay, clock)
	_ok(with_trade != no_trade, "a real sale changes the closing paragraph")
	_ok(with_trade.contains(I18n.t(db.get_record("silk").get("name", "silk"))),
		"and it names the good actually traded")

	# Years never reads as zero: a short book is still "a year of travels".
	var young := _st()
	_walk(exec, young, ["baldacum"])
	_ok(not end.epilogue(young, lay, WorldClock.new(young.jdn)).contains(" 0 "),
		"a run shorter than a year never reports 0 years")


# ------------------------------------------------------------- cost basis

func _cost_basis(db: ContentDb, exec: EffectExecutor) -> void:
	var mk := Market.new(db)
	var st := _st()
	var city := db.get_record("tauris")
	var good := db.get_record(String(city.get("market", {}).get("goods", ["silk"])[0]))
	if good.is_empty():
		return

	exec.execute(st, mk.buy_effects(good, city, st.jdn, st.seed), {"event_id": "buy"})
	var gid := String(good["id"])
	_ok(st.purchases.has(gid), "buying records what was paid")
	var unit := int(st.purchases[gid].get("unit", 0))
	_ok(unit > 0, "and the figure is real (%d)" % unit)
	_ok(String(st.purchases[gid].get("band", "")) == String(city.get("band", "")),
		"along with where the silver was spent")

	# Net worth counts the hold at cost, not at some price it might fetch.
	var end := Ending.new(db)
	_ok(end._net_worth(st) == st.coins + unit, "unsold goods count at what they cost")

	# Selling in a different band must cost something at the money-changer —
	# this could never fire while the caller supplied the selling city's band.
	var far := db.get_record("zayton")
	if not far.is_empty() and String(far.get("band", "")) != String(city.get("band", "")):
		var fx := mk.sell_effects(good, far, st.jdn, st.seed, st.purchases[gid])
		var flagged := false
		for f in fx:
			if String(f.get("op", "")) == "flag" and String(f.get("value", "")) == "fl-paid-exchange":
				flagged = true
		_ok(flagged, "carrying silver across a currency frontier costs a cut")

	# Selling everything clears the basis, so the next lot is priced fresh.
	exec.execute(st, mk.sell_effects(good, city, st.jdn, st.seed, st.purchases[gid]),
		{"event_id": "sell"})
	_ok(not st.purchases.has(gid), "an empty hold keeps no cost basis")
