class_name AudioMood
extends RefCounted

## Derive mood from existing kernel data — never a hand-authored event field
## (AUDIO_PLAN.md §5). Presentation-only; does not write WorldState.

const WONDER := "wonder"
const TENSION := "tension"
const LOSS := "loss"
const RELIEF := "relief"
const REVERENCE := "reverence"
const NEUTRAL := "neutral"


## `res` may be EffectExecutor.EffectResult or null.
## `route` / `city` are content dictionaries (may be empty).
## `scene_class` is one of SceneDensity class ids.
static func derive(
	res: Variant,
	route: Dictionary,
	city: Dictionary,
	scene_class: String = "",
	prev_route_risk: int = 0,
) -> String:
	if scene_class == "shrine":
		return REVERENCE

	if res != null:
		if not res.rejected.is_empty():
			return LOSS
		for e in res.applied:
			var op := String(e.get("op", ""))
			if op in ["codex", "sticker"]:
				return WONDER
			if op == "faith":
				return REVERENCE
			if op == "coins":
				var delta := int(e.get("value", 0))
				# Loss of more than a third of holdings is checked by caller via coins_before.
				pass

	var risk := int(route.get("risk", 0))
	if risk >= 4:
		return TENSION
	var hazards: Array = route.get("hazards", [])
	for h in hazards:
		if String(h) in ["bandits", "pirates", "storm"]:
			return TENSION

	if String(city.get("tier", "")) == "metropolis":
		return WONDER

	# Arrived at a city after a hard road.
	if prev_route_risk >= 4 and String(city.get("tier", "")) in ["city", "metropolis"]:
		return RELIEF

	return NEUTRAL


## Extra check when we know coins before/after a result.
static func derive_with_coins(
	res: Variant,
	route: Dictionary,
	city: Dictionary,
	scene_class: String,
	prev_route_risk: int,
	coins_before: int,
) -> String:
	if res != null and coins_before > 0:
		var spent := 0
		for e in res.applied:
			if String(e.get("op", "")) == "coins":
				var d := int(e.get("value", 0))
				if d < 0:
					spent += -d
		if spent > coins_before / 3:
			return LOSS
	return derive(res, route, city, scene_class, prev_route_risk)


## Bus / layer modulation targets for a mood (AUDIO_PLAN.md §5).
static func params(mood: String) -> Dictionary:
	match mood:
		WONDER:
			return {"cutoff": 12000.0, "music_db": 1.0, "pitch": 1.0,
				"drone": 1.0, "pulse": 1.0, "melody": 1.0, "color": 1.0}
		TENSION:
			return {"cutoff": 900.0, "music_db": 0.0, "pitch": 1.0,
				"drone": 1.15, "pulse": 1.1, "melody": 0.0, "color": 0.0}
		LOSS:
			return {"cutoff": 700.0, "music_db": -4.0, "pitch": 0.92,
				"drone": 0.85, "pulse": 0.0, "melody": 0.35, "color": 0.0}
		RELIEF:
			return {"cutoff": 10000.0, "music_db": 1.5, "pitch": 1.0,
				"drone": 1.0, "pulse": 1.0, "melody": 1.0, "color": 0.6}
		REVERENCE:
			return {"cutoff": 6000.0, "music_db": -3.0, "pitch": 0.98,
				"drone": 0.7, "pulse": 0.0, "melody": 0.0, "color": 0.25}
		_:
			return {"cutoff": 8000.0, "music_db": 0.0, "pitch": 1.0,
				"drone": 1.0, "pulse": 1.0, "melody": 1.0, "color": 0.0}
