class_name SceneDensity
extends RefCounted

## Map event scene.bg → one of six scene classes (AUDIO_PLAN.md §4).
## Scene changes density / reverb feel / which stem layers & ambients play —
## never the cultural mode.

const TOWN := "town"
const PORT := "port"
const WILD := "wild"
const COURT := "court"
const SHRINE := "shrine"
const INN := "inn"
## Between cities: open road. Uses the departure culture's stems with a
## journey pulse and the road ambients (wind, camel bells, hooves).
const JOURNEY := "journey"

const _BG_TO_CLASS := {
	"caravan-city": TOWN,
	"canal-city": TOWN,
	"desert-town": TOWN,
	"oasis-town": TOWN,
	"monsoon-port": PORT,
	"spice-harbour": PORT,
	"scene-quanzhou-harbor": PORT,
	"desert-night": WILD,
	"steppe-camp": WILD,
	"palace-gate": COURT,
	"temple-interior": SHRINE,
	"cave-shrine": SHRINE,
	"caravanserai": INN,
	"desert-market": INN,
}


static func classify(scene_bg: String) -> String:
	return String(_BG_TO_CLASS.get(scene_bg, TOWN))


## Per-layer base gains before mood modulation. Keep a quiet melodic thread
## everywhere so exploration does not collapse into continuous drone.
static func layer_gains(scene_class: String) -> Dictionary:
	match scene_class:
		TOWN:
			return {"drone": 1.0, "pulse": 0.7, "melody": 1.0, "color": 0.2}
		PORT:
			return {"drone": 1.0, "pulse": 0.6, "melody": 1.0, "color": 0.2}
		WILD:
			return {"drone": 0.8, "pulse": 0.0, "melody": 0.6, "color": 0.2}
		COURT:
			return {"drone": 1.0, "pulse": 0.45, "melody": 0.75, "color": 0.15}
		SHRINE:
			# Sparse, quiet notes preserve contemplation without a wall of hum.
			return {"drone": 0.75, "pulse": 0.0, "melody": 0.45, "color": 0.25}
		INN:
			return {"drone": 1.0, "pulse": 0.4, "melody": 0.55, "color": 0.2}
		JOURNEY:
			# A caravan keeps its rhythm: pulse leads, melody thins so the road
			# ambients (wind, bells, hooves) can carry the scene.
			return {"drone": 1.0, "pulse": 0.95, "melody": 0.55, "color": 0.2}
		_:
			return {"drone": 1.0, "pulse": 0.6, "melody": 0.7, "color": 0.2}


## Ambient stem filenames under assets/audio/ambient/ (no extension).
## Keep ≤4 names — AudioDirector allocates 4 ambient players.
static func ambients(scene_class: String, context: Dictionary = {}) -> PackedStringArray:
	var names := PackedStringArray()
	var kind := str(context.get("kind", "land"))
	match scene_class:
		TOWN, INN: names = PackedStringArray(["market_crowd", "dishes"])
		PORT:
			if str(context.get("water", "sea")) == "river":
				names = PackedStringArray(["river", "ropes_mast"])
			else:
				names = PackedStringArray(["waves", "ropes_mast", "seabirds"])
		WILD: names = PackedStringArray(["wind_sand", "fire"])
		COURT: names = PackedStringArray(["footsteps_echo"])
		JOURNEY:
			if kind == "sea":
				names = PackedStringArray(["waves", "ropes_mast", "seabirds"])
			elif kind == "river":
				names = PackedStringArray(["river", "ropes_mast"])
			else:
				names = PackedStringArray(["wind_sand", "horse_hooves"])
	# A possible storm hazard is not observed weather. Only explicit weather
	# can introduce rain, and indoor beds remain dry.
	if scene_class in [TOWN, PORT, WILD, JOURNEY] and str(context.get("weather", "")) in ["rain", "storm"]:
		names.append("rain")
	return names


## Wetness hint 0..1 for future reverb bus; used now as ambient ducking.
static func reverb(scene_class: String) -> float:
	match scene_class:
		WILD: return 0.65
		COURT: return 0.7
		SHRINE: return 0.95
		PORT: return 0.45
		_: return 0.2
