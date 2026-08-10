class_name DivinationLesson
extends PanelContainer

## Presentation for the eight data-driven lesson families. Formal
## art can replace these controls; DivinationLessonEngine remains authoritative.

signal passed(method: String)
signal failed(method: String)
signal skipped(method: String)

const LessonEngine = preload("res://core/divination/lesson_engine.gd")
const DivinationResultView = preload("res://game/ui/divination_result.gd")

var _method := ""
var _lesson: Dictionary = {}
var _title: Label
var _prompt: RichTextLabel
var _stage: VBoxContainer
var _status: Label
var _timing_bar: ProgressBar
var _timing_started_ms := 0
var _finished := false
var _actions: HBoxContainer
var _engine = LessonEngine.new()
var _rng: Rng
var _throw_label: Label
var _ritual_icon: TextureRect
var _ritual_tween: Tween


func _ready() -> void:
	set_process(false)
	custom_minimum_size = Vector2(620, 430)
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)
	_title = Panels.heading(I18n.t("lesson.heading"))
	root.add_child(_title)
	_ritual_icon = TextureRect.new()
	_ritual_icon.custom_minimum_size = Vector2(0, 92)
	_ritual_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_ritual_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_ritual_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_ritual_icon)
	_prompt = RichTextLabel.new()
	_prompt.bbcode_enabled = true
	_prompt.fit_content = true
	_prompt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_prompt.add_theme_font_size_override("normal_font_size", UiScale.body())
	_prompt.add_theme_color_override("default_color", Palette.ink())
	root.add_child(_prompt)
	root.add_child(Panels.rule())
	_stage = VBoxContainer.new()
	_stage.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_stage.add_theme_constant_override("separation", Metrics.xs())
	root.add_child(_stage)
	_status = Panels.label("", UiScale.ui(), Palette.ink_soft())
	root.add_child(_status)
	_actions = HBoxContainer.new()
	_actions.add_theme_constant_override("separation", Metrics.sm())
	root.add_child(_actions)


func start(method: String, lesson: Dictionary, rng: Rng) -> void:
	_method = method
	_lesson = lesson
	_rng = rng
	_finished = false
	set_process(false)
	_ritual_icon.texture = DivinationResultView.ritual_texture(method)
	_title.text = I18n.t(String(lesson.get("title", method)))
	_prompt.text = I18n.t(String(lesson.get("prompt", "")))
	var configured := _engine.configure(lesson)
	if not configured.get("ok", false):
		_status.text = I18n.t("lesson.config_error") % ",".join(
			PackedStringArray(configured.get("errors", [])))
		_finished = false
		_rebuild_actions(false)
		return
	_build_round()
	_animate_ritual(String(lesson.get("ritual", {}).get("motion", "reveal")))


func _animate_ritual(style: String) -> void:
	if _ritual_tween != null and _ritual_tween.is_valid():
		_ritual_tween.kill()
	_ritual_icon.position = Vector2.ZERO
	_ritual_icon.rotation = 0.0
	_ritual_icon.scale = Vector2.ONE
	_ritual_icon.modulate.a = 0.0
	_ritual_tween = _ritual_icon.create_tween()
	_ritual_tween.set_parallel(true)
	_ritual_tween.tween_property(_ritual_icon, "modulate:a", 1.0,
		Motion.dur(0.35, Motion.Kind.FADE))
	if Motion.reduce_motion:
		return
	match style:
		"orbit":
			_ritual_icon.rotation = -0.09
			_ritual_tween.tween_property(_ritual_icon, "rotation", 0.09,
				Motion.dur(0.65, Motion.Kind.ROTATE)).set_trans(Tween.TRANS_SINE)
		"shuffle", "shake", "scatter":
			_ritual_icon.position.x = -14.0
			_ritual_tween.tween_property(_ritual_icon, "position:x", 14.0,
				Motion.dur(0.32, Motion.Kind.MOVE)).set_trans(Tween.TRANS_SINE)
		"flip":
			_ritual_icon.scale.x = 0.08
			_ritual_tween.tween_property(_ritual_icon, "scale:x", 1.0,
				Motion.dur(0.38, Motion.Kind.SCALE)).set_ease(Tween.EASE_OUT)
		"ripple", "smoke", "swirl", "tumble":
			_ritual_icon.scale = Vector2(0.88, 0.88)
			_ritual_tween.tween_property(_ritual_icon, "scale", Vector2.ONE,
				Motion.dur(0.48, Motion.Kind.SCALE)).set_ease(Tween.EASE_OUT)


