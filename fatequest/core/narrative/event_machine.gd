class_name EventMachine
extends RefCounted

## Picks and resolves events. See docs/CODE_PLAN.md §6.

var db: ContentDb
var conditions: ConditionEvaluator
var executor: EffectExecutor


func _init(p_db: ContentDb, p_cond: ConditionEvaluator, p_exec: EffectExecutor) -> void:
	db = p_db
	conditions = p_cond
	executor = p_exec


func candidates(kind: String, state: WorldState, ctx: Dictionary = {}) -> Array:
	var out: Array = []
	for e in db.get_table("events"):
		if e.get("kind", "") != kind:
			continue
		if e.get("once", false) and state.once_fired.get(e["id"], false):
			continue
		if not conditions.evaluate(e.get("when", {}), state, ctx):
			continue
		out.append(e)
	return out


## Deterministic pick: the fork label includes the location and the day, so the
## same arrival on the same date always yields the same encounter, and a player
## cannot reroll an event by re-entering a city.
func pick(kind: String, state: WorldState, rng: Rng, ctx: Dictionary = {}) -> Dictionary:
	var list := candidates(kind, state, ctx)
	if list.is_empty():
		return {}
	list.sort_custom(func(a, b): return int(b.get("priority", 0)) < int(a.get("priority", 0)))
	var top: Array = list.filter(func(e): return int(e.get("priority", 0)) == int(list[0].get("priority", 0)))
	var label := "event:%s:%s:%s" % [kind, state.city, str(ctx.get("jdn", 0))]
	return top[rng.fork(label).next_int(top.size())]


## Which choices the player may take, and why the others are barred.
func choice_states(ev: Dictionary, state: WorldState, ctx: Dictionary = {}) -> Array:
	var out: Array = []
	for ch in ev.get("choices", []):
		var needs = ch.get("needs", null)
		var ok := conditions.evaluate(needs, state, ctx)
		out.append({
			"choice": ch,
			"enabled": ok,
			"reasons": [] if ok else conditions.explain(needs, state, ctx),
		})
	return out


func choose(ev: Dictionary, index: int, state: WorldState, rng: Rng, ctx: Dictionary = {}) -> EffectExecutor.EffectResult:
	var choices: Array = ev.get("choices", [])
	if index < 0 or index >= choices.size():
		push_error("choice index %d out of range for %s" % [index, ev.get("id", "?")])
		return EffectExecutor.EffectResult.new()
	var ch: Dictionary = choices[index]

	# A once-event that already fired must not resolve again. pick() filters on
	# once_fired, but a city screen offering its sites directly bypasses pick —
	# so re-entering an explored place re-applied its effects. Idempotent ops
	# (codex, sticker) hid this; `coins` and `days` would have stacked.
	if ev.get("once", false) and state.once_fired.get(ev.get("id", ""), false):
		return EffectExecutor.EffectResult.new()

	if not conditions.evaluate(ch.get("needs", null), state, ctx):
		push_error("choice %d of %s is not available" % [index, ev.get("id", "?")])
		return EffectExecutor.EffectResult.new()

	var effects: Array = []
	var reading: Dictionary = {}

	# Cast through the open registry when a choice names a method. Authored
	# pass/fail branches remain as narrative extras after the cast effects.
	if ch.has("divination"):
		var mid := String(ch["divination"])
		if mid not in state.learned_divinations:
			push_error("divination '%s' used but not learned" % mid)
			return EffectExecutor.EffectResult.new()

		var dctx := DivinationContext.new(state, rng.fork("divcast:%s:%s" % [ev.get("id", "?"), str(index)]))
		dctx.jdn = state.jdn
		dctx.subject = String(ch.get("subject", ctx.get("subject", state.city)))
		dctx.question = String(ch.get("question", ""))
		dctx.spread = String(ch.get("spread", ""))
		dctx.exit_a = String(ch.get("exit_a", ctx.get("exit_a", "")))
		dctx.exit_b = String(ch.get("exit_b", ctx.get("exit_b", "")))
		dctx.birthdate_jdn = int(ctx.get("birthdate_jdn", state.birthdate_jdn))

		reading = DivinationRegistry.cast(mid, dctx)
		for e in reading.get("effects", []):
			effects.append(e)

		var fate_key := "rapport"
		var conf := 0.7
		var d := db.get_record(mid)
		if not d.is_empty():
			conf = float(d.get("outputs", {}).get("confidence", 0.7))
		var chance := divination_success_chance(conf, int(state.fate.get(fate_key, 15)))
		var roll := rng.fork("div:%s:%s" % [ev.get("id", "?"), str(index)]).next()
		var branch: String = "pass" if roll < chance else "fail"
		for e in ch.get(branch, {}).get("effects", []):
			var ee: Dictionary = e.duplicate(true)
			if String(ee.get("value", "")) == "$subject":
				ee["value"] = dctx.subject
			effects.append(ee)
	else:
		effects = ch.get("effects", [])

	var res := executor.execute(state, effects, {"rng": rng, "event_id": ev.get("id", "anon")})
	res.reading = reading
	if ev.get("once", false):
		state.once_fired[ev["id"]] = true
	return res


## Never 0%, never 100%. GDD §4.2: a "下下" fate is a different game, not a
## lost one — it must keep a real chance, and "上上" must keep a real risk.
static func divination_success_chance(confidence: float, fate_value: int) -> float:
	return clampf(confidence * (0.6 + 0.4 * fate_value / 31.0), 0.05, 0.95)
