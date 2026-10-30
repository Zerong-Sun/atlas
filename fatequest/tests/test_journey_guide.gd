extends RefCounted
const Guide = preload("res://core/world/journey_guide.gd")

var failures := 0

func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var conditions := ConditionEvaluator.new(db)
	var travel := Travel.new(db, EffectExecutor.new(), conditions)
	var state := WorldState.new()
	state.city = "tauris"
	state.jdn = GameDate.from_gregorian(1292, 5, 1).jdn
	state.coins = 10000
	state.visited.append("tauris")
	state.revealed["rt-tauris-baldacum"] = 1
	var city := db.get_record(state.city)
	var ctx := {"jdn": state.jdn, "month": 5, "year": 1292,
		"band": city.get("band", "")}
	var first: Dictionary = Guide.next_step(state, city, db, conditions,
		travel, ctx, 5)
	_check(first.get("kind") == "explore" and first.get("site") == "ev-tauris-a",
		"fresh city offers a real local encounter")

	state.once_fired["ev-tauris-a"] = true
	var onward: Dictionary = Guide.next_step(state, city, db, conditions,
		travel, ctx, 5)
	_check(onward.get("kind") == "depart" and onward.get("destination") == "baldacum",
		"after a local encounter, a reachable new city is suggested")

	state.coins = 0
	var short: Dictionary = Guide.next_step(state, city, db, conditions,
		travel, ctx, 5)
	_check(short.get("kind") == "prepare" and short.get("destination") == "baldacum",
		"unaffordable road never appears as ready to take")

	state.city = "ormus"
	state.character["archetype_id"] = "merchant"
	state.visited.append("ormus")
	state.once_fired["ev-ormus-a"] = true
	state.revealed["rt-ormus-calatu"] = 1
	state.revealed["rt-ormus-kerman"] = 1
	state.coins = 100000
	var ormus := db.get_record(state.city)
	var sea_ctx := {"jdn": state.jdn, "month": 1, "year": 1292,
		"band": ormus.get("band", "")}
	var distances: Dictionary = Guide._goal_distances(db, state)
	_check(int(distances.get("calatu", 9999)) < int(distances.get("kerman", 9999)),
		"merchant goal graph favors the coast over a detour")
	var goal_step: Dictionary = Guide.next_step(state, ormus, db, conditions,
		travel, sea_ctx, 1)
	_check(goal_step.get("kind") == "depart" and goal_step.get("destination") == "calatu",
		"short-term route follows the character's long-term destination")
	sea_ctx["month"] = 5
	var seasonal_step: Dictionary = Guide.next_step(state, ormus, db, conditions,
		travel, sea_ctx, 5)
	_check(seasonal_step.get("kind") == "prepare"
		and seasonal_step.get("destination") == "calatu",
		"closed goal route does not recommend a longer detour")

	state.city = "kerman"
	state.visited.append("kerman")
	state.once_fired["ev-kerman-a"] = true
	var kerman := db.get_record(state.city)
	var return_ctx := {"jdn": state.jdn, "month": 5, "year": 1292,
		"band": kerman.get("band", "")}
	var return_step: Dictionary = Guide.next_step(state, kerman, db, conditions,
		travel, return_ctx, 5)
	_check(return_step.get("kind") == "depart"
		and return_step.get("destination") == "ormus",
		"a useful return road remains a valid step toward the goal")

	print("JOURNEY_GUIDE: %d failure(s)" % failures)
	return failures == 0


func _check(ok: bool, message: String) -> void:
	if not ok:
		failures += 1
		push_error("JOURNEY_GUIDE: " + message)
