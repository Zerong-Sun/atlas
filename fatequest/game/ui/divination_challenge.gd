extends VBoxContainer

signal completed
signal abandoned(had_mistakes: bool)
const Challenge = preload("res://core/divination/challenge_engine.gd")
const Art = preload("res://game/ui/lesson_art.gd")
const Mentor = preload("res://game/ui/lesson_mentor.gd")
const Board = preload("res://game/ui/challenge_board.gd")
var engine = Challenge.new()
var _board: Control
var _controls: VBoxContainer
var _progress: Label
var _feedback: Label
var _rules: Label
var _note: Label
var _toolbar: HFlowContainer
var _submit_button: Button
var _confirmed := false
var _feedback_tween: Tween
var _hint: Dictionary = {}
var _mentor: VBoxContainer
var _dialogue: RichTextLabel
var _dialogue_tween: Tween
var _dialogue_panel: PanelContainer

func setup(config: Dictionary, rng: Rng) -> void:
	if not engine.configure(config, rng):
		push_error("Invalid divination challenge")
		return
	add_theme_constant_override("separation", 8)
	_progress = _label("")
	add_child(_progress)
	_rules = _label(_t(engine.kind + "_rule"))
	if engine.kind == "cast":
		_rules.text = _t("blocks_rule" if config.variant == "blocks" else "cast_rule")
	add_child(_rules)
	var scroll := ScrollContainer.new()
	scroll.name = "ChallengeReadingArea"
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.follow_focus = true
	add_child(scroll)
	var content := VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 8)
	scroll.add_child(content)
	var row := HFlowContainer.new()
	row.add_theme_constant_override("h_separation", 14)
	row.add_theme_constant_override("v_separation", 14)
	content.add_child(row)
	_mentor = Mentor.new()
	row.add_child(_mentor)
	_board = Board.new()
	_board.engine = engine
	row.add_child(_board)
	_board.interacted.connect(_board_action)
	_board.inspected.connect(_inspect_balance)
	_controls = VBoxContainer.new()
	_controls.custom_minimum_size.x = 310
	_controls.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_controls.add_theme_constant_override("separation", 6)
	row.add_child(_controls)
	_dialogue_panel = PanelContainer.new()
	var bubble := Palette.panel_style()
	if not UiScale.high_contrast: bubble.bg_color = Color("f2e7cc")
	bubble.border_color = Color("ab8a57")
	bubble.content_margin_top = 7
	bubble.content_margin_bottom = 7
	_dialogue_panel.add_theme_stylebox_override("panel", bubble)
	content.add_child(_dialogue_panel)
	_dialogue = RichTextLabel.new()
	_dialogue.bbcode_enabled = false
	_dialogue.custom_minimum_size.y = 40
	_dialogue.scroll_active = true
	_dialogue.add_theme_font_size_override("normal_font_size", 15)
	_dialogue.add_theme_color_override("default_color", Palette.ink())
	_dialogue.tooltip_text = I18n.t("lesson.stage.skip")
	_dialogue.gui_input.connect(_dialogue_input)
	_dialogue_panel.add_child(_dialogue)
	_mentor.spoken.connect(_speak)
	_mentor.setup(config)
	_feedback = _label(_t("ready"))
	_feedback.custom_minimum_size.y = 22
	content.add_child(_feedback)
	_toolbar = HFlowContainer.new()
	_toolbar.add_theme_constant_override("h_separation", 8)
	_toolbar.add_theme_constant_override("v_separation", 6)
	add_child(_toolbar)
	_note = _label(I18n.t(String(config.note)))
	_note.add_theme_font_size_override("font_size", 13)
	_note.add_theme_color_override("font_color", Palette.ink_soft())
	content.add_child(_note)
	_render()

func _t(key: String) -> String:
	return I18n.t("challenge.ui.%s" % key)

func _label(text: String) -> Label:
	var label := Panels.label(text, 15, Palette.ink())
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return label

func _clear(node: Node) -> void:
	for child in node.get_children():
		node.remove_child(child)
		child.queue_free()

func _button(parent: Node, text: String, action: String, index: int = 0) -> Button:
	var button := Panels.styled_button(text, _act.bind(action, index))
	button.set_meta("challenge_action", action)
	button.set_meta("challenge_index", index)
	button.add_theme_font_size_override("font_size", 14)
	button.custom_minimum_size.y = 44
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	button.tooltip_text = text
	button.disabled = engine.status != "active" and action not in ["retry", "leave", "continue"]
	if _hint.get("action", "") == action and int(_hint.get("index", 0)) == index:
		button.set_meta("primary_action", true)
		Panels.style_button(button)
	if action == "cell" and engine.kind in ["draft", "numbers", "cycle", "memory"]:
		var sprite := "card_back"
		if engine.kind == "draft": sprite = Art.suit(engine.config, int(engine.state.cards[index][0]))
		elif engine.kind == "memory": sprite = "rune_back" if engine.config.variant == "runes" else "card_back"
		elif engine.kind == "numbers": sprite = "number_tile"
		elif engine.kind == "cycle": sprite = Art.ELEMENTS[index]
		button.icon = Art.prop(sprite)
		button.expand_icon = true
		button.add_theme_constant_override("icon_max_width", 27)
	parent.add_child(button)
	return button

