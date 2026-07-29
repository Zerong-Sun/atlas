extends Node

## The ONLY Node that holds kernel state. See docs/CODE_PLAN.md §8.
##
## game/ must never write WorldState directly — call through here and subscribe
## to the signals. Rendering drives off EffectResult.log_lines so the "coins -12
## (boat fare)" toast comes from the kernel, not from a second copy of the
## copywriting logic living in the UI.

signal state_changed(result)
signal day_advanced(jdn: int)
signal event_fired(event: Dictionary)

var state: WorldState
var executor: EffectExecutor
var conditions: ConditionEvaluator
var rng: Rng
var db := ContentDb.new()


func _ready() -> void:
	db.load_all()


func new_run(seed: String, start_city: String, start_jdn: int) -> void:
	state = WorldState.new()
	state.seed = seed
	state.city = start_city
	state.jdn = start_jdn
	rng = Rng.new(seed)
	executor = EffectExecutor.new()
	conditions = ConditionEvaluator.new(db)


func apply(effects: Array, event_id: String) -> EffectExecutor.EffectResult:
	var res := executor.execute(state, effects, {"rng": rng, "event_id": event_id})
	state_changed.emit(res)
	if res.queued_days > 0:
		day_advanced.emit(state.jdn)
	return res


func can(cond: Variant, ctx: Dictionary = {}) -> bool:
	return conditions.evaluate(cond, state, ctx)


func why_not(cond: Variant, ctx: Dictionary = {}) -> Array[String]:
	return conditions.explain(cond, state, ctx)
