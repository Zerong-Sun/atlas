extends RefCounted

const LessonEngine = preload("res://core/divination/lesson_engine.gd")

var _ok := true


func run() -> bool:
	var db := ContentDb.new()
	_check(db.load_all(), "content database loads")
	var lessons: Array = db.get_table("divination_lessons")
	_check(lessons.size() == 24, "all 24 lesson placeholders load")
	var covered: Dictionary = {}
	for lesson in lessons:
		var engine = LessonEngine.new()
		var configured := engine.configure(lesson)
		_check(configured.get("ok", false),
			"lesson %s validates" % lesson.get("id", "?"))
		covered[String(configured.get("type", ""))] = true
	for family in LessonEngine.TYPES:
		_check(covered.has(family), "lesson family %s is covered" % family)

	_test_arrange_assist()
	_test_observe()
	_test_timing_assist()
	_test_deduce()
	_test_throw()
	_test_form()
	print("test_lesson_engine: ", "PASS" if _ok else "FAIL")
	return _ok


func _test_arrange_assist() -> void:
	var lesson := {
		"method": "test-arrange", "type": "arrange",
		"steps": ["one", "two", "three"],
	}
	var engine = LessonEngine.new()
	_check(engine.configure(lesson).get("ok", false), "arrange config")
	_check(engine.pick_step("two").get("status") == "failed",
		"wrong arrange step fails")
	engine.reset_round()
	_check(engine.pick_step("three").get("status") == "failed",
		"second wrong arrange step fails")
	_check(engine.assist_available(), "assist opens after two failures")
	engine.reset_round()
	_check(engine.apply_assist().get("code") == "LESSON_ASSIST_FINAL_STEP",
		"arrange assist prepares final step")
	_check(engine.picked_steps == ["one", "two"],
		"arrange assist does not complete lesson")
	_check(engine.pick_step("three").get("status") == "passed",
		"player completes assisted arrange lesson")


func _test_observe() -> void:
	var lesson := {
		"method": "test-observe", "type": "observe",
		"clues": ["mark", "context"],
		"options": ["claim", "ask"], "answer": 1,
	}
	var engine = LessonEngine.new()
	_check(engine.configure(lesson).get("ok", false), "observe config")
	_check(engine.choose(1).get("code") == "LESSON_OBSERVE_FIRST",
		"observe answer is gated by recording clues")
	_check(engine.record_observation(0).get("status") == "active",
		"observation is recorded")
	_check(engine.choose(1).get("code") == "LESSON_OBSERVE_FIRST",
		"all required observations must be recorded")
	engine.record_observation(1)
	_check(engine.choose(1).get("status") == "passed",
		"bounded observation interpretation passes")


func _test_timing_assist() -> void:
	var lesson := {
		"method": "test-timing", "type": "timing",
		"window": [0.4, 0.6],
	}
	var engine = LessonEngine.new()
	_check(engine.configure(lesson).get("ok", false), "timing config")
	_check(engine.stop_timing(0.1).get("status") == "failed",
		"missed timing fails")
	engine.reset_round()
	_check(engine.stop_timing(0.9).get("status") == "failed",
		"second missed timing fails")
	engine.reset_round()
	_check(engine.apply_assist().get("code") == "LESSON_ASSIST_NO_TIMING",
		"timing assist removes clock")
	_check(not engine.finished, "timing assist does not auto-pass")
	_check(engine.stop_timing(0.0).get("status") == "passed",
		"player confirms assisted timing lesson")


func _test_deduce() -> void:
	var engine = LessonEngine.new()
	_check(engine.configure({
		"method": "test-deduce", "type": "deduce",
		"values": [2, 3], "target": 7,
	}).get("ok", false), "reachable deduction config")
	_check(engine.add_token(2).get("status") == "active",
		"partial deduction remains active")
	_check(engine.add_token(2).get("status") == "active",
		"second deduction token remains active")
	_check(engine.add_token(3).get("status") == "passed",
		"exact deduction target passes")
	_check(not LessonEngine.new().configure({
		"method": "bad-deduce", "type": "deduce",
		"values": [4], "target": 3,
	}).get("ok", true), "unreachable deduction is rejected")


func _test_throw() -> void:
	var lesson := {
		"method": "test-throw", "type": "throw",
		"throws": 2, "faces": 4, "options": ["keep", "discard"], "answer": 0,
	}
	var first = LessonEngine.new()
	var second = LessonEngine.new()
	_check(first.configure(lesson).get("ok", false), "throw config")
	second.configure(lesson)
	_check(first.choose(0).get("code") == "LESSON_THROW_FIRST",
		"throw interpretation is gated by interaction")
	var a: Dictionary = first.throw_tool(Rng.new("77"))
	var b: Dictionary = second.throw_tool(Rng.new("77"))
	_check(a.get("throw") == b.get("throw"), "throw outcome is deterministic")
	first.throw_tool(Rng.new("77"))
	_check(first.throw_tool(Rng.new("77")).get("code") \
		== "LESSON_THROWS_COMPLETE", "throws are capped at configured count")
	_check(first.choose(0).get("status") == "passed",
		"completed throw and interpretation pass")


func _test_form() -> void:
	var engine = LessonEngine.new()
	engine.configure({
		"method": "test-form", "type": "form",
		"steps": ["base", "house", "mark"],
	})
	_check(engine.pick_step("base").get("status") == "active",
		"form starts with player action")
	engine.pick_step("house")
	_check(engine.pick_step("mark").get("status") == "passed",
		"generated form completes in sequence")


func _check(value: bool, message: String) -> void:
	if value:
		return
	_ok = false
	printerr("test_lesson_engine: ", message)
