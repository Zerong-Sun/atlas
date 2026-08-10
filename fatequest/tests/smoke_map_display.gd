extends SceneTree

## Map display regression (OPTIMIZATION_PLAN §4):
##   Entering the map page must never show a blank screen. Drives the real
##   entry transition (boot desk → 抽签 → 出发 → _begin → arrival), waits for
##   the parchment fade and the entry-art plate to settle, dismisses the
##   arrival dialog and the city interior, then asserts the standing map is
##   fully visible and unobscured. A second phase departs on a real journey
##   and re-checks the standing map after arrival.
##     1. world_map is built, visible and fully opaque once the fade settles;
##     2. projection viewport is non-zero (a 0×0 vellum draws nothing);
##     3. fog mask exists and is wired to a real shader material (a plain
##        ColorRect would be a solid wash covering everything);
##     4. no full-rect overlay is left covering the standing map.

const _WATCHDOG_SEC := 90.0
var _t := 0.0
var _n: Node = null

func _process(d: float) -> bool:
	_t += d
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: smoke_map_display exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


## Await `cond` until it returns true, or give up after a wall-clock budget.
## Headless Godot can advance frames much faster than real time while timers
## still use elapsed seconds; a frame-only budget made this smoke flaky when
## several Godot processes were running together.
func _wait_until(cond: Callable, max_frames: int) -> bool:
	var deadline := Time.get_ticks_msec() + maxi(1000, int(float(max_frames) * 1000.0 / 60.0))
	while Time.get_ticks_msec() < deadline:
		if cond.call():
			return true
		await process_frame
	return false


## Dismiss whatever arrival UI is up and land on the standing map.
func _settle_to_map() -> void:
	var n := _n
	if n._transit_layer != null and n._transit_layer.visible:
		if not await _wait_until(func(): return n._transit_layer.visible == false, 300):
			printerr("  FAIL: entry-art transit layer never hid")
	if n._dialog_layer != null and n._dialog_layer.visible:
		n._on_event_dismissed()
		await process_frame
	if n._city_view != null and n._city_view.visible:
		n._close_city()
		await process_frame


