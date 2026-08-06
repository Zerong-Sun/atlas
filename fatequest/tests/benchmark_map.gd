extends SceneTree

## Map frame-cost benchmark (O1, requirement §13.3).
##
## The release-build 60 FPS gate is a manual GPU measurement on a real window;
## headless has no renderer, so this benchmark records the CPU-side work that
## dominates map frames and holds as a regression proxy:
##   1. fog-mask rebuild  — a one-shot cost on every city/road reveal. Must fit
##      inside a single 60 FPS frame budget; it is not a per-frame cost.
##   2. travel frame time — per-frame wall time while the route-ink animation
##      runs, i.e. whether travel frames hold 60 FPS on the CPU side.
##   3. sustained FPS     — throughput with the fully-revealed map standing.
## Every metric is the median/P95 over repeated runs, not a single best value.

const _WATCHDOG_SEC := 120.0
const MASK_ITERATIONS := 40
const FPS_FRAMES := 300
const FRAME_BUDGET_MS := 1000.0 / 60.0  # one 60 FPS frame

var _t := 0.0
func _process(d: float) -> bool:
	_t += d
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: benchmark_map exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	await process_frame

	# Same real flow as smoke_map_display: boot desk → character → map.
	n._draw_character()
	n._confirm_character_draw()
	if n.state == null or n._map == null:
		printerr("BENCHMARK: map never built")
		quit(1)
		return
	var map = n._map

	# One-time map build (projection, geometry, brushes, icons): measure it on
	# a fresh instance with the same inputs rather than reading the boot map.
	var ranges := _load_ranges()
	var vectors := _load_world_vectors()
	var fresh := preload("res://game/map/world_map.gd").new()
	n.add_child(fresh)
	var setup_started := Time.get_ticks_usec()
	fresh.setup(n.projection, n.db.cities(), n.db.get_table("routes"),
		ranges, vectors)
	var setup_ms := float(Time.get_ticks_usec() - setup_started) / 1000.0
	fresh.queue_free()

	# Reveal the whole world so every mask rebuild stamps the worst case:
	# all 102 cities at full intel and every revealed route.
	for city in n.db.cities():
		n.state.revealed[String(city.get("id", ""))] = 3
	map.set_current(String(n.state.city), n.state.revealed)
	await process_frame

	# 1. fog-mask rebuild P95 (worst case: full world).
	var mask_ms: Array[float] = []
	for i in MASK_ITERATIONS:
		var started := Time.get_ticks_usec()
		map._update_mask()
		mask_ms.append(float(Time.get_ticks_usec() - started) / 1000.0)

	# 2. per-frame wall time while the route-ink animation runs.
	var frame_ms: Array[float] = []
	map.animate_route("tauris", "baldacum", 7, "land", false)
	var guard := 0
	while map._route_draw.size() > 0 and guard < 900:
		var s := Time.get_ticks_usec()
		await process_frame
		frame_ms.append(float(Time.get_ticks_usec() - s) / 1000.0)
		guard += 1

	# 3. sustained frame rate with the map up.
	var fps_vals: Array[float] = []
	for i in FPS_FRAMES:
		await process_frame
		fps_vals.append(float(Engine.get_frames_per_second()))

	mask_ms.sort()
	frame_ms.sort()
	fps_vals.sort()
	var mask_p95 := _pct(mask_ms, 0.95)
	var travel_frame_p95 := _pct(frame_ms, 0.95)
	var fps_med := _pct(fps_vals, 0.50)
	var ok := mask_p95 < FRAME_BUDGET_MS \
		and travel_frame_p95 < FRAME_BUDGET_MS and fps_med >= 60.0
	print("MAP_BENCH: setup=%.2fms mask_p95=%.2fms travel_frame_p95=%.2fms sustained_fps=%.0f" % [
		setup_ms, mask_p95, travel_frame_p95, fps_med])
	print("MAP_BENCH: mask_iterations=%d route_steps=%d frames=%d cities=%d revealed=%d" % [
		MASK_ITERATIONS, frame_ms.size(), FPS_FRAMES,
		map.cities.size() if map != null else -1,
		map.revealed.size() if map != null else -1])
	print("MAP_BENCH: %s" % ("PASS" if ok else "FAIL"))
	n.queue_free()
	await process_frame
	quit(0 if ok else 1)


func _load_ranges() -> Array:
	var f := FileAccess.open("res://content/world/mountains.json", FileAccess.READ)
	if f == null:
		return []
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) != TYPE_DICTIONARY:
		return []
	return ContentDb._normalize(doc).get("ranges", [])


func _load_world_vectors() -> Dictionary:
	var f := FileAccess.open("res://content/world/vector_map.json", FileAccess.READ)
	if f == null:
		return {}
	var doc = JSON.parse_string(f.get_as_text())
	return doc if typeof(doc) == TYPE_DICTIONARY else {}


func _pct(values: Array[float], ratio: float) -> float:
	if values.is_empty():
		return INF
	var index := clampi(int(ceil(float(values.size()) * ratio)) - 1,
		0, values.size() - 1)
	return values[index]
