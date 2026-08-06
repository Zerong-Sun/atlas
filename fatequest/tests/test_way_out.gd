extends RefCounted

## "到达任意城市，至少直接获得一条前往其它城市的道路，防止被困在某一城市里".
##
## Acceptance gate for the stranding guard (travel.ensure_way_out): every city
## in the world must be able to reveal a workable exit when none is known, and
## every archetype's fresh run must open with at least one known road out of
## its start city. Roads that are season-blocked on purpose (the Levant winter
## window) are respected as design, not treated as bugs — but wherever a road
## is passable this month, the guard must hand the player one of those.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var exec := EffectExecutor.new()
	var travel := Travel.new(db, exec)
	var clock := WorldClock.new(GameDate.from_gregorian(1292, 4, 11).jdn)
	var month := clock.month()

	# ------------------------------------------- every city can leave in April
	for c in db.get_table("cities"):
		var cid := String(c.get("id", ""))
		var st := WorldState.new()
		st.seed = "wayout:%s" % cid
		st.city = cid
		st.jdn = clock.date.jdn
		var rid := travel.ensure_way_out(st, month)
		_ok(not rid.is_empty(), "%s: safety net reveals an exit (got %s)" % [cid, rid])
		if rid.is_empty():
			continue
		var picked := db.get_record(rid)
		_ok(not picked.is_empty(), "%s: revealed exit %s resolves" % [cid, rid])
		if picked.is_empty():
			continue
		_ok(travel.is_route_known(picked, st), "%s: revealed exit %s is known now" % [cid, rid])
		_ok(travel._passable(picked, st, month),
			"%s: revealed exit %s is passable this month (not just known)" % [cid, rid])
		var again := travel.ensure_way_out(st, month)
		_ok(again.is_empty(), "%s: guard is a no-op once a way out exists" % cid)

	# ------------------------------------------- winter: season waits are design
	# The Levant coast closes most roads Jan-Mar by design. Where a sea lane
	# stays open (tarsus/tripolis share a year-round ship run) the guard must
	# hand that one over — it is passable today. Where every road is shut
	# (antiochia/damascus/tyrus) it hands out a known road instead, direction
	# on the map, the wait explicit.
	var winter_jdn := GameDate.from_gregorian(1293, 1, 15).jdn
	var winter := WorldClock.new(winter_jdn).month()
	for cid in ["antiochia", "damascus", "tarsus", "tripolis", "tyrus"]:
		var st := WorldState.new()
		st.seed = "wayout:winter:%s" % cid
		st.city = cid
		st.jdn = winter_jdn
		var rid := travel.ensure_way_out(st, winter)
		_ok(not rid.is_empty(), "%s (winter): guard still reveals an exit (got %s)" % [cid, rid])
		if rid.is_empty():
			continue
		var picked := db.get_record(rid)
		_ok(travel.is_route_known(picked, st),
			"%s (winter): revealed exit %s is at least known" % [cid, rid])
		var any_passable := false
		for r in travel.routes_from(cid):
			if travel._passable(r, st, winter):
				any_passable = true
				break
		if any_passable:
			_ok(travel._passable(picked, st, winter),
				"%s (winter): a route stays open, guard reveals a passable one (got %s)"
				% [cid, rid])
		else:
			_ok(not travel._passable(picked, st, winter),
				"%s (winter): every road blocked, guard reveals a known direction" % cid)

	# ---------------------------- passable wins over a blocked season window
	# Inject two roads into a brand-new city: one open in the current month,
	# one shut. With both previously unknown, the guard must reveal the one
	# that can be walked today, not the one with the friendlier season table.
	db.get_table("routes").append({
		"id": "rt-wayout-open", "from": "waytest-city", "to": "waytest-dest",
		"kind": "land", "modes": ["foot"], "days": 1, "cost": 1, "risk": 0,
		"season": {"open": [4, 5, 6, 7, 8, 9, 10]},
	})
	db.get_table("routes").append({
		"id": "rt-wayout-shut", "from": "waytest-city", "to": "waytest-dest2",
		"kind": "land", "modes": ["foot"], "days": 1, "cost": 1, "risk": 0,
		"season": {"open": [1, 2, 3, 11, 12]},
	})
	var prio := WorldState.new()
	prio.seed = "wayout:prio"
	prio.city = "waytest-city"
	prio.coins = 500000
	prio.jdn = GameDate.from_gregorian(1292, 4, 11).jdn
	var picked_id := travel.ensure_way_out(prio, 4)
	_ok(picked_id == "rt-wayout-open",
		"injected passable road is preferred over a season-blocked one (got %s)" % picked_id)
	var before := prio.revealed.duplicate()
	var noop := travel.ensure_way_out(prio, 4)
	_ok(noop.is_empty() and prio.revealed == before,
		"guard with a known way out changes nothing on the map")

	# -------------------------------------------- fresh runs are never stranded
	for a in db.get_table("archetypes"):
		var start := String(a.get("start", ""))
		var st := WorldState.new()
		st.seed = "wayout:%s" % a.get("id", "?")
		st.city = start
		st.jdn = clock.date.jdn
		# Mirror _begin_new's opening knowledge before the guard runs.
		var effects: Array = [
			{"op": "reveal_city", "value": st.city, "level": 3, "reason": "t"},
		]
		for kc in a.get("knownCities", []):
			effects.append({"op": "reveal_city", "value": String(kc), "level": 1, "reason": "t"})
		for kr in a.get("knownRoutes", []):
			effects.append({"op": "reveal_route", "value": String(kr), "level": 1, "reason": "t"})
		exec.execute(st, effects, {})
		travel.ensure_way_out(st, month)
		var out := false
		for r in travel.routes_from(start):
			if travel.is_route_known(r, st):
				out = true
				break
		_ok(out, "archetype %s starts in %s with a known way out"
			% [a.get("id", "?"), start])

	print("WAY_OUT: ", "PASS" if _f == 0 else "FAIL (%d)" % _f)
	return _f == 0