func _init() -> void:
	var scn = load("res://game/screens/main.tscn")
	var n = scn.instantiate()
	_n = n
	root.add_child(n)
	# _ready defers _finish_boot (call_deferred), which builds the desk.
	await process_frame
	await process_frame
	var desk_ready := await _wait_until(func(): return n._desk != null, 60)
	if not desk_ready:
		printerr("  FAIL: boot desk never built")
		quit(1)
		return

	# Real flow: draw a character on the desk and confirm the departure.
	n._draw_character()
	n._confirm_character_draw()
	if n.state == null:
		printerr("  FAIL: _begin did not run (state null after 出发)")
		quit(1)
		return

	var map = n._map
	if map == null:
		printerr("  FAIL: world_map not built")
		quit(1)
		return

	# The parchment expand is transitional, not a bug: wait for full opacity.
	var fade_ok := await _wait_until(
		func(): return map.visible and map.modulate.a >= 0.99, 300)
	if not fade_ok:
		printerr("  FAIL: world_map never reached full opacity (modulate.a=%.2f)"
			% map.modulate.a)

	# 1. map present, visible and opaque
	var map_ok: bool = map.visible and map.modulate.a >= 0.99
	var input_ok: bool = n._map_input != null \
		and n._map_input.mouse_filter == Control.MOUSE_FILTER_STOP \
		and n._map_input.size.x >= n.projection.origin.x + n.projection.width
	if not input_ok:
		printerr("  FAIL: map GUI input surface is missing or does not cover the map")

	# 2. projection non-zero
	var proj_ok: bool = n.projection != null \
		and n.projection.width > 0.0 and n.projection.height > 0.0
	if not proj_ok:
		printerr("  FAIL: projection viewport is 0×0 (blank vellum)")

	# 3. fog exists with a shader material and a mask texture
	var fog_ok := true
	var fog = map._fog
	if fog == null:
		fog_ok = false
		printerr("  FAIL: fog ColorRect missing")
	elif fog.material == null or not (fog.material is ShaderMaterial):
		fog_ok = false
		printerr("  FAIL: fog has no ShaderMaterial (plain rect = full wash)")
	else:
		var mat := fog.material as ShaderMaterial
		if mat.shader == null:
			fog_ok = false
			printerr("  FAIL: fog shader not loaded")
		if mat.get_shader_parameter("mask") == null:
			fog_ok = false
			printerr("  FAIL: fog mask texture missing")
		if not (fog.size.x > 0.0 and fog.size.y > 0.0):
			fog_ok = false
			printerr("  FAIL: fog rect is 0×0 (%.0f×%.0f)" % [fog.size.x, fog.size.y])

	# Reach the standing map: entry-art plate, arrival dialog, city view.
	await _settle_to_map()

	# 4. no full-rect cover left over the standing map
	var covers_ok := _covers_clear()

	# 5. a drawn frame must produce a non-zero canvas rect (nothing drawn = blank)
	var draw_ok := true
	var viewport_rect: Rect2 = map.get_viewport_rect()
	if viewport_rect.size.x <= 0.0 or viewport_rect.size.y <= 0.0:
		draw_ok = false
		printerr("  FAIL: map viewport rect is empty %s" % viewport_rect)

	# The reveal mask must not be empty after the opening knowledge: the start
	# city is stamped at level 3, so a fully-blank wash is a regression.
	var intel_ok: bool = int(map.intel(String(n.state.city))) >= 3 \
		and map.revealed.has(String(n.state.city))
	if not intel_ok:
		printerr("  FAIL: no city is fully known (mask would be a solid wash)")

	# Phase B — depart on a real journey, skip the countdown, arrive, and
	# re-check the standing map after re-entry.
	var roundtrip_ok := await _phase_travel_roundtrip()

	var ok: bool = map_ok and input_ok and proj_ok and fog_ok and covers_ok and draw_ok \
		and intel_ok and roundtrip_ok
	print("MAP_DISPLAY: map=%s input=%s projection=%s fog=%s covers=%s draw=%s intel=%s roundtrip=%s" % [
		map_ok, input_ok, proj_ok, fog_ok, covers_ok, draw_ok, intel_ok, roundtrip_ok])
	print("MAP_DISPLAY: projection=%0.fx%.0f fog=%0.fx%.0f cities=%d revealed=%d" % [
		n.projection.width if n.projection != null else -1.0,
		n.projection.height if n.projection != null else -1.0,
		fog.size.x if fog != null else -1.0,
		fog.size.y if fog != null else -1.0,
		map.cities.size() if map != null else -1,
		map.revealed.size() if map != null else -1])
	print("MAP_DISPLAY: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)


## Standing-map cover check shared by both phases.
func _covers_clear() -> bool:
	var n := _n
	var ok := true
	if n._transit_layer != null and n._transit_layer.visible:
		ok = false
		printerr("  FAIL: transit layer left visible over the map")
	if n._dialog_layer != null and n._dialog_layer.visible:
		ok = false
		printerr("  FAIL: event dialog left visible over the map")
	if n._city_view != null and n._city_view.visible:
		ok = false
		printerr("  FAIL: city view left visible over the map")
	if n._city_detail_layer != null and n._city_detail_layer.visible:
		ok = false
		printerr("  FAIL: city detail layer left visible over the map")
	if n._travel_confirm_layer != null and n._travel_confirm_layer.visible:
		ok = false
		printerr("  FAIL: travel confirm left visible over the map")
	return ok


## Depart on a no-encounter leg, skip the countdown, arrive, and confirm the
## standing map is visible and unobscured once more.
func _phase_travel_roundtrip() -> bool:
	var n := _n
	var ok := true

	# Place the party on a known road with the means to travel.
	n.state.city = "tauris"
	n.state.coins = 100000
	if "travel-papers" not in n.state.items:
		n.state.items.append("travel-papers")
	var source: Dictionary = n.db.get_record("rt-tauris-baldacum")
	if source.is_empty():
		printerr("  FAIL: no test route rt-tauris-baldacum")
		return false
	var route: Dictionary = source.duplicate(true)
	route["id"] = "rt-smoke-map-roundtrip"
	route["risk"] = 0  # no random road events: the countdown completes arrival
	route["encounters"] = []
	n.state.revealed[String(route["id"])] = 1

	var before_city := String(n.state.city)
	n._perform_depart(route, "foot")
	await process_frame

	if String(n.state.city) != "baldacum":
		printerr("  FAIL: depart did not move the party (city=%s)" % n.state.city)
		ok = false
	if n._transit_layer == null or not n._transit_layer.visible:
		printerr("  FAIL: transit plate did not come up during departure")
		ok = false

	# Skip the countdown with a tap on the plate.
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	n._on_transit_input(click)
	await process_frame
	await process_frame

	# Arrival cleared the plate; the map must be standing and unobscured.
	var map = n._map
	var arrived_visible: bool = map.visible and map.modulate.a >= 0.99 \
		and String(n.state.city) == "baldacum"
	if not arrived_visible:
		printerr("  FAIL: map not visible/opaque after arrival (a=%.2f city=%s)"
			% [map.modulate.a, n.state.city])
		ok = false
	await _settle_to_map()
	if not _covers_clear():
		ok = false
	return ok
