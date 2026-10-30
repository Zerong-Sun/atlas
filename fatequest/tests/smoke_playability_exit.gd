extends SceneTree

## A background with no authored knownRoutes must still have a real first leg.
var failures: Array[String] = []
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 60.0:
		printerr("PLAYABILITY_EXIT: watchdog")
		quit(1)
	return false


func _check(ok: bool, label: String) -> void:
	if not ok:
		failures.append(label)
		printerr("FAIL " + label)


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	root.size = Vector2i(1280, 720)
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	var steppe: Dictionary = main.db.get_record("steppe")
	_check(steppe.get("knownRoutes", []).is_empty(), "steppe fixture has no known route")
	main._begin(steppe)
	await process_frame
	var exits: Array[String] = []
	for route in main.travel.routes_from(main.state.city):
		if main.travel.is_route_known(route, main.state):
			exits.append(String(route.get("id", "")))
	_check(exits == ["rt-tauris-baldacum"], "opening reveals shortest road toward Chandu")
	main._dialog_layer.visible = false
	main.state.active_event = ""
	main.state.pending_events.clear()
	# After a local discovery, the next-step prompt must point to the road the
	# player can actually click, even though the archetype authored no route.
	main.state.once_fired["ev-tauris-a"] = true
	main._open_city()
	var original_guide: String = main._city_view._guide.text
	_check(original_guide.contains(main._city_name("baldacum")),
		"city guide points to the newly usable road")
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/playability-steppe-city.png")
	main._close_city()
	await process_frame
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/playability-steppe-roads.png")
	var road_guide: String = ""
	for child in main._panel.get_children():
		if child is Label and child.has_meta("journey_guide"):
			road_guide = child.text
	_check(road_guide.contains(main._city_name("baldacum")),
		"road guide and enabled route agree")
	var road_button: Button = null
	for child in main._panel.get_children():
		if child is Button and not child.disabled \
				and String(child.text).contains(main._city_name("baldacum")):
			road_button = child
			break
	_check(road_button != null, "Baldacum road is an enabled player-facing action")
	if road_button != null:
		road_button.pressed.emit()
		await process_frame
		_check(main._travel_confirm_layer.visible, "road opens travel confirmation")
		main._travel_confirm._confirm.pressed.emit()
		await process_frame
		_check(main.state.city == "baldacum", "confirmed first leg leaves Tabriz")
		for _step in 60:
			if main._dialog_layer.visible:
				for choice in main._dialog._choices.get_children():
					if choice is Button and not choice.disabled:
						choice.pressed.emit()
						break
			if main.state.active_journey.is_empty() and main._city_view.visible:
				break
			await create_timer(0.05).timeout
		_check(main.state.active_journey.is_empty() and main._city_view.visible,
			"first leg resolves into the destination city")
		_check(String(main._city_view._city.get("id", "")) == "baldacum" \
			and main._city_view._guide.text != original_guide \
			and main._city_view._guide.text == main._journey_guide_text(
				main.db.get_record("baldacum")),
			"arrival refreshes the destination's next step")
		var next_road: Dictionary = main.db.get_record("rt-baldacum-ormus")
		_check(main.travel.is_route_known(next_road, main.state),
			"arrival reveals onward roads, not only the return route")
		main._close_city()
		await process_frame
		var onward_button: Button = null
		for child in main._panel.get_children():
			if child is Button and not child.disabled \
					and String(child.text).contains(main._city_name("ormus")):
				onward_button = child
				break
		_check(onward_button != null, "arrival exposes a usable onward road")
	print("PLAYABILITY_EXIT: %s" % ("PASS" if failures.is_empty() else str(failures)))
	quit(0 if failures.is_empty() else 1)
