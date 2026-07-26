class_name AstrodiceMethod
extends DivinationMethod

## 星辰骰：行星 / 星座 / 宫位三元组，答「时机」。


func id() -> String:
	return "astrodice"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city", "year"]


func cast(ctx: DivinationContext) -> Dictionary:
	var planet := ctx.rng.next_int(10)
	var sign := ctx.rng.next_int(12)
	var house := ctx.rng.next_int(12) + 1
	var idx := (planet * 3 + sign + house) % 30
	return {
		"method": id(),
		"planet": planet,
		"sign": sign,
		"house": house,
		"idx": idx,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	var house := int(raw.get("house", 1))
	var effects: Array = [
		{"op": "codex", "value": "cx-astrodice", "reason": "astrodice-recorded"},
	]
	if house <= 4:
		effects.append({"op": "reveal_map", "value": subject, "reason": "astrodice-near-houses-favor-departure"})
	elif house <= 8:
		effects.append({"op": "days", "value": 1, "reason": "astrodice-mid-houses-counsel-wait"})
		effects.append({"op": "reveal_map", "value": subject, "reason": "astrodice-named-a-window"})
	else:
		effects.append({"op": "flag", "value": "fl-astrodice-late-house", "reason": "astrodice-late-houses-caution"})
		effects.append({"op": "codex", "value": "cx-astrodice-caution", "reason": "astrodice-late-houses-caution"})
	return effects


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return [DivinationData.result_text_key("astrodice", int(raw.get("idx", 0)) % 30)]