func _build_round() -> void:
	set_process(false)
	for child in _stage.get_children():
		child.queue_free()
	_status.text = I18n.t("lesson.instructions")
	_rebuild_actions(false)
	match _engine.type:
		"arrange", "form":
			_build_order(_rng)
		"deduce":
			_build_balance()
		"timing":
			_build_timing()
		"throw":
			_build_throw()
		"observe":
			_build_interpret()
		"orient":
			_build_orient()
		"compare":
			_build_compare()


func _rebuild_actions(show_retry: bool) -> void:
	for child in _actions.get_children():
		child.queue_free()
	if show_retry:
		_actions.add_child(Panels.primary_button(I18n.t("lesson.retry"), _retry))
	if _engine.assist_available():
		_actions.add_child(Panels.styled_button(I18n.t("lesson.assist"), _use_assist))
	_actions.add_child(Panels.styled_button(I18n.t("lesson.leave"), _leave))


func _build_order(rng: Rng) -> void:
	var steps: Array = _lesson.get("steps", [])
	var shuffled := steps.duplicate()
	for i in range(shuffled.size() - 1, 0, -1):
		var j := rng.fork("lesson-shuffle:%d" % i).next_int(i + 1)
		var tmp = shuffled[i]
		shuffled[i] = shuffled[j]
		shuffled[j] = tmp
	for step in shuffled:
		var key := String(step)
		var text := I18n.t(key)
		_stage.add_child(Panels.styled_button(text, _pick_order_step.bind(key)))


func _pick_order_step(step: String) -> void:
	if _finished:
		return
	var result := _engine.pick_step(step)
	var done: PackedStringArray = []
	for k in _engine.picked_steps:
		done.append(I18n.t(String(k)))
	_status.text = I18n.t("lesson.completed_fmt") % " → ".join(done)
	_handle_result(result, I18n.t("lesson.order_pass"), I18n.t("lesson.order_fail"))


func _build_interpret() -> void:
	var clues: Array = _lesson.get("clues", [])
	for i in clues.size():
		_stage.add_child(Panels.styled_button(
			I18n.t("lesson.observe_fmt") % I18n.t(String(clues[i])), _observe.bind(i)))
	var options: Array = _lesson.get("options", [])
	for i in options.size():
		_stage.add_child(Panels.styled_button(
			I18n.t(String(options[i])), _pick_interpret.bind(i)))


func _observe(index: int) -> void:
	var result := _engine.record_observation(index)
	if result.get("status") == "active":
		_status.text = I18n.t("lesson.observed_fmt") % _engine.observations.size()


func _pick_interpret(index: int) -> void:
	var result := _engine.choose(index)
	_handle_result(result, I18n.t("lesson.interpret_pass"),
		I18n.t("lesson.interpret_fail"))


func _build_orient() -> void:
	for i in (_lesson.get("directions", []) as Array).size():
		var key := String(_lesson.get("directions", [])[i])
		_stage.add_child(Panels.styled_button(I18n.t(key), _pick_orientation.bind(i)))


func _pick_orientation(index: int) -> void:
	var result := _engine.choose(index)
	_handle_result(result, I18n.t("lesson.orient_pass"), I18n.t("lesson.orient_fail"))


func _build_compare() -> void:
	for i in (_lesson.get("pairs", []) as Array).size():
		var pair: Array = _lesson.get("pairs", [])[i]
		var label := "%s  ↔  %s" % [I18n.t(String(pair[0])), I18n.t(String(pair[1]))]
		_stage.add_child(Panels.styled_button(label, _pick_comparison.bind(i)))


func _pick_comparison(index: int) -> void:
	var result := _engine.choose(index)
	_handle_result(result, I18n.t("lesson.compare_pass"), I18n.t("lesson.compare_fail"))


func _build_balance() -> void:
	_status.text = I18n.t("lesson.balance_fmt") % [
		_engine.total, int(_lesson.get("target", 0))]
	for value in _lesson.get("values", []):
		var n := int(value)
		_stage.add_child(Panels.styled_button(I18n.t("lesson.add_token_fmt") % n, _add_token.bind(n)))
	_stage.add_child(Panels.styled_button(I18n.t("lesson.reset_tokens"), _reset_tokens))


