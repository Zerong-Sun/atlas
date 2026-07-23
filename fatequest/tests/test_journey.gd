extends RefCounted

## The minimal playable path, end to end, headless: arrive at Lop, fire its
## entry event, take a choice, hire the road open, travel to Sachiu, arrive.
##
## This is the acceptance test for "骨架落地: 一条最小可玩路径".

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var cond := ConditionEvaluator.new()
	var exec := EffectExecutor.new()
	var events := EventMachine.new(db, cond, exec)
	var travel := Travel.new(db, exec)
	var rng := Rng.new("journey-test")

	var clock := WorldClock.new(GameDate.from_gregorian(1292, 4, 11).jdn)
	_ok(clock.year() == 1292, "clock starts in 1292")
	_ok(clock.in_window(), "1292 is inside the 1253-1453 window")

	var st := WorldState.new()
	st.seed = "journey-test"
	st.city = "lop"
	st.coins = 500000
	st.jdn = clock.date.jdn

	# ---------------------------------------------------- arrive at Lop
	var ctx := {"jdn": st.jdn, "month": clock.month(), "year": clock.year(), "band": "central_asia"}
	var entry := events.pick("entry", st, rng, ctx)
	_ok(entry.get("id", "") == "ev-lop-entry", "Lop entry event fires on arrival")

	var states := events.choice_states(entry, st, ctx)
	_ok(states.size() >= 2, "entry event offers choices")
	_ok(states[0]["enabled"], "first choice is available")

	var r1 := events.choose(entry, 0, st, rng, ctx)
	_ok(not r1.applied.is_empty(), "choosing applies effects")
	_ok(st.once_fired.get("ev-lop-entry", false), "once-event marked as fired")
	var again := events.pick("entry", st, rng, ctx)
	_ok(again.get("id", "") != "ev-lop-entry", "a once-event does not fire twice")

	# ---------------------------------------------------- explore a site
	var site := events.pick("site", st, rng, ctx)
	_ok(site.get("id", "").begins_with("ev-lop-"), "a Lop site is offered")

	# The caravanserai is what opens the desert road (GDD §5.2: you must do at
	# least one thing in a city before you know how to leave it).
	var serai := db.get_record("ev-lop-caravanserai")
	_ok(not serai.is_empty(), "caravanserai event exists")
	var before_coins := st.coins
	var r2 := events.choose(serai, 0, st, rng, ctx)
	_ok(st.coins < before_coins, "hiring the guide costs money")
	_ok("rt-lop-sachiu" in st.unlocked_routes, "the desert road is now open")

	# ---------------------------------------------------- travel
	var routes := travel.routes_from("lop")
	_ok(routes.size() > 0, "Lop has outbound routes")
	var road: Dictionary = {}
	for r in routes:
		if r.get("id") == "rt-lop-sachiu":
			road = r
	_ok(not road.is_empty(), "the Lop->Sachiu road is in the graph")

	var avail := travel.availability(road, st, clock.month(), "caravan")
	_ok(avail["ok"], "caravan is available in month %d: %s" % [clock.month(), str(avail["reasons"])])

	var poor := WorldState.new()
	poor.seed = "poor"
	poor.city = "lop"
	poor.coins = 1
	var poor_avail := travel.availability(road, poor, clock.month(), "caravan")
	_ok(not poor_avail["ok"], "a penniless traveller cannot hire a caravan")

	var day0 := st.jdn
	var elapsed0 := st.days_elapsed
	var trip := travel.depart(road, "caravan", st, rng)
	_ok(st.city == "sachiu", "arrived at Sachiu")
	_ok(st.jdn > day0, "time advanced (%d days)" % trip["days"])
	# Compare the DELTA: resting at the caravanserai already burned a day, so
	# days_elapsed is not equal to this leg's duration.
	_ok(st.days_elapsed - elapsed0 == trip["days"], "elapsed days recorded")
	_ok(st.jdn - day0 == trip["days"], "the calendar advanced by the same amount")
	_ok(st.revealed.get("sachiu", 0) > 0, "destination revealed on the map")

	# ---------------------------------------------------- arrive at Sachiu
	clock = WorldClock.new(st.jdn)
	var ctx2 := {"jdn": st.jdn, "month": clock.month(), "year": clock.year(), "band": "china"}
	var arrive := events.pick("entry", st, rng, ctx2)
	_ok(arrive.get("id", "") == "ev-sachiu-entry", "Sachiu entry event fires")

	# ---------------------------------------------------- determinism
	_ok(_replay() == _replay(), "the whole journey replays identically")

	print("test_journey: %s  (Lop -> Sachiu in %d days, %d coins spent)"
		% ["PASS" if _f == 0 else "FAIL (%d)" % _f, trip["days"], (500000 - st.coins)])
	return _f == 0


func _replay() -> String:
	var db := ContentDb.new()
	db.load_all()
	var exec := EffectExecutor.new()
	var travel := Travel.new(db, exec)
	var rng := Rng.new("replay")
	var st := WorldState.new()
	st.seed = "replay"
	st.city = "lop"
	st.coins = 500000
	var road := db.get_record("rt-lop-sachiu")
	var trip := travel.depart(road, "caravan", st, rng)
	return "%s:%d:%d" % [st.city, st.jdn, st.coins]
