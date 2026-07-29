class_name DivinationLesson
extends PanelContainer

## Placeholder presentation for the six data-driven lesson families. Formal
## art can replace these controls; DivinationLessonEngine remains authoritative.

signal passed(method: String)
signal failed(method: String)
signal skipped(method: String)

const LessonEngine = preload("res://core/divination/lesson_engine.gd")

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


func _ready() -> void:
	set_process(false)
	custom_minimum_size = Vector2(620, 430)
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)
	_title = Panels.heading("占法学习")
	root.add_child(_title)
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
	_title.text = String(lesson.get("title", method))
	_prompt.text = String(lesson.get("prompt", ""))
	var configured := _engine.configure(lesson)
	if not configured.get("ok", false):
		_status.text = "课程配置无效：%s" % ",".join(
			PackedStringArray(configured.get("errors", [])))
		_finished = false
		_rebuild_actions(false)
		return
	_build_round()


func _build_round() -> void:
	set_process(false)
	for child in _stage.get_children():
		child.queue_free()
	_status.text = "完成练习后才会习得；失败可重试，也可暂时离开。"
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


func _rebuild_actions(show_retry: bool) -> void:
	for child in _actions.get_children():
		child.queue_free()
	if show_retry:
		_actions.add_child(Panels.primary_button("再试一次", _retry))
	if _engine.assist_available():
		_actions.add_child(Panels.styled_button("导师辅助", _use_assist))
	_actions.add_child(Panels.styled_button("暂时离开，不学习", _leave))


func _build_order(rng: Rng) -> void:
	var steps: Array = _lesson.get("steps", [])
	var shuffled := steps.duplicate()
	for i in range(shuffled.size() - 1, 0, -1):
		var j := rng.fork("lesson-shuffle:%d" % i).next_int(i + 1)
		var tmp = shuffled[i]
		shuffled[i] = shuffled[j]
		shuffled[j] = tmp
	for step in shuffled:
		var text := String(step)
		_stage.add_child(Panels.styled_button(text, _pick_order_step.bind(text)))


func _pick_order_step(step: String) -> void:
	if _finished:
		return
	var result := _engine.pick_step(step)
	_status.text = "已完成：%s" % " → ".join(
		PackedStringArray(_engine.picked_steps))
	_handle_result(result, "次序无误，你记住了这套方法。", "仪式次序错了。")


func _build_interpret() -> void:
	var clues: Array = _lesson.get("clues", [])
	for i in clues.size():
		_stage.add_child(Panels.styled_button(
			"观察：%s" % String(clues[i]), _observe.bind(i)))
	var options: Array = _lesson.get("options", [])
	for i in options.size():
		_stage.add_child(Panels.styled_button(
			String(options[i]), _pick_interpret.bind(i)))


func _observe(index: int) -> void:
	var result := _engine.record_observation(index)
	if result.get("status") == "active":
		_status.text = "已记录 %d 条观察，再作有限度的判断。" % _engine.observations.size()


func _pick_interpret(index: int) -> void:
	var result := _engine.choose(index)
	_handle_result(result, "解读守住了方法的边界。",
		"这是一种武断解读，导师让你重新体会。")


func _build_balance() -> void:
	_status.text = "当前 %d / 目标 %d" % [
		_engine.total, int(_lesson.get("target", 0))]
	for value in _lesson.get("values", []):
		var n := int(value)
		_stage.add_child(Panels.styled_button("+%d 筹片" % n, _add_token.bind(n)))
	_stage.add_child(Panels.styled_button("重置筹片", _reset_tokens))


func _add_token(value: int) -> void:
	if _finished:
		return
	var target := int(_lesson.get("target", 0))
	var result := _engine.add_token(value)
	_status.text = "当前 %d / 目标 %d" % [_engine.total, target]
	_handle_result(result, "数与结构相合。", "筹片超过目标，结构失衡。")


func _reset_tokens() -> void:
	if _finished:
		return
	_engine.total = 0
	_status.text = "当前 0 / 目标 %d" % int(_lesson.get("target", 0))


func _build_timing() -> void:
	_timing_bar = ProgressBar.new()
	_timing_bar.min_value = 0
	_timing_bar.max_value = 100
	_timing_bar.show_percentage = false
	_timing_bar.custom_minimum_size = Vector2(0, 44)
	_stage.add_child(_timing_bar)
	_stage.add_child(Panels.primary_button("在时窗中定象", _stop_timing))
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
	_handle_result(result, "抓住了时窗。", "收手太早或太晚。")


func _build_throw() -> void:
	_throw_label = Panels.label("尚未投掷", UiScale.ui(), Palette.ink_soft())
	_stage.add_child(_throw_label)
	_stage.add_child(Panels.primary_button("投掷工具", _throw_tool))
	var options: Array = _lesson.get("options", [])
	for i in options.size():
		_stage.add_child(Panels.styled_button(
			String(options[i]), _pick_interpret.bind(i)))


func _throw_tool() -> void:
	var result := _engine.throw_tool(_rng)
	if result.get("status") != "active":
		return
	_throw_label.text = "第 %d/%d 次落定：象位 %d" % [
		int(result.get("throws_done", 0)),
		int(result.get("throws_required", 1)),
		int(result.get("throw", 0)) + 1,
	]
	_status.text = "完成规定次数后，选择守边界的解读。"


func _handle_result(result: Dictionary, pass_message: String,
		fail_message: String) -> void:
	var outcome := String(result.get("status", "invalid"))
	if outcome == "active":
		return
	if outcome == "invalid":
		_status.text = "当前操作尚不能执行：%s" % result.get("code", "")
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
		_status.text = "%s（第 %d 次）" % [fail_message, _engine.attempts]
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
			_status.text = "导师已慢速演示到最后一步，请你完成收尾。"
		"LESSON_ASSIST_NO_TIMING":
			_status.text = "已切换无计时模式；按下定象即可完成最后一步。"
		"LESSON_ASSIST_SOLUTION":
			_status.text = "导师提示一种组合：%s；请亲手放置。" % str(
				result.get("solution", []))
		"LESSON_ASSIST_CLUE":
			_status.text = "导师排除武断说法；请先记录观察，再亲自作答。"
		"LESSON_ASSIST_FINAL_THROW":
			_status.text = "导师演示了先前投掷，请你完成最后一掷并作答。"


func _leave() -> void:
	if _finished:
		return
	_finished = true
	set_process(false)
	if _engine.attempts > 0:
		failed.emit(_method)
	else:
		skipped.emit(_method)
