class_name DivinationLessonEngine
extends RefCounted

## Pure, data-driven lesson evaluator. Art and animation are deliberately absent:
## the UI may replace every placeholder control without changing pass/fail rules.

const TYPES := ["throw", "arrange", "observe", "timing", "deduce", "form"]
const LEGACY_TYPES := {
	"order": "arrange",
	"interpret": "observe",
	"balance": "deduce",
}

var lesson: Dictionary = {}
var type := ""
var attempts := 0
var finished := false
var passed := false
var picked_steps: Array[String] = []
var total := 0
var throws_done := 0
var observations: Array[int] = []
var no_timing := false


func configure(source: Dictionary) -> Dictionary:
	lesson = source.duplicate(true)
	type = String(lesson.get("type", ""))
	type = String(LEGACY_TYPES.get(type, type))
	reset_round()
	attempts = 0
	var errors := validate()
	return {"ok": errors.is_empty(), "errors": errors, "type": type}


func validate() -> Array[String]:
	var errors: Array[String] = []
	if type not in TYPES:
		errors.append("LESSON_UNKNOWN_TYPE")
	if String(lesson.get("method", "")).is_empty():
		errors.append("LESSON_METHOD_REQUIRED")
	match type:
		"arrange", "form":
			if (lesson.get("steps", []) as Array).size() < 3:
				errors.append("LESSON_STEPS_REQUIRED")
		"observe":
			var clues: Array = lesson.get("clues", [])
			var options: Array = lesson.get("options", [])
			var answer := int(lesson.get("answer", -1))
			if clues.is_empty():
				errors.append("LESSON_CLUES_REQUIRED")
			if options.size() < 2 or answer < 0 or answer >= options.size():
				errors.append("LESSON_ANSWER_INVALID")
		"timing":
			var window: Array = lesson.get("window", [])
			if window.size() != 2 or float(window[0]) < 0.0 \
					or float(window[1]) > 1.0 or float(window[0]) >= float(window[1]):
				errors.append("LESSON_WINDOW_INVALID")
		"deduce":
			var values: Array = lesson.get("values", [])
			var target := int(lesson.get("target", 0))
			if values.is_empty() or target <= 0 or _solution(values, target).is_empty():
				errors.append("LESSON_TARGET_UNREACHABLE")
		"throw":
			var options: Array = lesson.get("options", [])
			var answer := int(lesson.get("answer", -1))
			if int(lesson.get("throws", 0)) < 1:
				errors.append("LESSON_THROWS_REQUIRED")
			if int(lesson.get("faces", 0)) < 2:
				errors.append("LESSON_FACES_INVALID")
			if options.size() < 2 or answer < 0 or answer >= options.size():
				errors.append("LESSON_ANSWER_INVALID")
	return errors


func reset_round() -> void:
	finished = false
	passed = false
	picked_steps.clear()
	total = 0
	throws_done = 0
	observations.clear()
	no_timing = false


func pick_step(step: String) -> Dictionary:
	if finished or type not in ["arrange", "form"]:
		return _invalid("LESSON_ACTION_INVALID")
	var steps: Array = lesson.get("steps", [])
	var index := picked_steps.size()
	if index >= steps.size() or step != String(steps[index]):
		return _fail("LESSON_STEP_WRONG")
	picked_steps.append(step)
	if picked_steps.size() == steps.size():
		return _pass("LESSON_SEQUENCE_COMPLETE")
	return _active("LESSON_STEP_OK")


func choose(index: int) -> Dictionary:
	if finished or type not in ["observe", "throw"]:
		return _invalid("LESSON_ACTION_INVALID")
	if type == "observe":
		var required := int(lesson.get(
			"required_observations", (lesson.get("clues", []) as Array).size()))
		if observations.size() < required:
			return _invalid("LESSON_OBSERVE_FIRST")
	if type == "throw" and throws_done < int(lesson.get("throws", 1)):
		return _invalid("LESSON_THROW_FIRST")
	if index == int(lesson.get("answer", -1)):
		return _pass("LESSON_INTERPRETATION_OK")
	return _fail("LESSON_INTERPRETATION_WRONG")


