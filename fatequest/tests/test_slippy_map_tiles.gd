extends RefCounted

var _fails := 0


func _ok(value: bool, message: String) -> void:
	if not value:
		printerr("  FAIL: %s" % message)
		_fails += 1


func run() -> bool:
	var tiles = preload("res://game/map/slippy_map_tiles.gd").new()
	tiles._load_config()
	_ok(tiles.enabled and tiles._url_template.begins_with("https://") \
		and not tiles.attribution.is_empty() and not tiles._user_agent.is_empty(),
		"provider config has HTTPS, attribution and application identity")
	var samples := [
		Vector2(0.0, 0.0),
		Vector2(116.4074, 39.9042),
		Vector2(-0.1278, 51.5074),
	]
	for geo in samples:
		var z := 6
		var x := int(floor(tiles._lon_to_tile_x(geo.x, z)))
		var y := int(floor(tiles._lat_to_tile_y(geo.y, z)))
		var west := tiles._tile_x_to_lon(x, z)
		var east := tiles._tile_x_to_lon(x + 1, z)
		var north := tiles._tile_y_to_lat(y, z)
		var south := tiles._tile_y_to_lat(y + 1, z)
		_ok(geo.x >= west and geo.x <= east and geo.y <= north and geo.y >= south,
			"XYZ tile bounds contain %s" % geo)
	_ok(tiles._cache_path(4, 8, 5) == "user://map_tiles/4/8/5.png",
		"tile cache path is stable")
	var texture := ImageTexture.create_from_image(Image.create(1, 1, false, Image.FORMAT_RGBA8))
	tiles._max_memory_tiles = 2
	tiles._visible_keys = {"visible": {}}
	tiles._store_texture("visible", texture)
	tiles._store_texture("old", texture)
	tiles._store_texture("new", texture)
	_ok(tiles._textures.size() == 2 and tiles._textures.has("visible") \
		and tiles._textures.has("new") and not tiles._textures.has("old"),
		"memory cap evicts the oldest off-screen tile but keeps visible tiles")
	tiles.free()
	print("test_slippy_map_tiles: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
