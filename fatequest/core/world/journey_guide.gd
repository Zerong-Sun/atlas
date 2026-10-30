class_name JourneyGuide
extends RefCounted

## A small, optional objective derived from the world the player has already
## changed. It needs no separate quest state, so loading a save cannot leave a
## stale instruction on screen.
static func next_step(state: WorldState, city: Dictionary, db: ContentDb,
		conditions: ConditionEvaluator, travel: Travel, ctx: Dictionary,
		month: int) -> Dictionary:
	var sites: Array = (city.get("sites", []) as Array).duplicate()
	if city.has("mentorEvent"):
		sites.append(city["mentorEvent"])
	var explored_here := false
	var first_site := ""
	for site_id in sites:
		var event := db.get_record(String(site_id))
		if event.is_empty():
			continue
		var id := String(event.get("id", ""))
		if bool(state.once_fired.get(id, false)):
			explored_here = true
		elif first_site.is_empty() and conditions.evaluate(event.get("when", {}), state, ctx):
			first_site = id
	if not explored_here and not first_site.is_empty():
		return {"kind": "explore", "site": first_site}

	var goal_distances := _goal_distances(db, state)
	var current_distance := int(goal_distances.get(state.city, 9999))
	var best_ready := ""
	var best_ready_score := 1000000
	var best_prepare := ""
	var best_prepare_score := 1000000
	for route in travel.routes_from(state.city):
		if not travel.is_route_known(route, state):
			continue
		var dest := travel.other_end(route, state.city)
		if dest.is_empty():
			continue
		var visited := dest in state.visited
		var distance := int(goal_distances.get(dest, 9999))
		# A return trip is useful when it moves the traveler toward their goal.
		# Otherwise prefer a fresh place over retracing the same road.
		if visited and (distance >= current_distance or distance == 9999):
			continue
		var score := distance * 2 + (1 if visited else 0)
		if score < best_prepare_score:
			best_prepare_score = score
			best_prepare = dest
		for mode in route.get("modes", []):
			if travel.availability(route, state, month, String(mode)).get("ok", false):
				if score < best_ready_score:
					best_ready_score = score
					best_ready = dest
				break
	if not best_ready.is_empty():
		if current_distance < 9999 and best_ready_score >= current_distance * 2 \
				and best_prepare_score < current_distance * 2:
			return {"kind": "prepare", "destination": best_prepare}
		return {"kind": "depart", "destination": best_ready}
	if not best_prepare.is_empty():
		return {"kind": "prepare", "destination": best_prepare}
	return {"kind": "explore_more"}


static func _goal_distances(db: ContentDb, state: WorldState) -> Dictionary:
	var archetype := db.get_record(String(state.character.get("archetype_id", "")))
	var goal: Dictionary = archetype.get("goal", {})
	var target := String(goal.get("target", ""))
	if target.is_empty() or (String(goal.get("type", "")) == "reach"
			and target in state.visited):
		return {}
	var predecessors := {}
	for route in db.get_table("routes"):
		var origin := String(route.get("from", ""))
		var dest := String(route.get("to", ""))
		if not predecessors.has(dest):
			predecessors[dest] = []
		(predecessors[dest] as Array).append(origin)
		if bool(route.get("reverse", false)):
			if not predecessors.has(origin):
				predecessors[origin] = []
			(predecessors[origin] as Array).append(dest)
	var distances := {target: 0}
	var pending: Array[String] = [target]
	var index := 0
	while index < pending.size():
		var city := pending[index]
		index += 1
		for previous in predecessors.get(city, []):
			var previous_id := String(previous)
			if distances.has(previous_id):
				continue
			distances[previous_id] = int(distances[city]) + 1
			pending.append(previous_id)
	return distances
