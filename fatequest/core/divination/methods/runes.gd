class_name RunesMethod
extends DivinationMethod

## 卢恩：从二十四符中抽一，答事件走向。


func id() -> String:
	return "runes"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city"]


func cast(ctx: DivinationContext) -> Dictionary:
	var pool: Array = DivinationData.runes()
	var i := 0
	var rune: Dictionary = {}
	if pool.is_empty():
		i = ctx.rng.next_int(24)
		rune = {"id": "rune-%d" % i, "name": "rune-%d" % i, "aspect": "travel"}
	else:
		i = ctx.rng.next_int(pool.size())
		rune = pool[i]
	return {
		"method": id(),
		"rune_id": String(rune.get("id", "")),
		"rune": String(rune.get("name", "")),
		"aspect": String(rune.get("aspect", "travel")),
		"idx": i % 30,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	var aspect := String(raw.get("aspect", "travel"))
	var effects: Array = [
		{"op": "codex", "value": "cx-runes", "reason": "runes-recorded"},
		{"op": "reveal_map", "value": subject, "reason": "runes-named-a-bearing"},
	]
	match aspect:
		"delay":
			effects.append({"op": "days", "value": 1, "reason": "runes-counselled-delay"})
		"danger":
			effects.append({"op": "flag", "value": "fl-runes-danger", "reason": "runes-marked-danger"})
		"ally":
			effects.append({"op": "reputation", "value": 1, "scope": "city", "id": ctx.state.city, "reason": "runes-favoured-company"})
	return effects


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return [DivinationData.result_text_key("runes", int(raw.get("idx", 0)) % 30)]
