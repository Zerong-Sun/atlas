extends Node

## Audio entry point (AUDIO_PLAN.md §8 A1).
##
## Accessibility comes FIRST, before a single note exists: sustained drones are
## genuinely hard for some players, so mute must work from the very first build
## rather than being retrofitted once the music is "done".
##
## L2 presentation layer: subscribes to GameContext signals, never writes
## WorldState (ARCHITECTURE.md §1, AUDIO_PLAN.md §9).

const BUS_MASTER := "Master"

var muted: bool = false:
	set(v):
		muted = v
		AudioServer.set_bus_mute(AudioServer.get_bus_index(BUS_MASTER), v)

var volume_db: float = -6.0:
	set(v):
		volume_db = clampf(v, -60.0, 6.0)
		AudioServer.set_bus_volume_db(AudioServer.get_bus_index(BUS_MASTER), volume_db)

## Music variation is seeded from world state, so a given city on a given day
## always sounds the same — place-memory for free (AUDIO_PLAN.md §6).
## MUST be a separate stream from gameplay RNG: sharing one would let an audio
## variation shift which event fires (CODE_PLAN.md §2.1).
static func music_rng(city_id: String, jdn: int) -> Rng:
	return Rng.new("music:%s:%d" % [city_id, jdn])


func _ready() -> void:
	volume_db = volume_db
	muted = muted


func toggle_mute() -> bool:
	muted = not muted
	return muted
