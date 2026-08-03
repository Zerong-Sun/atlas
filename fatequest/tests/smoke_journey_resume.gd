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
	var resumed_ok: bool = load_ok and main._dialog_layer.visible \
		and String(main._current_event.get("id", "")) == "ev-road-desert-voices" \
		and not main.state.active_journey.is_empty()
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
	var saved := SaveGame.deserialize(SaveGame.read("auto"))
	var persisted_ok: bool = not saved.is_empty() \
		and (saved["state"] as WorldState).city == "baldacum" \
		and (saved["state"] as WorldState).active_journey.is_empty()

	var ok := checkpoint_ok and resumed_ok and arrived_ok and persisted_ok
	print("JOURNEY_RESUME: checkpoint=%s resumed=%s arrived=%s persisted=%s" % [
		checkpoint_ok, resumed_ok, arrived_ok, persisted_ok])
	print("JOURNEY_RESUME: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
