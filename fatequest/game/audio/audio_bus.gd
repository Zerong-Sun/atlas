extends Node

## Thin facade kept for early A1 call sites. Prefer AudioDirector (autoload).
## Mute / volume live on the director so music, ambient and SFX share one gate.

func _ready() -> void:
	pass


var muted: bool:
	get:
		return AudioDirector.muted
	set(v):
		AudioDirector.muted = v


var volume_db: float:
	get:
		return AudioDirector.volume_db
	set(v):
		AudioDirector.volume_db = v


func toggle_mute() -> bool:
	return AudioDirector.toggle_mute()


static func music_rng(city_id: String, jdn: int) -> Rng:
	return AudioDirector.music_rng(city_id, jdn)
