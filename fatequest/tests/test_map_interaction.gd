extends RefCounted

var _fails := 0


func _ok(value: bool, message: String) -> void:
	if not value:
		printerr("  FAIL: %s" % message)
		_fails += 1


func run() -> bool:
	var map = preload("res://game/map/world_map.gd").new()
	map.projection = MapProjection.new()
	map.projection.origin = Vector2(48, 48)
	map.projection.set_viewport(1184, 454)
	var focus: Vector2 = map.projection.origin \
		+ Vector2(map.projection.width, map.projection.height) * 0.5

	var wheel := InputEventMouseButton.new()
	wheel.button_index = MOUSE_BUTTON_WHEEL_UP
	wheel.pressed = true
	wheel.position = focus
	map.handle_map_input(wheel)
	_ok(map.zoom > 1.0, "mouse wheel zoom changes the camera")

	var pan_before: Vector2 = map.pan
	var press := InputEventMouseButton.new()
	press.button_index = MOUSE_BUTTON_LEFT
	press.pressed = true
	press.position = focus
	map.handle_map_input(press)
	var drag := InputEventMouseMotion.new()
	drag.position = focus + Vector2(64, 32)
	drag.relative = Vector2(64, 32)
	map.handle_map_input(drag)
	_ok(map.pan.distance_to(pan_before) > 10.0, "left-button drag pans the camera")

	var gesture := InputEventMagnifyGesture.new()
	gesture.position = focus
	gesture.factor = 1.25
	var zoom_before: float = map.zoom
	map.handle_map_input(gesture)
	_ok(map.zoom > zoom_before, "trackpad magnify gesture zooms the camera")

	# A touch tap selects a known city; a two-finger gesture must never be
	# mistaken for a city tap when the last finger lifts.
	map.zoom = 1.0
	map.pan = Vector2.ZERO
	map.current_city = "touch-city"
	map.cities = [{"id": "touch-city", "tier": "city"}]
	map._city_pos = {"touch-city": focus}
	var selected: Array[String] = []
	map.city_clicked.connect(func(city: Dictionary): selected.append(String(city.get("id", ""))))
	var touch_down := InputEventScreenTouch.new()
	touch_down.index = 0
	touch_down.pressed = true
	touch_down.position = focus
	map.handle_map_input(touch_down)
	var touch_up := InputEventScreenTouch.new()
	touch_up.index = 0
	touch_up.pressed = false
	touch_up.position = focus + Vector2(2, 1)
	map.handle_map_input(touch_up)
	_ok(selected == ["touch-city"], "single-finger tap selects a known city")
	var second_down := InputEventScreenTouch.new()
	second_down.index = 1
	second_down.pressed = true
	second_down.position = focus + Vector2(20, 0)
	map.handle_map_input(touch_down)
	map.handle_map_input(second_down)
	var second_up := InputEventScreenTouch.new()
	second_up.index = 1
	second_up.pressed = false
	second_up.position = second_down.position
	map.handle_map_input(second_up)
	map.handle_map_input(touch_up)
	_ok(selected.size() == 1, "two-finger gesture release does not select a city")

	# Projection resize rebuilds every cached overlay instead of moving only the
	# online basemap.
	map.cities = [{"id": "resize-city", "coord": [50.0, 30.0], "tier": "city"}]
	map.routes = []
	map.mountains = []
	map._vector_records = {"coastlines": [[[-10.0, 0.0], [10.0, 0.0]]]}
	map.on_projection_changed()
	var city_before: Vector2 = map._city_pos["resize-city"]
	var coast_before: Vector2 = map.coastlines[0][1]
	map.projection.set_viewport(592, 227)
	map.on_projection_changed()
	var city_after: Vector2 = map._city_pos["resize-city"]
	var coast_after: Vector2 = map.coastlines[0][1]
	_ok(city_after.distance_to(city_before) > 10.0 and coast_after.distance_to(coast_before) > 10.0,
		"viewport resize reprojects cities and geographic vectors")

	var region: Dictionary = map._clip_tile_to_map(
		Rect2(Vector2(0, 0), Vector2(200, 200)), Vector2(256, 256))
	_ok(not region.is_empty() \
		and (region["destination"] as Rect2).position == map.projection.origin \
		and (region["source"] as Rect2).position.x > 0.0,
		"edge tile destination and source are cropped to the map frame")

	map.free()
	print("test_map_interaction: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
