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
	var db := ContentDb.new()
	db.load_all()
	var role_record: Dictionary = {}
	for candidate in db.get_table("retainers"):
		if not (candidate.get("roles", []) as Array).is_empty():
			role_record = candidate
			break
	_ok(not role_record.is_empty(), "fixture has a role-bearing retainer")
	st.retainers = [{
		"id": role_record.get("id", ""),
		"present": true,
	}]
	var role := String((role_record.get("roles", []) as Array)[0])
	var db_conditions := ConditionEvaluator.new(db)
	_ok(db_conditions.evaluate({"has_retainer": {"role": role}}, st),
		"has_retainer resolves authored role through database")
	st.retainers[0]["present"] = false
	_ok(not db_conditions.evaluate({"has_retainer": {"role": role}}, st),
		"absent retainer does not satisfy role")
	st.retainers[0]["present"] = true

	# showWhen controls visibility independently from needs. The authored index
	# remains stable so a hidden first choice cannot shift the second choice.
	var machine := EventMachine.new(db, db_conditions, EffectExecutor.new())
	var synthetic := {
		"id": "ev-test-visibility",
		"choices": [
			{"label": "hidden", "showWhen": {"flags": ["fl-hidden"]},
				"effects": [{"op": "flag", "value": "fl-wrong", "reason": "test"}]},
			{"label": "shown", "effects": [
				{"op": "flag", "value": "fl-right", "reason": "test"}]},
		],
	}
	var states := machine.choice_states(synthetic, st)
	_ok(not states[0]["visible"] and not states[0]["enabled"],
		"showWhen hides and disables choice")
	_ok(states[1]["visible"] and states[1]["enabled"],
		"following authored index remains available")
	var hidden_result := machine.choose(synthetic, 0, st, Rng.new("hidden-test"))
	_ok(not hidden_result.resolved and hidden_result.applied.is_empty() \
		and not st.flags.has("fl-wrong"),
		"hidden choice cannot be invoked by index")
	var shown_result := machine.choose(synthetic, 1, st, Rng.new("shown-test"))
	_ok(shown_result.resolved and st.flags.get("fl-right", false),
		"visible choice resolves at original index")

	var learning := {
		"id": "ev-test-learning-gate",
		"when": {"cities": ["lop"]},
		"choices": [{
			"label": "learn",
			"effects": [
				{"op": "coins", "value": -10, "reason": "lesson-fee"},
				{"op": "learn_divination", "value": "iching",
					"reason": "lesson-complete"},
			],
		}],
	}
	var learning_coins := st.coins
	var bypass := machine.choose(learning, 0, st, Rng.new("lesson-bypass"))
	_ok(not bypass.resolved and bypass.applied.is_empty() and st.coins == learning_coins \
		and "iching" not in st.learned_divinations,
		"learning choice cannot bypass lesson or charge partial fee")
	machine.choose(learning, 0, st, Rng.new("lesson-passed"), {
		"lesson_passed": "iching",
	})
	_ok("iching" in st.learned_divinations and st.coins == learning_coins - 10,
		"passed lesson atomically unlocks authored learning choice")
	var branch_bypass := {
		"id": "ev-test-branch-learning-gate",
		"choices": [{
			"label": "branch-learn",
			"pass": {"effects": [{
				"op": "learn_divination", "value": "tarot",
				"reason": "test-branch",
			}]},
		}],
	}
	var branch_result := machine.choose(branch_bypass, 0, st, Rng.new("branch-bypass"))
	_ok(not branch_result.resolved and branch_result.applied.is_empty() \
		and "tarot" not in st.learned_divinations,
		"learning hidden in an outcome branch cannot bypass its lesson")
	var stale := learning.duplicate(true)
	stale["when"] = {"cities": ["zayton"]}
	var stale_coins := st.coins
	var stale_result := machine.choose(stale, 0, st, Rng.new("stale-event"))
	_ok(not stale_result.resolved and stale_result.applied.is_empty() \
		and st.coins == stale_coins,
		"event condition is rechecked when a stale UI choice resolves")
	var committed_result := machine.choose(stale, 0, st,
		Rng.new("committed-event"), {
			"lesson_passed": "iching",
			"event_committed": true,
		})
	_ok(committed_result.resolved,
		"queued consequence remains resolvable after its candidate condition changes")

	# ------------------------------------------------ durable consequence FIFO
	var ex := EffectExecutor.new()
	var queued := ex.execute(st, [
		{"op": "queue_event", "value": "ev-after-a", "reason": "test-chain-a"},
		{"op": "queue_event", "value": "ev-after-b", "reason": "test-chain-b"},
	], {"event_id": "queue-test"})
	_ok(st.pending_events == ["ev-after-a", "ev-after-b"], "consequences queue in authored order")
	_ok(queued.queued_events == ["ev-after-a", "ev-after-b"], "result reports queued consequences")
	ex.execute(st, [{"op": "dequeue_event", "value": "ev-after-a", "reason": "test-open"}])
	_ok(st.pending_events == ["ev-after-b"], "dequeue consumes FIFO head only")

	print("test_narrative: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