func add_token(value: int) -> Dictionary:
	if finished or type != "deduce" or value not in lesson.get("values", []):
		return _invalid("LESSON_ACTION_INVALID")
	total += value
	var target := int(lesson.get("target", 0))
	if total == target:
		return _pass("LESSON_TARGET_COMPLETE")
	if total > target:
		return _fail("LESSON_TARGET_EXCEEDED")
	return _active("LESSON_TOKEN_OK")


func stop_timing(value: float) -> Dictionary:
	if finished or type != "timing":
		return _invalid("LESSON_ACTION_INVALID")
	var window: Array = lesson.get("window", [0.45, 0.60])
	if no_timing or (value >= float(window[0]) and value <= float(window[1])):
		return _pass("LESSON_TIMING_OK")
	return _fail("LESSON_TIMING_WRONG")


func throw_tool(rng: Rng) -> Dictionary:
	if finished or type != "throw":
		return _invalid("LESSON_ACTION_INVALID")
	if throws_done >= int(lesson.get("throws", 1)):
		return _invalid("LESSON_THROWS_COMPLETE")
	throws_done += 1
	var faces := maxi(2, int(lesson.get("faces", 2)))
	var result := rng.fork("throw:%d" % throws_done).next_int(faces)
	var out := _active("LESSON_THROW_RECORDED")
	out["throw"] = result
	out["throws_done"] = throws_done
	out["throws_required"] = int(lesson.get("throws", 1))
	return out


func record_observation(index: int) -> Dictionary:
	if finished or type != "observe":
		return _invalid("LESSON_ACTION_INVALID")
	var clues: Array = lesson.get("clues", [])
	if index < 0 or index >= clues.size():
		return _invalid("LESSON_OBSERVATION_INVALID")
	if index not in observations:
		observations.append(index)
	var out := _active("LESSON_OBSERVATION_RECORDED")
	out["observations"] = observations.duplicate()
	return out


func assist_available() -> bool:
	return attempts >= 2


func apply_assist() -> Dictionary:
	if not assist_available() or finished:
		return _invalid("LESSON_ASSIST_UNAVAILABLE")
	match type:
		"arrange", "form":
			var steps: Array = lesson.get("steps", [])
			picked_steps.clear()
			for i in maxi(0, steps.size() - 1):
				picked_steps.append(String(steps[i]))
			return _active("LESSON_ASSIST_FINAL_STEP")
		"timing":
			no_timing = true
			return _active("LESSON_ASSIST_NO_TIMING")
		"deduce":
			total = 0
			var out := _active("LESSON_ASSIST_SOLUTION")
			out["solution"] = _solution(lesson.get("values", []), int(lesson.get("target", 0)))
			return out
		"observe":
			var out := _active("LESSON_ASSIST_CLUE")
			out["clue"] = int(lesson.get("answer", 0))
			return out
		"throw":
			throws_done = maxi(0, int(lesson.get("throws", 1)) - 1)
			return _active("LESSON_ASSIST_FINAL_THROW")
	return _invalid("LESSON_ACTION_INVALID")


func _solution(values: Array, target: int) -> Array[int]:
	if target < 0:
		return []
	var clean: Array[int] = []
	for value in values:
		var n := int(value)
		if n > 0 and n not in clean:
			clean.append(n)
	clean.sort()
	var reachable: Array = []
	reachable.resize(target + 1)
	reachable[0] = []
	for sum in range(1, target + 1):
		for n in clean:
			if n <= sum and reachable[sum - n] != null:
				var candidate: Array = (reachable[sum - n] as Array).duplicate()
				candidate.append(n)
				reachable[sum] = candidate
				break
	if reachable[target] == null:
		return []
	var result: Array[int] = []
	for value in reachable[target]:
		result.append(int(value))
	return result


func _active(code: String) -> Dictionary:
	return {"status": "active", "code": code}


func _invalid(code: String) -> Dictionary:
	return {"status": "invalid", "code": code}


func _pass(code: String) -> Dictionary:
	finished = true
	passed = true
	return {"status": "passed", "code": code}


func _fail(code: String) -> Dictionary:
	attempts += 1
	finished = true
	passed = false
	return {
		"status": "failed",
		"code": code,
		"attempts": attempts,
		"assist_available": assist_available(),
	}
