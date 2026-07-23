class_name SoftDivinationMethod
extends DivinationMethod

## Non-MVP methods: deterministic cast + codex-only effects (GDD play deferred).

var _id: String = ""
var _kind: String = "draw"  ## draw|dice|yesno|chart|symbol


func _init(p_id: String = "", p_kind: String = "draw") -> void:
	_id = p_id
	_kind = p_kind


func id() -> String:
	return _id


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route"]


func cast(ctx: DivinationContext) -> Dictionary:
	match _kind:
		"yesno":
			var faces: Array = ["yin", "yang"]
			var a: String = faces[ctx.rng.next_int(2)]
			var b: String = faces[ctx.rng.next_int(2)]
			var outcome := "yin"
			if a != b:
				outcome = "holy"
			elif a == "yang":
				outcome = "laugh"
			return {"method": _id, "cups": [a, b], "outcome": outcome, "idx": ctx.rng.next_int(30)}
		"dice":
			return {
				"method": _id,
				"planet": ctx.rng.next_int(10),
				"sign": ctx.rng.next_int(12),
				"house": ctx.rng.next_int(12) + 1,
				"idx": ctx.rng.next_int(30),
			}
		"chart":
			return {
				"method": _id,
				"seed": ctx.rng.next_int(100000),
				"houses": ctx.rng.next_int(12),
				"idx": ctx.rng.next_int(30),
			}
		"symbol":
			return {
				"method": _id,
				"symbol": ctx.rng.next_int(16),
				"idx": ctx.rng.next_int(30),
			}
		_:
			var n: int = 3
			var draws: Array = []
			for i in n:
				draws.append(ctx.rng.next_int(36))
			return {"method": _id, "draws": draws, "idx": int(draws[0]) % 30}


func to_effects(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return [{
		"op": "codex",
		"value": "cx-%s" % _id,
		"reason": "%s-recorded-in-codex" % _id,
	}]


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return ["div.%s.name" % _id]
