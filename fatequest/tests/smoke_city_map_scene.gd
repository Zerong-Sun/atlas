extends SceneTree

var failures: Array[String] = []
var checks := 0
var elapsed := 0.0

func _process(dt: float) -> bool:
	elapsed += dt
	if elapsed > 90:
		printerr("CITY_MAP_SCENE watchdog")
		quit(1)
	return false

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures.append(label)
		printerr("FAIL: " + label)

func frames(count := 6) -> void:
	for i in count:
		await process_frame

func _init() -> void:
	call_deferred("run")

func run() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await frames()
	n._begin(n.db.get_record("merchant"))
	await frames()
	Motion.reduce_motion = true
	n.state.city = "zayton"
	n.state.active_event = ""
	n.state.pending_events.clear()
	n._dialog_layer.visible = false
	n._dock_h.clear()
	for preset in ["normal-zh", "compact-zh", "large-en"]:
		root.content_scale_size = Vector2i(960, 640) if preset == "compact-zh" else Vector2i(1280, 720)
		root.size = root.content_scale_size
		UiScale.step = UiScale.Size.NORMAL if preset == "normal-zh" else UiScale.Size.LARGE
		I18n.load_lang("en" if preset == "large-en" else "zh")
		n._restyle_all()
		n._open_city()
		await frames(15)
		var city = n._city_view
		var places: Array = city._figures.get_children()
		check(places.size() >= 4, preset + " renders actual city places")
		for i in places.size():
			var p: Control = places[i]
			check(p.get_rect().position.x >= 0 and p.get_rect().end.x <= city._figures.size.x + 1, preset + " landmark fits scene width")
			check(p.get_rect().end.x <= city._figures.size.x * 0.70, preset + " landmarks leave the right background clear")
			check(p.get_meta("art_path", "") != city._bg.texture.resource_path, "landmark never reuses whole city backdrop")
			for j in range(i + 1, places.size()):
				check(not p.get_rect().intersects(places[j].get_rect()), preset + " place hit targets do not overlap")
			for label in p.find_children("*", "Label", true, false):
				check(p.get_global_rect().encloses(label.get_global_rect()), preset + " place label stays inside its hit target")
		check(city._foot.get_global_rect().end.y <= root.get_visible_rect().size.y, preset + " fixed navigation visible")
		city._figure_scroll.scroll_vertical = 99999
		await frames()

		n.state.once_fired["ev-zayton-harbour"] = true
		n._open_city()
		await frames()
		for p in city._figures.get_children():
			if p.get_meta("event_id") == "ev-zayton-harbour":
				check(p.disabled and p.get_meta("done"), "completed once-only place is visible and disabled")
			if p.get_meta("event_id") == "ev-zayton-mentor":
				check(not p.disabled and not p.get_meta("once"), "repeatable place remains accessible")
		n.state.once_fired.erase("ev-zayton-harbour")
		n._refresh_hud()
		n._close_city()
		n._map.reset_local_view()
		await frames()
		var map = n._map
		check(is_equal_approx(map.zoom, map.LOCAL_ZOOM), "map defaults to neighborhood zoom")
		var screen_pos: Vector2 = map.to_screen(map._city_pos.zayton)
		check(screen_pos.distance_to(n._map_centre()) < 1, "edge city is centered rather than pinned to right border")
		check(n.projection.origin.y + n.projection.height <= n._panel_wrap.global_position.y + 1, "map viewport fits above docks even at 960px")
		check(n._dock_height("log") >= 230 and n._dock_height("panel") >= 230, "both docks have useful default reading height")
	check(n._map._land_mesh != null and n._map._land_mesh.get_surface_count() > 0, "local atlas includes land fill")
	var mesh_arrays: Array = n._map._land_mesh.surface_get_arrays(0)
	var vertices: PackedVector3Array = mesh_arrays[Mesh.ARRAY_VERTEX]
	var indices: PackedInt32Array = mesh_arrays[Mesh.ARRAY_INDEX]
	var inland: Vector2 = n.projection.to_view(116, 30)
	var has_mainland := false
	for i in range(0, indices.size(), 3):
		var triangle := PackedVector2Array()
		for j in 3:
			var vertex := vertices[indices[i + j]]
			triangle.append(Vector2(vertex.x, vertex.y))
		if Geometry2D.is_point_in_polygon(inland, triangle):
			has_mainland = true
			break
	check(has_mainland, "Asian mainland is filled, not lost during polygon triangulation")
	# Every label has a distinct target, including the current city, in dense areas.
	var map = n._map
	for record in n.db.cities():
		n.state.revealed[String(record.id)] = 3
	n.state.city = "kinsay"
	n._refresh_hud()
	for z in [1.0, 4.5, 12.0, 16.0]:
		map.set_zoom(z, n._map_centre(), false)
		map.center_on("kinsay")
		var hits: Array = map._compute_label_hits()
		check(not hits.is_empty(), "dense map has usable labels")
		check(hits.any(func(hit): return hit.id == "kinsay"), "current city label is never dropped at zoom " + str(z))
		map._label_hits = hits
		for i in hits.size():
			for j in range(i + 1, hits.size()):
				check(not hits[i].rect.intersects(hits[j].rect), "map label rectangles do not overlap")
			map._pick(hits[i].rect.get_center())
			check(map._focused_city == hits[i].id, "clicking label chooses its city")
	# Animated wheel zoom interpolates, preserves focus and accumulates rapid input.
	Motion.reduce_motion = false
	map.reset_local_view()
	var focus: Vector2 = n._map_centre()
	var under_cursor: Vector2 = map.to_map(focus)
	map.set_zoom(8.0, focus)
	check(map.zoom < 8, "smooth zoom does not jump to its endpoint")
	await create_timer(0.06).timeout
	check(map.zoom > map.LOCAL_ZOOM and map.zoom < 8, "smooth zoom has intermediate frames")
	check(map.to_map(focus).distance_to(under_cursor) < 0.01, "zoom keeps cursor point pinned")
	await create_timer(0.25).timeout
	check(is_equal_approx(map.zoom, 8), "zoom reaches requested target")
	Motion.reduce_motion = true
	# Directed history survives a return trip, previews and disk-format round-trip.
	var state: WorldState = n.state.duplicate_state()
	state.city = "zayton"
	state.journey_legs.clear()
	var executor := EffectExecutor.new()
	for dest in ["fuju", "zayton", "zayton"]:
		executor.execute(state, [{"op": "goto", "value": dest, "reason": "ui-regression"}])
	check(state.journey_legs.size() == 2, "return trips recorded, no-op arrival excluded")
	check(state.journey_legs[1].from == "fuju" and state.journey_legs[1].to == "zayton", "return arrow direction preserved")
	executor.preview(state, [{"op": "goto", "value": "kinsay", "reason": "preview-regression"}])
	check(state.journey_legs.size() == 2, "preview cannot add actual journey arrows")
	var doc := SaveGame.serialize(state, WorldClock.new(state.jdn))
	var restored: WorldState = SaveGame.deserialize(doc).state
	check(restored.journey_legs == state.journey_legs, "journey arrows survive save/load")
	doc.state.erase("journey_legs")
	doc = SaveGame._seal(doc)
	var legacy: WorldState = SaveGame.deserialize(doc).state
	check(legacy.journey_legs.is_empty(), "old saves load without inventing routes")
	check(I18n.missing_keys().is_empty(), "new navigation text is localized")
	print("CITY_MAP_SCENE: %s (%d checks)" % ["PASS" if failures.is_empty() else str(failures), checks])
	quit(0 if failures.is_empty() else 1)
