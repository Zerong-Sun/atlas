class_name Travel
extends RefCounted

## Resolves moving along a route: cost, time, hazards, arrival.

var db: ContentDb
var executor: EffectExecutor
var conditions: ConditionEvaluator


func _init(p_db: ContentDb, p_exec: EffectExecutor,
		p_conditions: ConditionEvaluator = null) -> void:
	db = p_db
	executor = p_exec
	conditions = p_conditions if p_conditions != null else ConditionEvaluator.new(db)


func routes_from(city_id: String) -> Array:
	var out: Array = []
	for r in db.get_table("routes"):
		if r.get("from") == city_id or (r.get("reverse", false) and r.get("to") == city_id):
			out.append(r)
	return out


func other_end(route: Dictionary, city_id: String) -> String:
	if route.get("from") == city_id:
		return String(route.get("to", ""))
	if route.get("reverse", false) and route.get("to") == city_id:
		return String(route.get("from", ""))
	return ""


func is_route_known(route: Dictionary, state: WorldState) -> bool:
	var rid := String(route.get("id", ""))
	return rid in state.unlocked_routes or int(state.revealed.get(rid, 0)) > 0


## Can this route be taken right now, and if not, why not? Returns
## {ok: bool, reasons: Array[String]} — the reasons feed the UI directly rather
## than the player being told a flat "no".
func availability(route: Dictionary, state: WorldState, month: int, mode: String) -> Dictionary:
	var reasons: Array[String] = []
	var rid := String(route.get("id", ""))
	if bool(state.life.get("deceased", false)):
		reasons.append("travel.deceased")
	if not state.active_journey.is_empty():
		reasons.append("travel.journey_active")
	var dest := other_end(route, state.city)
	if dest.is_empty():
		reasons.append("travel.wrong_direction")
	if not is_route_known(route, state):
		reasons.append("travel.unknown_route")
	var open: Array = route.get("season", {}).get("open", [])
	if not open.is_empty() and month not in open:
		reasons.append("travel.closed_season")
	if mode != "" and mode not in route.get("modes", []):
		reasons.append("travel.mode_unavailable")
	var t := db.get_record(mode)
	if mode.is_empty() or t.is_empty():
		reasons.append("travel.unknown_mode")
	else:
		var kinds: Array = t.get("kinds", [])
		var route_kind := String(route.get("kind", "land"))
		var compatible := route_kind in kinds \
			or (route_kind == "coastal" and ("sea" in kinds or "land" in kinds))
		if not compatible:
			reasons.append("travel.mode_wrong_kind")
	var cost := total_cost(route, mode)
	if state.coins < cost:
		reasons.append("travel.cannot_afford:%d" % cost)
	for n in t.get("needs", []):
		if String(n) not in state.items:
			reasons.append("travel.needs_item:%s" % n)
	var unlock = route.get("unlock", null)
	if unlock != null and rid not in state.unlocked_routes:
		var city := db.get_record(state.city)
		var ctx := {
			"month": month,
			"year": WorldClock.new(state.jdn).year(),
			"band": city.get("band", ""),
		}
		if not conditions.evaluate(unlock, state, ctx):
			reasons.append("travel.route_locked")
			for why in conditions.explain(unlock, state, ctx):
				reasons.append(String(why))
	var used := cargo_used(state)
	var capacity := cargo_capacity(state, t, route)
	if used > capacity:
		reasons.append("travel.cargo_over:%d" % (used - capacity))
	return {
		"ok": reasons.is_empty(),
		"reasons": reasons,
		"destination": dest,
		"cost": cost,
		"days": total_days(route, mode),
		"risk": total_risk(route, mode),
		"cargo_used": used,
		"cargo_capacity": capacity,
	}


func total_days(route: Dictionary, mode: String) -> int:
	var t := db.get_record(mode)
	var mul := float(t.get("dayMul", 1.0))
	return maxi(1, int(round(float(route.get("days", 1)) * mul)))


func total_cost(route: Dictionary, mode: String) -> int:
	var t := db.get_record(mode)
	# Route cost scales with distance; the mode adds its own hire price.
	return maxi(0, int(route.get("cost", 0)) + int(t.get("cost", 0)))


func total_risk(route: Dictionary, mode: String) -> int:
	var t := db.get_record(mode)
	return clampi(int(route.get("risk", 0)) + int(t.get("risk", 0)), 0, 5)