func _grid(columns: int) -> GridContainer:
	var grid := GridContainer.new()
	grid.columns = columns
	grid.add_theme_constant_override("h_separation", 5)
	grid.add_theme_constant_override("v_separation", 5)
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_controls.add_child(grid)
	return grid

func _render() -> void:
	var focused := get_viewport().gui_get_focus_owner()
	var focus_action := String(focused.get_meta("challenge_action", "")) if focused != null else ""
	var focus_index := int(focused.get_meta("challenge_index", 0)) if focused != null else 0
	_clear(_controls)
	_clear(_toolbar)
	var s: Dictionary = engine.state
	_progress.text = _t("progress") % [mini(engine.round_index + 1, int(engine.config.rounds)), int(engine.config.rounds), maxi(0, int(engine.config.lives) - engine.mistakes), engine.moves]
	if engine.status == "passed":
		_feedback.text = _t("complete") % ["★".repeat(engine.stars()) + "☆".repeat(3 - engine.stars()), _t("assisted" if engine.assisted else "unassisted")]
		_button(_controls, _t("continue"), "continue")
		_button(_toolbar, _t("retry"), "retry")
		_button(_toolbar, _t("leave"), "leave")
		set_process(false)
		_board.queue_redraw()
		_focus("continue", 0)
		return
	match engine.kind:
		"cast":
			_button(_controls, _t("cast"), "cast").disabled = s.cast or engine.status != "active"
			var options: Array = [0, 1, 2] if engine.config.variant == "blocks" else [6, 7, 8, 9]
			for option in options:
				var text := _t(("block" if engine.config.variant == "blocks" else "line") + str(option))
				if int(s.choice) == int(option): text = "✓ " + text
				_button(_controls, text, "choose", option).disabled = not s.cast or engine.status != "active"
		"parity":
			for i in 4:
				_button(_controls, "%d    %s" % [i + 1, "?" if int(s.cells[i]) == 0 else "●".repeat(int(s.cells[i]))], "cell", i)
		"rings":
			for i in 3:
				_controls.add_child(_label("%d: %s %d   →   %s %d" % [i + 1, _t("current"), int(s.rings[i]) + 1, _t("goal"), int(s.target[i]) + 1]))
				var buttons := HBoxContainer.new()
				_controls.add_child(buttons)
				_button(buttons, _t("left") % (i + 1), "left", i)
				_button(buttons, _t("right") % (i + 1), "right", i)
		"route", "trace":
			var grid := _grid(5)
			for i in 25:
				var mark := str(i + 1)
				if engine.kind == "route":
					if i in s.blocked: mark = "×"
					elif i == int(s.path.back()): mark = "●"
					elif i in s.path: mark = "·"
					elif i == int(s.goal): mark = "◎"
					elif i in s.checkpoints: mark = "◆"
				elif i in s.selected: mark = "●"
				var b := _button(grid, mark, "cell", i)
				b.tooltip_text = _t("cell") % (i + 1) + " · " + mark
				if engine.kind == "trace": b.disabled = s.preview or engine.status != "active"
				elif i in s.blocked or i in s.path: b.disabled = true
			if engine.kind == "trace" and s.preview:
				_button(_controls, _t("hide"), "hide")
			if engine.kind == "route":
				var count := 0
				for point in s.checkpoints:
					if point in s.path: count += 1
				_controls.add_child(_label(_t("budget") % [s.path.size(), s.budget, count]))
		"memory":
			var grid := _grid(4)
			for i in 8:
				var text := "%d  %s" % [i + 1, "✓" if i in s.matched else ("•" if i in s.open else "?")]
				var b := _button(grid, text, "cell", i)
				b.disabled = s.preview or i in s.matched or i in s.open or engine.status != "active"
			if s.preview: _button(_controls, _t("hide"), "hide")
		"draft":
			var labels: Array = _board.symbol_labels()
			var grid := _grid(4)
			for i in s.cards.size():
				var card: Array = s.cards[i]
				var text := "%s%d\n%s\n%s" % ["✓ " if i in s.selected else "", i + 1, labels[card[0]], labels[card[1]]]
				var card_button := _button(grid, text, "cell", i)
				card_button.custom_minimum_size.y = 102
				card_button.add_theme_font_size_override("font_size", 13)
		"cycle":
			for i in 5:
				_button(_controls, "%s  %d → %d" % [_t(["wood", "fire", "earth", "metal", "water"][i]), int(s.cells[i]), int(s.target[i])], "cell", i)
		"numbers":
			var grid := _grid(3)
			for i in s.values.size():
				_button(grid, ("✓ " if i in s.selected else "") + str(s.values[i]), "cell", i)
			var total := 0
			for index in s.selected: total += int(s.values[index])
			_controls.add_child(_label(_t("sum") % [total, s.target, s.selected.size()]))
			if engine.config.variant == "remainders":
				_controls.add_child(_label(_t("remainders") % [s.target, s.upper, s.moving]))
		"timing":
			_controls.add_child(_label(_t("practice") if s.practice else _t("timing_rule")))
	_submit_button = _button(_toolbar, _t("steady" if engine.kind == "timing" else "submit"), "submit")
	if engine.kind not in ["memory", "cast", "timing"]:
		_button(_toolbar, _t("undo"), "undo").disabled = engine.history.is_empty() or engine.status != "active"
	_button(_toolbar, _t("hint"), "hint")
	_button(_toolbar, _t("retry"), "retry")
	_button(_toolbar, _t("leave"), "leave")
	if engine.status == "failed": _feedback.text = _t("failed")
	_board.queue_redraw()
	set_process(engine.kind == "timing" and engine.status == "active")
	if not _focus(focus_action, focus_index):
		_focus("retry" if engine.status == "failed" else ("hide" if engine.kind in ["memory", "trace"] and s.get("preview", false) else "submit"), 0)

