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


## Per-layer base gains before mood modulation. Shrine & wild strip melody/pulse.
static func layer_gains(scene_class: String) -> Dictionary:
	match scene_class:
		TOWN:
			return {"drone": 1.0, "pulse": 1.0, "melody": 0.85, "color": 0.0}
		PORT:
			return {"drone": 1.0, "pulse": 0.7, "melody": 0.9, "color": 0.0}
		WILD:
			return {"drone": 1.0, "pulse": 0.0, "melody": 0.0, "color": 0.0}
		COURT:
			return {"drone": 1.0, "pulse": 0.45, "melody": 0.75, "color": 0.15}
		SHRINE:
			# Space + occasional color (blurred sacred gesture). No pulse/melody.
			return {"drone": 0.75, "pulse": 0.0, "melody": 0.0, "color": 0.35}
		INN:
			return {"drone": 1.0, "pulse": 0.4, "melody": 0.55, "color": 0.0}
		_:
			return {"drone": 1.0, "pulse": 0.6, "melody": 0.7, "color": 0.0}


## Ambient stem filenames under assets/audio/ambient/ (no extension).
## Keep ≤4 names — AudioDirector allocates 4 ambient players.
static func ambients(scene_class: String) -> PackedStringArray:
	match scene_class:
		TOWN:
			return PackedStringArray(["market_crowd", "dishes"])
		PORT:
			# river + rain were on disk but unmapped
			return PackedStringArray(["waves", "ropes_mast", "river", "rain"])
		WILD:
			# horse_hooves was on disk but unmapped; fire kept for camp colour
			return PackedStringArray(["wind_sand", "camel_bells", "horse_hooves", "fire"])
		COURT:
			return PackedStringArray(["footsteps_echo"])
		SHRINE:
			return PackedStringArray([])  # space left to music drone + procedural bells
		INN:
			return PackedStringArray(["market_crowd", "dishes"])
		_:
			return PackedStringArray(["wind_sand"])


## Wetness hint 0..1 for future reverb bus; used now as ambient ducking.
static func reverb(scene_class: String) -> float:
	match scene_class:
		WILD: return 0.65
		COURT: return 0.7
		SHRINE: return 0.95
		PORT: return 0.45
		_: return 0.2