func cargo_used(state: WorldState) -> int:
	var total := 0
	for gid in state.goods:
		var good := db.get_record(String(gid))
		total += int(state.goods.get(gid, 0)) * maxi(1, int(good.get("bulk", 1)))
	return total


func cargo_capacity(state: WorldState, transport: Dictionary, route: Dictionary) -> int:
	var capacity := maxi(state.cargo_slots, int(transport.get("cargo", 0)))
	var route_kind := String(route.get("kind", "land"))
	var kinds: Array = transport.get("kinds", [])
	var movement_kind := route_kind
	if route_kind == "coastal":
		if "sea" in kinds:
			movement_kind = "sea"
		elif "land" in kinds:
			movement_kind = "land"
	for member in state.retainers:
		if not bool(member.get("present", true)):
			continue
		var rec := db.get_record(String(member.get("id", "")))
		var cargo: Dictionary = rec.get("cargo", {})
		var condition := String(cargo.get("condition", "always"))
		if condition == "land_only" and movement_kind != "land":
			continue
		if condition == "sea_only" and movement_kind != "sea":
			continue
		capacity += int(cargo.get("slots", 0))
	return capacity


func encounter_ids(route: Dictionary, state: WorldState, mode: String,
		rng: Rng, departure_jdn: int) -> Array[String]:
	var risk := total_risk(route, mode)
	var count := 0
	var count_rng := rng.fork("travel:%s:%d:count" % [route.get("id", "?"), departure_jdn])
	if risk > 0 and count_rng.next() < float(risk) / 5.0:
		count = 1
	if risk >= 4 and count_rng.next() < float(risk - 3) / 3.0:
		count = 2
	if count == 0:
		return []

	var pool: Array = []
	var city := db.get_record(state.city)
	var clock := WorldClock.new(departure_jdn)
	var ctx := {
		"jdn": departure_jdn,
		"month": clock.month(),
		"year": clock.year(),
		"band": city.get("band", ""),
		"route": route.get("id", ""),
		"hazards": route.get("hazards", []),
	}
	var explicit: Array = route.get("encounters", [])
	if not explicit.is_empty():
		for event_id in explicit:
			var event := db.get_record(String(event_id))
			if not event.is_empty() \
					and not (event.get("once", false) \
						and state.once_fired.get(event.get("id", ""), false)) \
					and conditions.evaluate(event.get("when", {}), state, ctx):
				pool.append(event)
	else:
		for event in db.get_table("events"):
			if event.get("kind", "") != "road":
				continue
			if event.get("once", false) and state.once_fired.get(event.get("id", ""), false):
				continue
			if conditions.evaluate(event.get("when", {}), state, ctx):
				pool.append(event)
	if pool.is_empty():
		return []
	pool.sort_custom(func(a, b): return String(a.get("id", "")) < String(b.get("id", "")))
	pool = rng.fork("travel:%s:%d:events" % [route.get("id", "?"), departure_jdn]).shuffle(pool)
	var out: Array[String] = []
	for i in mini(count, pool.size()):
		out.append(String(pool[i].get("id", "")))
	return out