func _focus(action: String, index: int) -> bool:
	for parent in [_controls, _toolbar]:
		var found := _find_button(parent, action, index)
		if found != null:
			found.grab_focus()
			return true
	return false

func _find_button(parent: Node, action: String, index: int) -> Button:
	for child in parent.get_children():
		if child is Button and not child.disabled and child.get_meta("challenge_action", "") == action and int(child.get_meta("challenge_index", 0)) == index:
			return child
		var found := _find_button(child, action, index)
		if found != null: return found
	return null

func _act(action: String, index: int = 0) -> void:
	if _confirmed: return
	if action == "continue":
		if engine.status == "passed":
			_confirmed = true
			completed.emit()
		return
	if action == "leave":
		_confirmed = true
		set_process(false)
		abandoned.emit(engine.mistakes > 0)
		return
	_hint = {}
	var previous: Dictionary = engine.state.duplicate(true)
	var result: Dictionary
	if action == "retry":
		engine.retry()
		result = {"code": "ready"}
	elif action == "submit": result = engine.submit()
	else: result = engine.act(action, index)
	var code := String(result.get("code", "changed"))
	_feedback.text = _t("undo_done" if code == "undo" else code)
	if action == "hint" and engine.status == "active":
		_hint = engine.suggestion()
		var hint_action := String(_hint.action)
		var hint_index := int(_hint.get("index", 0))
		var text := _t("cell") % (hint_index + 1)
		if hint_action in ["left", "right"]: text = _t(hint_action) % (hint_index + 1)
		elif hint_action == "choose": text = _t(("block" if engine.config.variant == "blocks" else "line") + str(hint_index))
		elif hint_action != "cell": text = _t(hint_action)
		_feedback.text = _t("hint_step") % text
	_render()
	_board.animate(action, index, code, previous)
	_mentor.respond(code, action, engine.mistakes, engine.moves, engine.status)
	if code in ["complete", "round"]: _sound("chime")
	elif code not in ["illegal", "locked", "incomplete"]:
		_sound("coin" if action == "cast" else ("flip" if engine.kind in ["draft", "memory"] else "wood"))
	# A short colour return provides feedback without shaking a reading surface.
	if _feedback_tween != null and _feedback_tween.is_valid(): _feedback_tween.kill()
	_feedback.modulate = Color("c28c63") if code in ["wrong", "mismatch"] else Color("87ad91")
	if Motion.reduce_motion: _feedback.modulate = Color.WHITE
	else:
		_feedback_tween = create_tween()
		_feedback_tween.tween_property(_feedback, "modulate", Color.WHITE, 0.28)

func _process(delta: float) -> void:
	if not is_visible_in_tree(): return
	engine.tick(delta)
	_board.queue_redraw()

func _board_action(action: String, index: int) -> void:
	# The illustrated surface and accessible buttons share the same legal gate.
	if _confirmed or engine.status != "active": return
	var button := _find_button(self, action, index)
	if button != null: _act(action, index)

func _inspect_balance(index: int) -> void:
	if _confirmed: return
	var totals: Array = engine.totals()
	_speak(I18n.t("lesson.stage.inspect_state") % [int(totals[index]), int(engine.state.target[index])], "inspect")

func _speak(text: String, mood: String) -> void:
	if _dialogue_tween != null and _dialogue_tween.is_valid(): _dialogue_tween.kill()
	if mood == "support": text += " " + I18n.t("lesson.stage.tip_%s" % engine.kind)
	_dialogue.text = _mentor.line("name") + " · " + text
	_dialogue.visible_characters = -1
	if not Motion.reduce_motion:
		_dialogue.visible_characters = 0
		_dialogue_tween = create_tween()
		_dialogue_tween.tween_property(_dialogue, "visible_characters", _dialogue.get_total_character_count(), minf(1.3, text.length() * 0.018))

func _dialogue_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if _dialogue_tween != null and _dialogue_tween.is_valid(): _dialogue_tween.kill()
		_dialogue.visible_characters = -1

func _sound(kind: String) -> void:
	var director := get_node_or_null("/root/AudioDirector")
	if director != null: director.sfx(kind)
