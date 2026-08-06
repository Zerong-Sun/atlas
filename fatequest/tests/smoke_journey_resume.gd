extends SceneTree

const WATCHDOG := 60.0
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > WATCHDOG:
		printerr("JOURNEY_RESUME: WATCHDOG")
		quit(1)
	return false


func _init() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	main._draw_character()
	await process_frame
	main._confirm_character_draw()
	await process_frame

	main.state.city = "tauris"
	main.state.coins = 100000
	main.state.items.append("travel-papers")
	var source: Dictionary = main.db.get_record("rt-tauris-baldacum")
	var route: Dictionary = source.duplicate(true)
	route["id"] = "rt-smoke-resumable-journey"
	route["risk"] = 5
	route["season"] = {}
	route["encounters"] = ["ev-road-desert-voices"]
	main.state.revealed[route["id"]] = 1

	main._perform_depart(route, "foot")
	await process_frame
	var checkpoint_ok: bool = main.state.city == "baldacum" \
		and not main.state.active_journey.is_empty() \
		and main.state.pending_events == ["ev-road-desert-voices"] \
		and main._dialog_layer.visible

	# The checkpoint was written before the event became active. Reloading it
	# must reopen the FIFO consequence and retain the pending arrival.
	var load_ok: bool = main._load("auto")
	await process_frame
	# A resumed journey never passed through the departure screen, so the
	# bottom-right panel must still be populated behind the queued road event —
	# every known route rendering disabled ("journey in progress"), not blank.
	var panel_filled: bool = main._panel.get_child_count() > 0
	var journey_disabled := false
	for ch in main._panel.get_children():
		if ch is Button and (ch as Button).disabled:
			journey_disabled = true
			break
	var resumed_ok: bool = load_ok and main._dialog_layer.visible \
		and String(main._current_event.get("id", "")) == "ev-road-desert-voices" \
		and not main.state.active_journey.is_empty() \
		and panel_filled and journey_disabled
	main._resolve_choice(main._current_event, 1)
	await process_frame
	# Choice now carries authored resultText, so the result page must be
	# dismissed before the journey completes (main._resolve_choice paths:
	# result → dismissal → _complete_journey).
	main._on_event_dismissed()
	await process_frame

	var arrived_ok: bool = main.state.city == "baldacum" \
		and main.state.active_journey.is_empty() \
		and main.state.active_event.is_empty() \
		and main.state.pending_events.is_empty()

	# Arrival picked the baldacum entry event; step out of town onto the roads
	# panel. The reported bug was a panel that stayed blank through the whole
	# resume chain, so a resumed run must end with walkable route buttons —
	# "可以到达目的地". rt-baldacum-basora / rt-baldacum-ninive are open year-
	# round and coins are plentiful here, so at least one route is enabled.
	var entry_shown: bool = main._dialog_layer.visible \
		and String(main._current_event.get("id", "")) == "ev-baldacum-entry"
	if main._dialog_layer.visible:
		main._on_event_dismissed()
		await process_frame
	if main._city_view.visible:
		main._close_city()
		await process_frame
	var routes_listed := false
	var exit_enabled := false
	for ch in main._panel.get_children():
		if not (ch is Button):
			continue
		var label := String((ch as Button).text)
		if not label.contains("→"):
			continue
		routes_listed = true
		if not (ch as Button).disabled:
			exit_enabled = true
	var walkable_ok: bool = entry_shown and routes_listed and exit_enabled
	var saved := SaveGame.deserialize(SaveGame.read("auto"))
	var persisted_ok: bool = not saved.is_empty() \
		and (saved["state"] as WorldState).city == "baldacum" \
		and (saved["state"] as WorldState).active_journey.is_empty()

	var ok := checkpoint_ok and resumed_ok and arrived_ok and persisted_ok and walkable_ok
	print("JOURNEY_RESUME: checkpoint=%s resumed=%s (panel=%s journey_disabled=%s) arrived=%s walkable=%s (entry=%s routes=%s exit=%s) persisted=%s" % [
		checkpoint_ok, resumed_ok, panel_filled, journey_disabled, arrived_ok,
		walkable_ok, entry_shown, routes_listed, exit_enabled, persisted_ok])
	print("JOURNEY_RESUME: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