## Executes the journey. Returns the EffectResult plus what happened on the way.
func depart(route: Dictionary, mode: String, state: WorldState, rng: Rng) -> Dictionary:
	var month := WorldClock.new(state.jdn).month()
	var available := availability(route, state, month, mode)
	if not available.get("ok", false):
		return {
			"ok": false,
			"reasons": available.get("reasons", []),
			"result": EffectExecutor.EffectResult.new(),
		}
	var dest := other_end(route, state.city)
	var days := total_days(route, mode)
	var cost := total_cost(route, mode)
	var departure_jdn := state.jdn
	var encounters := encounter_ids(route, state, mode, rng, departure_jdn)
	var journey := {
		"route": String(route.get("id", "")),
		"mode": mode,
		"origin": state.city,
		"destination": dest,
		"departure_jdn": departure_jdn,
		"days": days,
		"cost": cost,
		"risk": total_risk(route, mode),
		"encounters": Array(encounters),
		"phase": "encounters" if not encounters.is_empty() else "arrival",
	}

	var effects: Array = [
		{"op": "journey", "value": journey, "reason": "journey-checkpoint"},
		{"op": "coins", "value": -cost, "reason": "fare-%s" % mode},
		{"op": "days", "value": days, "reason": "travel-%s" % route.get("id", "?")},
		{"op": "goto", "value": dest, "reason": "arrived-at-%s" % dest},
		{"op": "reveal_map", "value": dest, "reason": "walked-the-road"},
		{"op": "reveal_map", "value": route.get("id", ""), "reason": "walked-the-road"},
		{"op": "leg", "id": route.get("id", ""), "value": int(route.get("distanceKm", 0)),
			"days": days, "reason": "walked-the-road"},
	]
	# The town you arrive in is the town you can leave. Revealing only the road
	# you walked made every new place a dead end — you could go back the way you
	# came and nowhere else. Knowing a place means knowing which roads lead out
	# of it; the far towns stay fogged until you walk or hear of them.
	for out_route in routes_from(dest):
		var out_id := String(out_route.get("id", ""))
		if out_id != "" and out_id != String(route.get("id", "")):
			effects.append({"op": "reveal_map", "value": out_id, "reason": "arrived-sees-the-roads"})
	for encounter_id in encounters:
		effects.append({
			"op": "queue_event", "value": encounter_id,
			"reason": "encountered-on-%s" % route.get("id", "?"),
		})
	var res := executor.execute(state, effects, {"rng": rng, "event_id": "travel:" + String(route.get("id", ""))})
	return {
		"ok": true,
		"result": res,
		"destination": dest,
		"days": days,
		"cost": cost,
		"risk": total_risk(route, mode),
		"hazards": route.get("hazards", []),
		"encounters": encounters,
	}


## Guarantee the city the player is standing in has at least one known way out.
##
## Arrival normally reveals every outbound road (see depart, "arrived-sees-the-
## roads"), so this only fires when nothing at all is known — most notably a
## fresh run starting in a city the character has no road knowledge of. Without
## it the roads panel would report "no routes" and the run would stall before
## it began.
##
## When any exit is already passable this month (known, open, transport kind and
## permission all in order, money aside) it reveals one of those, so the road
## the player is handed can actually be walked. Only when every exit is blocked
## — e.g. mid-winter on the Levant coast, a deliberate `season.open` window —
## does it fall back to revealing whichever road looks least gated, so the way
## out is at least on the map and the wait is explicit. Returns the revealed
## route id, or "" when there was already a way out (or no route exists).
func ensure_way_out(state: WorldState, month: int) -> String:
	var exits := routes_from(state.city)
	for r in exits:
		if is_route_known(r, state):
			return ""
	# Money is a soft wall — you can earn, sell or wait — so affordability is
	# deliberately ignored. Every hard gate (season, transport kind, permit,
	# required item) counts as blocking.
	var passable: Array = []
	for r in exits:
		if _passable(r, state, month):
			passable.append(r)
	var pool: Array = passable if not passable.is_empty() else exits
	var best: Dictionary = {}
	var best_score := -1
	for r in pool:
		# Within a passable pool every road can be taken today, so the scores
		# only pick the friendliest one. In the blocked fallback pool they pick
		# the one least likely to stay shut.
		var score := 0
		if r.get("unlock", null) == null:
			score += 4
		var open: Array = r.get("season", {}).get("open", [])
		if open.is_empty():
			score += 3
		elif month in open:
			score += 2
		var kind := String(r.get("kind", "land"))
		if kind == "land" or kind == "coastal":
			score += 1
		if score > best_score:
			best_score = score
			best = r
	if best.is_empty():
		return ""
	var rid := String(best.get("id", ""))
	executor.execute(state, [{
		"op": "reveal_map",
		"value": rid,
		"reason": "safety-net-exit",
	}], {"event_id": "travel:ensure-way-out"})
	return rid


## Can this road be taken right now, price and knowledge aside? Mirrors the hard
## gates in availability(): direction, season window, transport mode and any
## unlock/permission. `cannot_afford`, `cargo_over` and `unknown_route` are
## ignored — the guard is about to reveal the road, and money is earnable.
func _passable(route: Dictionary, state: WorldState, month: int) -> bool:
	for mode in route.get("modes", ["foot"]):
		var ok := true
		for reason in availability(route, state, month, String(mode)).get("reasons", []):
			var key := String(reason)
			if key == "travel.unknown_route" or key == "travel.closed_season" \
					or key == "travel.route_locked" or key == "travel.mode_unavailable" \
					or key == "travel.mode_wrong_kind" or key.begins_with("travel.needs_item:"):
				ok = false
				break
		if ok:
			return true
	return false
