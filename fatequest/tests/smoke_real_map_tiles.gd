extends SceneTree

## Manual/network integration smoke. Runs the real Main scene with a graphical
## display, enters the playable map, and waits for an actual XYZ tile to reach
## the composed WorldMap. Kept out of CI because offline builds must still pass.

const TIMEOUT_SECONDS := 25.0
var _elapsed := 0.0
var _main: Control
var _started := false


func _process(delta: float) -> bool:
	_elapsed += delta
	if _started and _map_is_ready():
		var map = _main._map
		var viewport_image := root.get_viewport().get_texture().get_image()
		var ok: bool = map._tile_attribution != null \
			and map._tile_attribution.visible \
			and _main._map_input != null \
			and viewport_image.get_width() > 0 and viewport_image.get_height() > 0
		print("REAL_MAP_TILES: loaded=%d attribution=%s input=%s frame=%dx%d → %s" % [
			map._tiles._textures.size(), map._tile_attribution != null,
			_main._map_input != null, viewport_image.get_width(), viewport_image.get_height(),
			"OK" if ok else "FAIL"])
		quit(0 if ok else 1)
	elif _elapsed >= TIMEOUT_SECONDS:
		printerr("REAL_MAP_TILES: integrated map loaded no tile in %.0f seconds" % TIMEOUT_SECONDS)
		quit(1)
	return false


func _map_is_ready() -> bool:
	return _main != null and _main._map != null \
		and _main._map._tiles != null and _main._map._tiles.enabled \
		and _main._map._tiles._textures.size() > 0


func _init() -> void:
	var scene = load("res://game/screens/main.tscn")
	_main = scene.instantiate()
	root.add_child(_main)
	call_deferred("_enter_map")


func _enter_map() -> void:
	var deadline := Time.get_ticks_msec() + 5000
	while _main._desk == null and Time.get_ticks_msec() < deadline:
		await process_frame
	if _main._desk == null:
		printerr("REAL_MAP_TILES: boot desk did not build")
		quit(1)
		return
	_main._draw_character()
	_main._confirm_character_draw()
	_started = true
