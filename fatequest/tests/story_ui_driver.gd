extends RefCounted

## Shared UI test driver. Never resolves effects, emits lesson success, or
## dismisses signals directly: every transition uses an enabled visible button.
static func press(root: Node, label: String) -> bool:
	if root is Button and root.text == label and root.is_visible_in_tree() and not root.disabled:
		root.pressed.emit()
		return true
	for child in root.get_children():
		if press(child, label):
			return true
	return false

static func choice(main: Node, index: int) -> bool:
	if not main._dialog_layer.visible or main._dialog._title.text == I18n.t("ui.choice_result_title"):
		return false
	var choices: Array = main._current_event.get("choices", [])
	if index < 0 or index >= choices.size():
		return false
	return press(main._dialog._choices, I18n.t(choices[index].get("label", "")))

static func continue_result(main: Node) -> bool:
	return main._dialog_layer.visible \
		and main._dialog._title.text == I18n.t("ui.choice_result_title") \
		and press(main._dialog._choices, I18n.t("ui.continue_pending"))

static func finish_lesson(main: Node, method: String) -> bool:
	if not main._lesson_layer.visible or main._lesson_ui._method != method:
		return false
	var ui = main._lesson_ui
	if is_instance_valid(ui._challenge_view):
		return await finish_challenge(main, ui._challenge_view)
	var lesson: Dictionary = ui._lesson
	match String(lesson.get("type", "")):
		"arrange", "form":
			for step in lesson.get("steps", []):
				if not press(ui._stage, I18n.t(step)):
					return false
		"deduce":
			# Bazi's four counting rods add to the authored target of ten.
			for value in [1, 2, 3, 4]:
				if not press(ui._stage, I18n.t("lesson.add_token_fmt") % value):
					return false
		"throw":
			for i in int(lesson.get("throws", 1)):
				if not press(ui._stage, I18n.t("lesson.throw_tool")):
					return false
			var options: Array = lesson.get("options", [])
			if not press(ui._stage, I18n.t(options[int(lesson.get("answer", 0))])):
				return false
		"timing":
			var window: Array = lesson.get("window", [0.45, 0.60])
			var deadline := Time.get_ticks_msec() + 5000
			while Time.get_ticks_msec() < deadline:
				var value := float(ui._timing_bar.value) / 100.0
				if value > float(window[0]) + 0.01 and value < float(window[1]) - 0.01:
					if not press(ui._stage, I18n.t("lesson.timing_stop")):
						return false
					break
				await main.get_tree().process_frame
		_:
			return false
	await main.get_tree().process_frame
	return ui._finished and not main._lesson_layer.visible

static func followup_branch(main: Node, event_id: String, choice_index: int,
		followup_id: String, method: String = "") -> bool:
	main._show_event(main.db.get_record(event_id))
	await main.get_tree().process_frame
	if not main._dialog_layer.visible or String(main._current_event.get("id", "")) != event_id:
		return false
	if not choice(main, choice_index):
		return false
	await main.get_tree().process_frame
	if not method.is_empty() and not await finish_lesson(main, method):
		return false
	if not continue_result(main):
		return false
	await main.get_tree().process_frame
	if not main._dialog_layer.visible or String(main._current_event.get("id", "")) != followup_id \
			or main.state.active_event != followup_id:
		return false
	if not choice(main, 0):
		return false
	await main.get_tree().process_frame
	if not continue_result(main):
		return false
	await main.get_tree().process_frame
	return not main._dialog_layer.visible and main._city_view.visible \
		and main.state.active_event.is_empty() and main.state.pending_events.is_empty() \
		and (method.is_empty() or method in main.state.learned_divinations)


static func finish_challenge(main: Node, view: Node) -> bool:
	var steps := 0
	while view.engine.status == "active" and steps < 180:
		steps += 1
		var move: Dictionary = view.engine.suggestion()
		if view.engine.kind == "timing":
			var deadline := Time.get_ticks_msec() + 6000
			while Time.get_ticks_msec() < deadline:
				var value: float = view.engine.needle()
				if value >= float(view.engine.state.low) + 0.02 and value <= float(view.engine.state.high) - 0.02:
					break
				await main.get_tree().process_frame
			move = {"action": "submit"}
		var button: Button = view._find_button(view, String(move.action), int(move.get("index", 0)))
		if button == null or not button.is_visible_in_tree() or button.disabled:
			return false
		button.pressed.emit()
		await main.get_tree().process_frame
	if view.engine.status != "passed": return false
	var confirm: Button = view._find_button(view, "continue", 0)
	if confirm == null or confirm.disabled: return false
	confirm.pressed.emit()
	await main.get_tree().process_frame
	return main._lesson_ui._finished and not main._lesson_layer.visible
