extends SceneTree

var failures := 0
var clicks := 0

func _init() -> void:
	call_deferred("_run")

func _ok(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("FAIL: " + message)

func _wait(seconds: float = 0.16) -> void:
	await create_timer(seconds).timeout

func _run() -> void:
	var host := Control.new()
	root.add_child(host)
	var b := Panels.styled_button("选择 / Choose", func(): clicks += 1)
	b.position = Vector2(100, 100)
	b.size = Vector2(220, 60)
	host.add_child(b)
	await process_frame
	var feedback = b.get_meta(Motion.FEEDBACK)
	Panels.style_button(b)
	_ok(b.get_meta(Motion.FEEDBACK) == feedback, "restyling does not install duplicate feedback")
	_ok(not b.get_theme_stylebox("focus").draw_center, "focus ring never paints over the button")
	for fixture in [[0, "0"], [300, "3"], [350, "3.5"], [305, "3.05"], [-305, "-3.05"]]:
		_ok(Panels.money(fixture[0]) == fixture[1], "money preserves exact fen for %d" % fixture[0])
	var decorated := Panels.overlay(host, Vector2(100, 100))
	var decorative_count := 0
	UiScale.high_contrast = true
	Panels.restyle_tree(decorated["layer"])
	for child in decorated["panel"].get_children():
		if child.get_meta("decorative_panel_art", false):
			decorative_count += 1
			_ok(not child.visible, "high contrast removes decorative panel art")
	_ok(decorative_count > 0, "real illustrated panel exercises contrast regression")
	UiScale.high_contrast = false
	Panels.restyle_tree(decorated["layer"])
	for child in decorated["panel"].get_children():
		if child.get_meta("decorative_panel_art", false):
			_ok(child.visible, "turning contrast off restores decorative art")
	# A portrait can be added after style_button. Its feedback must remain
	# above that portrait but below a later modal, using ordinary tree order.
	var portrait_plate := TextureRect.new()
	portrait_plate.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(portrait_plate)
	await process_frame
	_ok(feedback.get_index() == b.get_child_count() - 1, "feedback stays above late-added button artwork")
	var cover := Control.new()
	host.add_child(cover)
	_ok(Panels._key_is_above(Panels._draw_order_key(cover), Panels._draw_order_key(feedback)),
		"underlying button feedback cannot paint above a later same-z modal")
	cover.queue_free()
	var initial_rect := b.get_rect()
	b.mouse_entered.emit()
	await _wait()
	_ok(feedback.strength > 0.9, "pointer hover gives feedback")
	b.button_down.emit()
	await _wait()
	_ok(feedback.strength > 1.7, "press is visibly distinct from hover")
	b.button_up.emit()
	b.mouse_exited.emit()
	b.grab_focus()
	await _wait()
	_ok(feedback.strength > 0.9, "keyboard focus gives equivalent feedback")
	_ok(b.get_rect() == initial_rect and b.scale == Vector2.ONE, "feedback does not change layout or hit target")
	var key := InputEventKey.new()
	key.keycode = KEY_SPACE
	key.pressed = true
	root.push_input(key)
	await process_frame
	key = InputEventKey.new()
	key.keycode = KEY_SPACE
	key.pressed = false
	root.push_input(key)
	await process_frame
	_ok(clicks == 1, "keyboard activation reaches gameplay immediately once")
	b.disabled = true
	await process_frame
	await process_frame
	_ok(is_zero_approx(feedback.strength), "disabled button clears stale press and hover")
	b.disabled = false
	b.release_focus()
	b.mouse_entered.emit()
	b.mouse_exited.emit()
	b.mouse_entered.emit()
	b.mouse_exited.emit()
	await _wait()
	_ok(is_zero_approx(feedback.strength), "rapid hover reversals settle at newest state")
	Motion.reduce_motion = true
	b.mouse_entered.emit()
	_ok(is_equal_approx(feedback.strength, 1.0), "reduced motion applies feedback without a tween")
	b.mouse_exited.emit()
	Motion.reduce_motion = false

	var panel := Control.new()
	panel.position = Vector2(300, 100)
	host.add_child(panel)
	Motion.crossfade_out(panel, 0.12)
	await _wait(0.03)
	Motion.crossfade_in(panel, 0.06)
	await _wait(0.2)
	_ok(panel.visible and is_equal_approx(panel.modulate.a, 1.0), "old close tween cannot hide reopened panel")
	Motion.parchment_expand(panel, 0.12)
	await _wait(0.03)
	Motion.parchment_expand(panel, 0.06)
	await _wait()
	_ok(panel.scale.is_equal_approx(Vector2.ONE), "repeated expand preserves resting scale")
	Motion.parchment_expand(panel, 0.12)
	Motion.reduce_motion = true
	Motion.parchment_expand(panel, 0.06)
	await _wait()
	_ok(panel.scale.is_equal_approx(Vector2.ONE), "reduced motion restores interrupted scale")
	Motion.reduce_motion = false
	var resting_position := panel.position
	Motion.rise(panel, Vector2(0, 12), 0.12)
	Motion.rise(panel, Vector2(0, 12), 0.06)
	await _wait()
	_ok(panel.position.is_equal_approx(resting_position), "repeated rise preserves resting position")
	Motion.stagger_in([b], 0.04, 0.10)
	_ok(b.modulate.a >= 0.6 and not b.disabled, "entrance choices are visible and immediately usable")
	Motion.stagger_in([b], 0.04, 0.05)
	await _wait()
	_ok(is_equal_approx(b.modulate.a, 1.0), "reentrant stagger settles fully visible")

	var overlay_a := Control.new()
	var overlay_b := Control.new()
	host.add_child(overlay_a)
	host.add_child(overlay_b)
	overlay_a.z_index = 80
	overlay_b.z_index = 1
	_ok(Panels.topmost_index([overlay_a, overlay_b]) == 0, "visual z-index overrides caller array order")
	overlay_a.z_index = 1
	_ok(Panels.topmost_index([overlay_b, overlay_a]) == 0, "same-z sibling order overrides caller array order")
	overlay_b.hide()
	_ok(Panels.topmost_index([overlay_a, overlay_b]) == 0, "hidden layers do not trap focus or Escape")
	var closed: Array = []
	Panels.close_topmost([overlay_a, overlay_b], [func(): closed.append("a"), func(): closed.append("b")])
	_ok(closed == ["a"], "Escape closes only actual topmost visible layer")
	# Freeing controls midway through transitions must not leave callbacks or
	# resource cycles behind; the runner rejects engine errors and leaked resources.
	Motion.parchment_expand(panel, 0.2)
	b.mouse_entered.emit()
	host.queue_free()
	await process_frame
	await _wait(0.25)
	print("BUTTON MOTION: %s" % ("PASS" if failures == 0 else "FAIL (%d)" % failures))
	quit(0 if failures == 0 else 1)
