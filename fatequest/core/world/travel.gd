class_name Travel
extends RefCounted

## Resolves moving along a route: cost, time, hazards, arrival.

var db: ContentDb
var executor: EffectExecutor


func _init(p_db: ContentDb, p_exec: EffectExecutor) -> void:
	db = p_db
	executor = p_exec


func routes_from(city_id: String) -> Array:
	var out: Array = []
	for r in db.get_table("routes"):
		if r.get("from") == city_id or (r.get("reverse", false) and r.get("to") == city_id):
			out.append(r)
	return out


func other_end(route: Dictionary, city_id: String) -> String:
	return route.get("to") if route.get("from") == city_id else route.get("from")


## Can this route be taken right now, and if not, why not? Returns
## {ok: bool, reasons: Array[String]} — the reasons feed the UI directly rather
## than the player being told a flat "no".
func availability(route: Dictionary, state: WorldState, month: int, mode: String) -> Dictionary:
	var reasons: Array[String] = []
	var open: Array = route.get("season", {}).get("open", [])
	if not open.is_empty() and month not in open:
		reasons.append("travel.closed_season")
	if mode != "" and mode not in route.get("modes", []):
		reasons.append("travel.mode_unavailable")
	var t := db.get_record(mode)
	var cost := total_cost(route, mode)
	if state.coins < cost:
		reasons.append("travel.cannot_afford:%d" % cost)
	for n in t.get("needs", []):
		if String(n) not in state.items:
			reasons.append("travel.needs_item:%s" % n)
	return {"ok": reasons.is_empty(), "reasons": reasons}


func total_days(route: Dictionary, mode: String) -> int:
	var t := db.get_record(mode)
	var mul := float(t.get("dayMul", 1.0))
	return maxi(1, int(round(float(route.get("days", 1)) * mul)))


func total_cost(route: Dictionary, mode: String) -> int:
	var t := db.get_record(mode)
	# Route cost scales with distance; the mode adds its own hire price.
	return int(route.get("cost", 0)) + int(t.get("cost", 0))


func total_risk(route: Dictionary, mode: String) -> int:
	var t := db.get_record(mode)
	return clampi(int(route.get("risk", 0)) + int(t.get("risk", 0)), 0, 5)


## Executes the journey. Returns the EffectResult plus what happened on the way.
func depart(route: Dictionary, mode: String, state: WorldState, rng: Rng) -> Dictionary:
	var dest := other_end(route, state.city)
	var days := total_days(route, mode)
	var cost := total_cost(route, mode)

	var effects: Array = [
		{"op": "coins", "value": -cost, "reason": "fare-%s" % mode},
		{"op": "days", "value": days, "reason": "travel-%s" % route.get("id", "?")},
		{"op": "goto", "value": dest, "reason": "arrived-at-%s" % dest},
		{"op": "reveal_map", "value": dest, "reason": "walked-the-road"},
		{"op": "reveal_map", "value": route.get("id", ""), "reason": "walked-the-road"},
		{"op": "leg", "id": route.get("id", ""), "value": int(route.get("distanceKm", 0)),
			"days": days, "reason": "walked-the-road"},
	]
	var res := executor.execute(state, effects, {"rng": rng, "event_id": "travel:" + String(route.get("id", ""))})
	return {
		"result": res,
		"destination": dest,
		"days": days,
		"cost": cost,
		"risk": total_risk(route, mode),
		"hazards": route.get("hazards", []),
	}
