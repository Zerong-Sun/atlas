class_name JiaobeiMethod
extends DivinationMethod

## 筊杯：一问一答，只答是否与「再问」。
##
## 三种结果：圣杯（准）、笑杯（再问）、阴杯（不准）。
## 「再问」也必须落进 effects（花掉时间），否则退化成一枚硬币。


func id() -> String:
	return "jiaobei"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city"]


func cast(ctx: DivinationContext) -> Dictionary:
	var a := ctx.rng.next_int(2)  # 0 = yin face up, 1 = yang
	var b := ctx.rng.next_int(2)
	var outcome := "holy" if a != b else ("laugh" if a == 1 else "yin")
	var idx := 0
	match outcome:
		"holy":
			idx = ctx.rng.next_int(10)
		"yin":
			idx = 10 + ctx.rng.next_int(10)
		_:
			idx = 20 + ctx.rng.next_int(10)
	return {"method": id(), "cups": [a, b], "outcome": outcome, "idx": idx}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	match String(raw.get("outcome", "")):
		"holy":
			return [
				{"op": "reveal_map", "value": subject, "reason": "jiaobei-granted"},
				{"op": "codex", "value": "cx-jiaobei", "reason": "jiaobei-recorded"},
			]
		"yin":
			return [
				{"op": "flag", "value": "fl-jiaobei-refused", "reason": "jiaobei-refused"},
				{"op": "codex", "value": "cx-jiaobei", "reason": "jiaobei-recorded"},
			]
		_:
			return [
				{"op": "days", "value": 1, "reason": "jiaobei-asked-again"},
				{"op": "codex", "value": "cx-jiaobei", "reason": "jiaobei-recorded"},
			]


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return [DivinationData.result_text_key("jiaobei", int(raw.get("idx", 0)) % 30)]
