extends SceneTree

var failures := 0
var selections := 0
var dismissals := 0


func _init() -> void:
	call_deferred("_run")


func check(ok: bool, label: String) -> void:
	if not ok:
		failures += 1
		printerr("FAIL: " + label)


func frames() -> void:
	for i in 5:
		await process_frame


func inside(control: Control, viewport: Vector2) -> bool:
	var rect := control.get_global_rect()
	return rect.position.x >= -1 and rect.position.y >= -1 \
		and rect.end.x <= viewport.x + 1 and rect.end.y <= viewport.y + 1


func key(code: Key, shift := false) -> InputEventKey:
	var event := InputEventKey.new()
	event.keycode = code
	event.pressed = true
	event.shift_pressed = shift
	return event


func _run() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await frames()
	main._begin(main.db.get_record("battuta"))
	await frames()
	root.content_scale_size = Vector2i(960, 640)
	root.size = Vector2i(960, 640)
	UiScale.step = UiScale.Size.LARGE
	Motion.reduce_motion = true
	for lang in ["en", "zh"]:
		I18n.load_lang(lang)
		main._restyle_all()
		main._show_event(main.db.get_record("ev-alexandria-welcome-gate"))
		await frames()
		var viewport: Vector2 = root.get_visible_rect().size
		check(inside(main._dialog, viewport), lang + " large dialogue fits 960×640")
		check(inside(main._dialog._leave, viewport), lang + " pause remains visible")
		check(not main._controls.visible and not main._right_spine.visible,
			"background floating buttons cannot cover a modal")
		check(main._dialog_layer.is_ancestor_of(root.gui_get_focus_owner()),
			"opening a dialogue moves focus inside")
		for i in 15:
			main._input(key(KEY_TAB, i % 2 == 0))
			check(main._dialog_layer.is_ancestor_of(root.gui_get_focus_owner()),
				"Tab and Shift+Tab stay inside the dialogue")
		main._book_layer.visible = true
		await frames()
		main._unhandled_key_input(key(KEY_ESCAPE))
		check(not main._book_layer.visible and main._dialog_layer.visible,
			"Escape closes higher z-index book before dialogue")
		await frames()
		main._input(key(KEY_ESCAPE))
		await frames()
		check(not main._dialog_layer.visible, "Escape pauses the event")

	# Isolated synthetic page: many long/disabled choices must remain scrollable,
	# and an old control must not submit the next page from a signal callback.
	var viewport := SubViewport.new()
	viewport.size = Vector2i(960, 640)
	root.add_child(viewport)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(center)
	var dialog = load("res://game/ui/event_dialog.gd").new()
	center.add_child(dialog)
	var cost_hint: String = dialog._choice_cost_hint({"effects": [
		{"op": "coins", "value": -800}, {"op": "days", "value": 2}]})
	check(cost_hint.contains("8") and cost_hint.contains("2"),
		"immediate silver and time costs are visible before choosing")
	check(dialog._choice_cost_hint({"effects": [{"op": "coins", "value": 800}]}) == "",
		"rewards are not mislabeled as costs")
	check(dialog._choice_cost_hint({"effects": [
		{"op": "coins", "value": -800}, {"op": "coins", "value": 1200}]}).contains("8"),
		"a later reward does not hide an upfront expense")
	var states: Array = []
	for i in 12:
		states.append({"choice": {"label": "ev.alexandria.welcome.gate.tears"},
			"visible": true, "enabled": i != 0, "reasons": ["ui.walk_away"]})
	var ev := {"title": "ev.alexandria.welcome.gate.title",
		"body": "ev.alexandria.welcome.gate.body", "lore": {"origin": "authored"}}
	dialog.show_event(ev, states)
	await frames()
	check(inside(dialog, viewport.size), "twelve choices do not push panel outside viewport")
	check(inside(dialog._leave, viewport.size), "pause remains outside long choice scroll")
	check(dialog._choice_scroll.get_v_scroll_bar().max_value > dialog._choice_scroll.size.y,
		"long choices expose a scroll range")
	dialog.choice_taken.connect(func(_index: int):
		selections += 1
		dialog.show_event(ev, states))
	var old: Button = dialog._choices.get_child(1)
	old.pressed.emit()
	old.pressed.emit()
	check(selections == 1, "a stale choice cannot submit a replacement page")
	dialog.dismissed.connect(func():
		dismissals += 1
		dialog.show_event(ev, states))
	var old_leave: Button = dialog._leave
	old_leave.pressed.emit()
	old_leave.pressed.emit()
	check(dismissals == 1, "a stale pause cannot dismiss a replacement page")
	viewport.queue_free()
	await frames()

	# Changing text or animation preferences must preserve independently saved docks.
	var config := ConfigFile.new()
	config.set_value("dock", "log", 271.0)
	config.save(UiScale.CFG)
	UiScale.save()
	config.load(UiScale.CFG)
	check(float(config.get_value("dock", "log", 0.0)) == 271.0,
		"UI preferences preserve dock heights")
	Motion.reduce_motion = false
	UiScale.load_prefs()
	check(Motion.reduce_motion, "reduced motion persists across reload")
	check(I18n.missing_keys().is_empty(), "no untranslated key placeholders")
	print("DIALOG USABILITY: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
