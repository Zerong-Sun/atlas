extends SceneTree

const Art = preload("res://game/ui/lesson_art.gd")
var failures := 0

func _init() -> void:
	call_deferred("_run")

func _ok(value: bool, message: String) -> void:
	if not value:
		failures += 1
		printerr("FAIL: " + message)

func _run() -> void:
	root.size = Vector2i(1280, 720)
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	main._begin(main.db.get_record("merchant"))
	await process_frame
	var cast: Dictionary = {}
	for locale in ["zh", "en"]:
		I18n.load_lang(locale)
		for method in main.divination_catalog.methods():
			main._practice_annex_method(method)
			await process_frame
			await process_frame
			var view = main._lesson_ui._challenge_view
			var engine = view.engine
			var board = view._board
			cast[view._mentor.mentor_id] = true
			_ok(view._mentor.portrait.texture != null, "portrait " + method)
			_ok(Art.prop(Art.instrument(engine.config)) != null, "instrument " + method)
			_ok(main._lesson_ui._frame.scene != null, "scene " + method)
			_ok(not view._dialogue.text.contains("lesson."), "translated dialogue " + locale + method)
			var moves: int = engine.moves
			view._mentor.talk()
			var conversation: String = view._dialogue.text
			view._mentor.talk()
			_ok(conversation != view._dialogue.text, "talk alternates " + method)
			view._mentor.inspect()
			_ok(engine.moves == moves and not engine.assisted, "conversation has no puzzle side effects")
			# Readable feedback remains available with all decorative motion disabled.
			Motion.reduce_motion = true
			view._mentor.react("tease", true)
			_ok(view._dialogue.visible_characters == -1, "reduced motion reveals dialogue immediately")
			view._mentor.respond("wrong", "submit", 2, 0, "active")
			_ok(view._mentor._last_mood == "support", "repeat mistakes switch to support")
			_ok(view._dialogue.text.contains(I18n.t("lesson.stage.tip_%s" % engine.kind)), "support includes mechanism advice")
			var point := Vector2(175, 65)
			match engine.kind:
				"parity": point = Vector2(253, 68)
				"rings": point = Vector2(board.size.x * 0.5, 96)
				"route": point = board._grid_point(int(engine.state.solution[1]))
				"trace":
					point = board._grid_point(int(engine.state.target[0]))
					_ok(board.action_at(point).is_empty(), "preview cannot change a trace")
					view._find_button(view, "hide", 0).pressed.emit()
				"memory":
					point = Vector2(50, 65)
					_ok(board.action_at(point).is_empty(), "preview cannot turn a stave")
					view._find_button(view, "hide", 0).pressed.emit()
				"draft": point = Vector2(55, 60)
				"cycle": point = Vector2(board.size.x * 0.5, 44)
				"numbers": point = Vector2(65, 95)
				"timing": view._find_button(view, "hint", 0).pressed.emit()
			var target: Dictionary = board.action_at(point)
			_ok(not target.is_empty(), "instrument has a direct hit target " + method)
			var before: Dictionary = engine.state.duplicate(true)
			var click := InputEventMouseButton.new()
			click.position = point
			click.button_index = MOUSE_BUTTON_LEFT
			click.pressed = true
			board._gui_input(click)
			_ok(engine.state != before if engine.kind != "draft" else engine.state == before, "direct gesture obeys game semantics " + method)
			_ok(board._effect == 0, "reduced motion suppresses particles")
			if engine.kind == "rings":
				_ok(board.action_at(point, true).action == "left", "ring reverse gesture")
			if engine.kind == "route":
				var route_before: Array = engine.state.path.duplicate()
				view._board_action("cell", int(engine.state.blocked[0]))
				_ok(engine.state.path == route_before, "blocked terrain cannot bypass disabled buttons")
			engine.status = "failed"
			_ok(board.action_at(point).is_empty(), "failed challenge rejects instrument input")
			main._on_lesson_skipped(method)
			Motion.reduce_motion = false
	_ok(cast.size() == 9, "nine distinct mentors cover all methods")
	# Contrast mode uses the project's contrast paper, not a hardcoded pale bubble.
	UiScale.high_contrast = true
	main._practice_annex_method("tarot")
	await process_frame
	var style = main._lesson_ui._challenge_view._dialogue_panel.get_theme_stylebox("panel")
	_ok(style.bg_color == Palette.panel_style().bg_color, "dialogue respects high contrast")
	UiScale.high_contrast = false
	print("LESSON_PRESENTATION: %s · 24 methods × zh/en, nine mentors, direct input, support, reduced motion, contrast" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
