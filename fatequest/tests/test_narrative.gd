extends RefCounted

## F-6: ConditionEvaluator any/all/not and unknown-key refusal.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c: printerr("  FAIL: %s" % w); _f += 1


func run() -> bool:
	var ev := ConditionEvaluator.new()
	var st := WorldState.new()
	st.city = "lop"
	st.flags["fl-a"] = true
	st.coins = 100

	_ok(ev.evaluate({"any": []}, st) == false, "any:[] is false")
	_ok(ev.evaluate({"all": []}, st) == true, "all:[] is true")
	_ok(ev.evaluate({"cities": ["lop"]}, st) == true, "cities match")
	_ok(ev.evaluate({"cities": ["zayton"]}, st) == false, "cities miss")
	_ok(ev.evaluate({"not": {"cities": ["lop"]}}, st) == false, "not cities")
	_ok(ev.evaluate({"not": {"cities": ["zayton"]}}, st) == true, "not miss")
	_ok(ev.evaluate({"any": [{"cities": ["zayton"]}, {"cities": ["lop"]}]}, st) == true, "any or")
	_ok(ev.evaluate({"all": [{"cities": ["lop"]}, {"flags": ["fl-a"]}]}, st) == true, "all and")
	_ok(ev.evaluate({"all": [{"cities": ["lop"]}, {"flags": ["fl-missing"]}]}, st) == false, "all fails")
	_ok(ev.evaluate({"city": "lop"}, st) == false, "unknown key refuses")
	_ok(ev.evaluate({"coins": {"min": 50}}, st) == true, "coins min")
	_ok(ev.evaluate({"coins": {"min": 500}}, st) == false, "coins min fail")

	# ------------------------------------------------- etiquette & retainers
	st.etiquette = {"china": 3}
	st.retainers = [{"id": "npc-guard"}]
	_ok(ev.evaluate({"etiquette": {"scope": "china", "value": 2}}, st) == true, "etiquette meets threshold")
	_ok(ev.evaluate({"etiquette": {"scope": "china", "value": 5}}, st) == false, "etiquette below threshold")
	_ok(ev.evaluate({"etiquette": {"scope": "steppe", "value": 1}}, st) == false, "unvisited region = 0")
	_ok(ev.evaluate({"has_retainer": {"id": "npc-guard"}}, st) == true, "has_retainer by id")
	_ok(ev.evaluate({"has_retainer": {"id": "npc-missing"}}, st) == false, "has_retainer missing id")
	_ok(ev.evaluate({"has_retainer": {}}, st) == false, "has_retainer empty = false")

	print("test_narrative: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
