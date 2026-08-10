class_name Mortality
extends RefCounted

## A warning-first mortality model.
##
## A healthy traveller cannot be killed by one hidden roll. Exposure first
## reduces vitality and moves through visible stages. Only a traveller already
## in `dying` can die from a later exposure or from leaving that crisis
## unresolved for thirty days. This makes death consequential without turning
## a long textual run into an unseen dice trap.

const STABLE := "stable"
const STRAINED := "strained"
const GRAVE := "grave"
const DYING := "dying"
const DECEASED := "deceased"
const VALID_STAGES := [STABLE, STRAINED, GRAVE, DYING, DECEASED]
const CRISIS_GRACE_DAYS := 30


static func default_life() -> Dictionary:
	return {
		"vitality": 100,
		"stage": STABLE,
		"stage_since_jdn": -1,
		"conditions": [],
		"deceased": false,
		"cause": "",
		"death_jdn": -1,
		"legacy_prepared": false,
	}


static func age_years(state: WorldState) -> int:
	if state.birthdate_jdn < 0 or state.jdn < state.birthdate_jdn:
		return 0
	var birth := GameDate.new(state.birthdate_jdn).to_gregorian()
	var current := GameDate.new(state.jdn).to_gregorian()
	var age := int(current["year"]) - int(birth["year"])
	if int(current["month"]) < int(birth["month"]) \
			or (int(current["month"]) == int(birth["month"]) \
			and int(current["day"]) < int(birth["day"])):
		age -= 1
	return maxi(0, age)


static func stage_for(vitality: int) -> String:
	if vitality <= 10:
		return DYING
	if vitality <= 30:
		return GRAVE
	if vitality <= 60:
		return STRAINED
	return STABLE


## Risk is the public route/event risk on the existing 0..5 scale. `days` and
## age can make an arduous exposure heavier, but never bypass the warning
## stages. Returns effects only; EffectExecutor remains the sole state writer.
static func exposure_effects(state: WorldState, days: int, risk: int,
		hazards: Array, rng: Rng, reason: String) -> Array:
	var life: Dictionary = state.life
	if bool(life.get("deceased", false)):
		return []
	var current_stage := String(life.get("stage", STABLE))
	var current_vitality := int(life.get("vitality", 100))
	var age := age_years(state)
	var stage_since := int(life.get("stage_since_jdn", state.jdn))

	# A known terminal crisis can end the life; a stable/grave traveller always
	# receives another decision point first.
	if current_stage == DYING:
		var overdue := stage_since >= 0 and state.jdn - stage_since >= CRISIS_GRACE_DAYS
		var lethal_roll := rng.fork("lethal:%s:%d" % [reason, state.jdn]).next()
		var lethal_chance := clampf(0.12 + float(clampi(risk, 0, 5)) * 0.09, 0.0, 0.70)
		if overdue or (risk >= 2 and lethal_roll < lethal_chance):
			return [{
				"op": "death",
				"value": _cause(hazards, reason),
				"reason": "unresolved-crisis:%s" % reason,
			}]

	var burden := maxi(0, int(days / 7.0))
	if age >= 55:
		burden += 1 + int((age - 55) / 10.0)
	var loss := clampi(risk * 3 + burden - int(state.fate.get("travel", 15) / 10.0), 0, 24)
	var incident_chance := clampf(float(risk) * 0.10 + float(maxi(0, days - 14)) * 0.005,
		0.0, 0.65)
	var incident := rng.fork("incident:%s:%d" % [reason, state.jdn]).next() < incident_chance
	if incident:
		loss += 5 + rng.fork("harm:%s:%d" % [reason, state.jdn]).next_int(8)
	if loss <= 0:
		return []

	var predicted := maxi(1, current_vitality - loss)
	var next_stage := stage_for(predicted)
	var effects: Array = [{
		"op": "vitality", "value": predicted - current_vitality,
		"reason": "exposure:%s" % reason,
	}]
	if incident:
		effects.append({
			"op": "condition_add",
			"value": {
				"id": _condition_id(hazards),
				"severity": clampi(risk, 1, 5),
				"onset_jdn": state.jdn,
				"source": reason,
			},
			"reason": "incident:%s" % reason,
		})
	if next_stage != current_stage:
		effects.append({
			"op": "life_stage", "value": next_stage,
			"reason": "vitality-threshold:%s" % reason,
		})
	return effects


static func treatment_effects(state: WorldState, amount: int,
		condition_id: String = "", reason: String = "treatment") -> Array:
	if bool(state.life.get("deceased", false)):
		return []
	var before := int(state.life.get("vitality", 100))
	var after := clampi(before + maxi(0, amount), 0, 100)
	var effects: Array = []
	if after != before:
		effects.append({"op": "vitality", "value": after - before, "reason": reason})
	if not condition_id.is_empty():
		effects.append({"op": "condition_remove", "value": condition_id, "reason": reason})
	var next_stage := stage_for(after)
	if next_stage != String(state.life.get("stage", STABLE)):
		effects.append({"op": "life_stage", "value": next_stage, "reason": reason})
	return effects


static func heirloom_options(state: WorldState) -> Array[String]:
	var out: Array[String] = []
	for item in state.items:
		if String(item) not in out:
			out.append(String(item))
	return out


static func _condition_id(hazards: Array) -> String:
	if hazards.is_empty():
		return "condition-exhaustion"
	return "condition-%s" % String(hazards[0]).to_lower().replace("_", "-")


static func _cause(hazards: Array, fallback: String) -> String:
	return _condition_id(hazards) if not hazards.is_empty() else fallback
