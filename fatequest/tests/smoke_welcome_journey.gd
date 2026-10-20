extends SceneTree

## Button-driven zero-money opening, hospitality, save/resume, market and road.
var failures := 0
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 60.0:
		printerr("WELCOME: WATCHDOG")
		quit(1)
	return false


func check(ok: bool, label: String) -> void:
	print("  %s: %s" % [label, "PASS" if ok else "FAIL"])
	if not ok:
		failures += 1


func button(node: Node, text: String) -> Button:
	if node is Button and String(node.text) == text and not node.disabled:
		return node
	for child in node.get_children():
		var found := button(child, text)
		if found != null:
			return found
	return null


func press(node: Node, key: String) -> void:
	var target := button(node, I18n.t(key))
	check(target != null, "button " + key)
	if target != null:
		target.pressed.emit()
	await process_frame
	await process_frame


func _init() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	check(I18n.coverage()["translated"] > 5000, "fresh installation loads Chinese")
	check(not FileAccess.file_exists(UiScale.CFG), "test has no saved preferences")
	var arch: Dictionary = main.db.get_record("battuta").duplicate(true)
	arch["startKit"]["coins"] = 0
	main._begin(arch)
	await process_frame
	await press(main._dialog, "ev.alexandria.welcome.entry")
	check(main._current_event.get("id") == "ev-alexandria-welcome-gate", "entry reaches gate")
	if DisplayServer.get_name() != "headless":
		await create_timer(0.5).timeout
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/welcome-gate.png")
	await press(main._dialog, "ev.alexandria.welcome.gate.tears")
	await press(main._dialog, "ui.continue_pending")
	check(main.state.active_event == "ev-alexandria-welcome-meal", "tears reach host")

	await press(main._dialog, "ui.hold_for_now")
	check(not main._dialog_layer.visible, "pause leaves a resume action")
	check(main._load("auto"), "reload hospitality checkpoint")
	await process_frame
	await process_frame
	check(main.state.active_event == "ev-alexandria-welcome-meal", "host survives reload")
	await press(main._dialog, "ev.alexandria.welcome.meal.aid")
	check(main.state.coins == 1200, "one gift of twelve silver")
	await press(main._dialog, "ui.continue_pending")
	check(main._city_view.visible and not main._dialog_layer.visible, "result returns to city")

	# Both duplicate FIFO entries and a restored active once-event must be
	# skipped, preserving their rewards while continuing to the next page.
	main.executor.execute(main.state, [
		{"op": "queue_event", "value": "ev-alexandria-welcome-meal", "reason": "test-old-save"},
		{"op": "queue_event", "value": "ev-alexandria-welcome-meal", "reason": "test-duplicate"},
		{"op": "active_event", "value": "ev-alexandria-welcome-meal", "reason": "test-old-save"},
	], {})
	main._save("duplicate-checkpoint")
	check(main._load("duplicate-checkpoint"), "load completed active event")
	await process_frame
	check(main.state.pending_events.is_empty() and main.state.active_event.is_empty(),
		"completed once-event cannot trap the queue")
	check(main.state.coins == 1200, "duplicate recovery gives no extra money")

	var gate: Dictionary = main.db.get_record("ev-alexandria-welcome-gate")
	var original_faith: String = main.state.faith
	main.state.faith = "latin"
	var choices: Array = main.events.choice_states(gate, main.state, main._ctx())
	check(not choices[0]["visible"] and choices[1]["enabled"] and choices[2]["enabled"],
		"identity changes greeting but never blocks help or leaving")
	main.state.faith = original_faith
	main.state.coins = 3000
	choices = main.events.choice_states(gate, main.state, main._ctx())
	check(not choices[1]["visible"], "comfortable traveller cannot claim poverty")
	main.state.coins = 1200
	for choice_index in [1, 2]:
		var guest := WorldState.new()
		guest.city = "alexandria"
		guest.coins = 0
		var res = main.events.choose(main.db.get_record("ev-alexandria-welcome-meal"),
			choice_index, guest, Rng.new("welcome-refusal"), {"event_committed": true})
		check(res.resolved and guest.coins == 0 and guest.pending_events.is_empty(),
			"free alternative %d resolves without money" % choice_index)

	var note: String = main._dialog._origin_note(main.db.get_record("ev-alexandria-battuta-a"))
	check(note.contains("白图泰") and note.contains("battuta-c001"), "correct book and chapter")
	main._open_city()
	await process_frame
	await press(main._city_view, "ui.market")
	if DisplayServer.get_name() != "headless":
		await create_timer(0.5).timeout
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/alexandria-market.png")
	var before: int = main.state.coins
	# The bead is the only affordable stock for this penniless opening.
	await press(main._market_view._stock_box, "ui.buy")
	check(main.state.goods.get("glass-bead", 0) == 1 and main.state.coins < before,
		"market purchase changes money and bag")
	await press(main._market_view, "ui.leave_market")
	await press(main._city_view, "ui.set_out")
	var route_button: Button = null
	for child in main._panel.get_children():
		if child is Button and not child.disabled and String(child.text).contains(
				I18n.t("city.babylonia-cairus.name")) and String(child.text).contains(
				I18n.t("transport.foot.name")):
			route_button = child
			break
	check(route_button != null, "Cairo on foot is affordable after shopping")
	if route_button != null:
		route_button.pressed.emit()
		await process_frame
		check(main._travel_confirm_layer.visible and main.state.city == "alexandria",
			"planning does not depart")
		await press(main._travel_confirm, "ui.think_again")
		check(not main._travel_confirm_layer.visible and main.state.city == "alexandria",
			"cancel returns to roads")
		route_button.pressed.emit()
		await process_frame
		main._travel_confirm._confirm.pressed.emit()
		await process_frame
		check(main.state.city == "babylonia-cairus", "confirmed road reaches Cairo")
		for step in 25:
			if main._dialog_layer.visible:
				for child in main._dialog._choices.get_children():
					if child is Button and not child.disabled:
						child.pressed.emit()
						break
			await process_frame
			await process_frame
			if main.state.active_journey.is_empty() and not main._dialog_layer.visible:
				break
		check(main.state.active_journey.is_empty() and main.state.pending_events.is_empty(),
			"arrival can continue")
	if not I18n.missing_keys().is_empty():
		print("WELCOME missing keys: ", I18n.missing_keys())
	check(I18n.missing_keys().is_empty(), "no text keys leaked")
	print("WELCOME: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
