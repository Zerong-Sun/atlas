extends SceneTree

const Driver = preload("res://tests/story_ui_driver.gd")
var failures := 0
var elapsed := 0.0
var screenshots := false
var captures := 0

func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 180:
		printerr("FAIL: challenge UI watchdog")
		quit(1)
	return false

func _init() -> void:
	screenshots = "--capture" in OS.get_cmdline_user_args() or OS.get_environment("FATEQUEST_CAPTURE_CHALLENGES") == "1"
	call_deferred("_run")

func _ok(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("FAIL: " + message)

func _run() -> void:
	root.size = Vector2i(1280, 720)
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	main._begin(main.db.get_record("merchant"))
	await process_frame
	var learned: Array = main.state.learned_divinations.duplicate()
	for locale in (["zh"] if screenshots else ["zh", "en"]):
		I18n.load_lang(locale)
		for method in main.divination_catalog.methods():
			var capture_method := OS.get_environment("FATEQUEST_CAPTURE_METHOD")
			if screenshots and not capture_method.is_empty() and method != capture_method: continue
			main._practice_annex_method(method)
			await process_frame
			await process_frame
			var view = main._lesson_ui._challenge_view
			_ok(is_instance_valid(view), "new game is reachable: " + method)
			if not is_instance_valid(view): continue
			_ok(view.engine.status == "active", "starts active: " + method)
			_ok(main._lesson_ui.get_global_rect().size.y <= root.size.y, "lesson fits viewport height: " + locale + "/" + method + " " + str(main._lesson_ui.size))
			_ok(main._lesson_ui.get_global_rect().size.x <= root.size.x, "lesson fits viewport width: " + method)
			_ok(not view._rules.text.begins_with("challenge."), "rules are translated")
			if screenshots:
				await _capture(method)
				if view.engine.kind == "cast":
					view._find_button(view, "cast", 0).pressed.emit()
					await _capture(method + "-cast")
					while view.engine.status == "active":
						var move: Dictionary = view.engine.suggestion()
						view._find_button(view, String(move.action), int(move.get("index", 0))).pressed.emit()
						await process_frame
					await _capture(method + "-complete")
				elif view.engine.kind == "memory":
					view._find_button(view, "hide", 0).pressed.emit()
					await _capture(method + "-covered")
					view._find_button(view, "cell", 0).pressed.emit()
					await _capture(method + "-revealed")
				elif view.engine.kind == "trace":
					view._find_button(view, "hide", 0).pressed.emit()
					await _capture(method + "-covered")
			if screenshots:
				main._on_lesson_skipped(method)
				continue
			_ok(await Driver.finish_lesson(main, method), "complete through visible controls: " + locale + "/" + method)
			print("CHALLENGE_UI: played " + locale + "/" + method)
			_ok(main.state.learned_divinations == learned, "annex cannot teach journey methods: " + method)
	# Failure, retry, assist, stale input and explicit completion boundaries.
	main._practice_annex_method("jiaobei")
	await process_frame
	var view = main._lesson_ui._challenge_view
	var before: Array = main.state.learned_divinations.duplicate()
	view._find_button(view, "cast", 0).pressed.emit()
	for i in 3:
		var wrong := (int(view.engine.state.answer) + 1) % 3
		view._find_button(view, "choose", wrong).pressed.emit()
		view._find_button(view, "submit", 0).pressed.emit()
	_ok(view.engine.status == "failed" and main._lesson_layer.visible, "failure keeps retry visible")
	_ok(main.state.learned_divinations == before, "failed game grants no method")
	view._find_button(view, "retry", 0).pressed.emit()
	view._find_button(view, "hint", 0).pressed.emit()
	_ok(view.engine.assisted and view.engine.status == "active", "hint never auto-passes")
	view._find_button(view, "leave", 0).pressed.emit()
	await process_frame
	_ok(not main._lesson_layer.visible and main.state.learned_divinations == before, "leave does not grant learning")
	if screenshots:
		UiScale.high_contrast = true
		main._practice_annex_method("tarot")
		await process_frame
		await _capture("tarot-high-contrast")
		UiScale.high_contrast = false
	print("CHALLENGE_UI: %s · %s" % ["PASS" if failures == 0 else "FAIL", "%d instrument screenshots" % captures if screenshots else "all 24 games in zh/en, completion/failure/retry/leave"])
	quit(0 if failures == 0 else 1)

func _capture(name: String) -> void:
	captures += 1
	await create_timer(1.4).timeout
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute("res://build/playtest/unified")
	root.get_texture().get_image().save_png("res://build/playtest/unified/%s.png" % name)
