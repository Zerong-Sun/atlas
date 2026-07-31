extends SceneTree

const WATCHDOG := 60.0
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > WATCHDOG:
		printerr("WATCHDOG")
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	# Opening draw owns the identity and start city.
	n._draw_character()
	await process_frame
	var drawn: Dictionary = n._drawn_archetype
	var draw_ok := not drawn.is_empty()
	n._confirm_character_draw()
	await process_frame
	var character_ok: bool = n.state.city == String(drawn.get("start", "")) \
		and String(n.state.character.get("archetype_id", "")) == String(drawn.get("id", "")) \
		and n.state.revealed.size() >= 2

	# A branch consequence opens before returning to the city.
	n.state.city = "zayton"
	n.state.coins = 100000
	var entry: Dictionary = n.db.get_record("ev-zayton-entry")
	n._resolve_choice(entry, 2)
	await process_frame
	var chain_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-zayton-pilot-consequence"
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var chain_ok: bool = int(n.state.revealed.get("chamba", 0)) > 0 \
		and int(n.state.revealed.get("rt-chamba-zayton", 0)) > 0

	# Deferring a committed consequence must expose a resume path instead of
	# hiding active_event in the save forever.
	n.executor.execute(n.state, [{
		"op": "queue_event", "value": "ev-zayton-ledger-consequence",
		"reason": "smoke-deferred-consequence",
	}], {"event_id": "smoke-defer"})
	n._show_next_pending_event()
	await process_frame
	n._dialog.dismissed.emit()
	await process_frame
	var consequence_paused: bool = not n._dialog_layer.visible \
		and n.state.active_event == "ev-zayton-ledger-consequence" \
		and n.state.pending_events == ["ev-zayton-ledger-consequence"]
	n._continue_pending()
	await process_frame
	var consequence_resumed: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-zayton-ledger-consequence"
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var consequence_continued: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-zayton-ledger-consequence-resolution"
	if consequence_continued:
		n._resolve_choice(n._current_event, 0)
		await process_frame
	var defer_ok: bool = consequence_paused and consequence_resumed and consequence_continued \
		and n.state.active_event.is_empty() and n.state.pending_events.is_empty()

	# A known city is clickable, and selecting travel is not yet departure.
	n._on_city_clicked(n.db.get_record("chamba"))
	await process_frame
	var card_ok: bool = n._city_detail_layer.visible
	n._city_detail_layer.visible = false
	var route: Dictionary = n.db.get_record("rt-chamba-zayton")
	var before_city: String = n.state.city
	n._on_depart(route, "ship")
	await process_frame
	var confirm_ok: bool = n._travel_confirm_layer.visible and n.state.city == before_city
	n._travel_confirm_layer.visible = false
	var emitted := [0]
	var isolated_confirm = preload("res://game/ui/travel_confirm.gd").new()
	n.add_child(isolated_confirm)
	await process_frame
	isolated_confirm.setup(n.db, n.travel)
	isolated_confirm.confirmed.connect(
		func(_route: Dictionary, _mode: String): emitted[0] += 1)
	isolated_confirm.open(route, "ship", n.state.city, n.state)
	isolated_confirm._emit_confirmed()
	isolated_confirm._emit_confirmed()
	confirm_ok = confirm_ok and emitted[0] == 1
	isolated_confirm.queue_free()

	# Learning is gated by the method-specific exercise.
	var mentor: Dictionary = n.db.get_record("ev-zayton-mentor")
	var learned_before: bool = "jiaobei" in n.state.learned_divinations
	n._on_choice(mentor, 1)
	await process_frame
	var lesson_open: bool = n._lesson_layer.visible and not learned_before \
		and "jiaobei" not in n.state.learned_divinations
	n._lesson_ui._throw_tool()
	n._lesson_ui._pick_interpret(0)
	await process_frame
	var lesson_ok: bool = "jiaobei" in n.state.learned_divinations

	var ok: bool = draw_ok and character_ok and chain_open and chain_ok and defer_ok \
		and card_ok and confirm_ok and lesson_open and lesson_ok
	print("FATEQUEST_FLOW: draw=%s character=%s chain=%s defer=%s card=%s confirm=%s lesson=%s" % [
		draw_ok, character_ok, chain_open and chain_ok, defer_ok, card_ok, confirm_ok,
		lesson_open and lesson_ok])
	print("FATEQUEST_FLOW: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
