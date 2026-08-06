extends SceneTree

## B3 road-followup regression (OPTIMIZATION_PLAN §2.3):
##   A memorable road encounter (wolves) now queues a second consequence page
##   instead of ending at one beat. Drives the real departure → encounter →
##   followup → arrival chain and asserts:
##     1. the departure checkpoint queues the encounter and nothing else;
##     2. reloading the checkpoint opens the encounter page;
##     3. resolving its "guard" choice queues the followup, which opens next;
##     4. the followup has bilingual title/body/choices wired (G17/G18 live);
##     5. resolving the followup lets the journey complete into the city.
## Same fixtures as smoke_journey_resume.gd (tauris → tenduc).

const WATCHDOG := 60.0
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > WATCHDOG:
		printerr("ROAD_FOLLOWUP: WATCHDOG")
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

	main.state.city = "egrigaia"
	main.state.coins = 100000
	main.state.items.append("travel-papers")
	var source: Dictionary = main.db.get_record("rt-egrigaia-tenduc")
	var route: Dictionary = source.duplicate(true)
	route["id"] = "rt-smoke-road-followup"
	route["risk"] = 5
	route["season"] = {}
	route["encounters"] = ["ev-road-fadlan-25"]
	main.state.revealed[route["id"]] = 1

	main._perform_depart(route, "foot")
	await process_frame

	print("DEBUG city=%s journey=%s pending=%s dialog=%s active_event=%s" % [
		main.state.city,
		!main.state.active_journey.is_empty(),
		JSON.stringify(main.state.pending_events),
		main._dialog_layer.visible,
		main.state.active_event,
	])

	# 1. Departure checkpoint: moved to the destination, journey open, the
	#    encounter queued and the dialog up.
	var checkpoint_ok: bool = main.state.city == "tenduc" \
		and not main.state.active_journey.is_empty() \
		and main.state.pending_events == ["ev-road-fadlan-25"] \
		and main._dialog_layer.visible

	# 2. Reloading the checkpoint reopens the encounter page itself.
	var load_ok: bool = main._load("auto")
	await process_frame
	var enc_ok: bool = load_ok and main._dialog_layer.visible \
		and String(main._current_event.get("id", "")) == "ev-road-fadlan-25"

	# 3. The "keep the fires high" choice queues the followup, which opens next.
	main._resolve_choice(main._current_event, 0)
	await process_frame
	var followup_ok: bool = main._dialog_layer.visible \
		and String(main._current_event.get("id", "")) == "ev-road-fadlan-25-followup" \
		and main.state.active_event == "ev-road-fadlan-25-followup" \
		and main.state.pending_events == ["ev-road-fadlan-25-followup"] \
		and not main.state.active_journey.is_empty()

	# 4. Bilingual text is wired for every followup key the UI reads.
	var fup: Dictionary = main._current_event
	var keys: Array[String] = [
		String(fup.get("title", "")),
		String(fup.get("body", "")),
		String((fup.get("choices", []) as Array)[0].get("label", "")),
		String((fup.get("choices", []) as Array)[0].get("resultText", "")),
	]
	var text_ok := true
	I18n.load_lang("zh")
	for k in keys:
		if I18n.t(k) == k:
			text_ok = false
			printerr("  FAIL: followup key missing from zh.json: %s" % k)
		elif I18n.is_untranslated(k):
			text_ok = false
			printerr("  FAIL: followup zh translation missing: %s" % k)
	I18n.load_lang("en")
	for k in keys:
		if I18n.t(k) == k:
			text_ok = false
			printerr("  FAIL: followup key missing from en.json: %s" % k)
	I18n.load_lang("zh")

	# 5. Resolving the followup lets the journey complete into the city.
	main._resolve_choice(main._current_event, 0)
	await process_frame
	main._on_event_dismissed()
	await process_frame
	var arrived_ok: bool = main.state.city == "tenduc" \
		and main.state.active_journey.is_empty() \
		and main.state.active_event.is_empty() \
		and main.state.pending_events.is_empty()

	var ok := checkpoint_ok and enc_ok and followup_ok and text_ok and arrived_ok
	print("ROAD_FOLLOWUP: checkpoint=%s encounter=%s followup=%s text=%s arrived=%s" % [
		checkpoint_ok, enc_ok, followup_ok, text_ok, arrived_ok])
	print("ROAD_FOLLOWUP: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