func _add_token(value: int) -> void:
	if _finished:
		return
	var target := int(_lesson.get("target", 0))
	var result := _engine.add_token(value)
	_status.text = I18n.t("lesson.balance_fmt") % [_engine.total, target]
	_handle_result(result, I18n.t("lesson.balance_pass"), I18n.t("lesson.balance_fail"))


func _reset_tokens() -> void:
	if _finished:
		return
	_engine.total = 0
	_status.text = I18n.t("lesson.balance_fmt") % [0, int(_lesson.get("target", 0))]


func _build_timing() -> void:
	_timing_bar = ProgressBar.new()
	_timing_bar.min_value = 0
	_timing_bar.max_value = 100
	_timing_bar.show_percentage = false
	_timing_bar.custom_minimum_size = Vector2(0, 44)
	_stage.add_child(_timing_bar)
	_stage.add_child(Panels.primary_button(I18n.t("lesson.timing_stop"), _stop_timing))
	_timing_started_ms = Time.get_ticks_msec()
	set_process(true)


func _process(_delta: float) -> void:
	if _timing_bar == null or _finished:
		return
	var elapsed := float(Time.get_ticks_msec() - _timing_started_ms) / 1000.0
	_timing_bar.value = (sin(elapsed * 2.8 - PI * 0.5) * 0.5 + 0.5) * 100.0


func _stop_timing() -> void:
	var value := float(_timing_bar.value) / 100.0
	var result := _engine.stop_timing(value)
	_handle_result(result, I18n.t("lesson.timing_pass"), I18n.t("lesson.timing_fail"))


func _build_throw() -> void:
	_throw_label = Panels.label(I18n.t("lesson.not_cast"), UiScale.ui(), Palette.ink_soft())
	_stage.add_child(_throw_label)
	_stage.add_child(Panels.primary_button(I18n.t("lesson.throw_tool"), _throw_tool))
	var options: Array = _lesson.get("options", [])
	for i in options.size():
		_stage.add_child(Panels.styled_button(
			I18n.t(String(options[i])), _pick_interpret.bind(i)))


func _throw_tool() -> void:
	var result := _engine.throw_tool(_rng)
	if result.get("status") != "active":
		return
	_throw_label.text = I18n.t("lesson.throw_fmt") % [
		int(result.get("throws_done", 0)),
		int(result.get("throws_required", 1)),
		int(result.get("throw", 0)) + 1,
	]
	_status.text = I18n.t("lesson.after_throw")


func _handle_result(result: Dictionary, pass_message: String,
		fail_message: String) -> void:
	var outcome := String(result.get("status", "invalid"))
	if outcome == "active":
		return
	if outcome == "invalid":
		_status.text = I18n.t("lesson.operation_invalid") % result.get("code", "")
		return
	set_process(false)
	for child in _stage.get_children():
		if child is Button:
			(child as Button).disabled = true
	if outcome == "passed":
		_finished = true
		_status.text = pass_message
		_rebuild_actions(false)
		passed.emit(_method)
	else:
		_status.text = I18n.t("lesson.fail_fmt") % [fail_message, _engine.attempts]
		_rebuild_actions(true)


func _retry() -> void:
	_engine.reset_round()
	_build_round()


func _use_assist() -> void:
	_engine.reset_round()
	var result := _engine.apply_assist()
	_build_round()
	match result.get("code", ""):
		"LESSON_ASSIST_FINAL_STEP":
			_status.text = I18n.t("lesson.assist_final_step")
		"LESSON_ASSIST_NO_TIMING":
			_status.text = I18n.t("lesson.assist_no_timing")
		"LESSON_ASSIST_SOLUTION":
			_status.text = I18n.t("lesson.assist_solution") % str(
				result.get("solution", []))
		"LESSON_ASSIST_CLUE":
			_status.text = I18n.t("lesson.assist_clue")
		"LESSON_ASSIST_FINAL_THROW":
			_status.text = I18n.t("lesson.assist_final_throw")


func _leave() -> void:
	if _finished:
		return
	_finished = true
	set_process(false)
	if _engine.attempts > 0:
		failed.emit(_method)
	else:
		skipped.emit(_method)
