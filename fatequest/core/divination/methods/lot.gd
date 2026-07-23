class_name LotMethod
extends DivinationMethod

## 签占 — draw from lot_signs table (Atlas lot.ts + lotSignsLibrary).


func id() -> String:
	return "lot"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city"]


func cast(ctx: DivinationContext) -> Dictionary:
	var pool: Array = DivinationData.lot_signs("mazu")
	if pool.is_empty():
		pool = DivinationData.lot_signs("mixed")
	if pool.is_empty():
		return {"sign_id": "", "grade": "中签", "title": "", "idx": 0}
	var i: int = ctx.rng.next_int(pool.size())
	var sign: Dictionary = pool[i]
	return {
		"sign_id": String(sign.get("id", "")),
		"temple": String(sign.get("temple", "")),
		"number": int(sign.get("number", 0)),
		"grade": String(sign.get("grade", "中签")),
		"title": String(sign.get("title", "")),
		"poem": sign.get("poem", []),
		"plainReading": String(sign.get("plainReading", "")),
		"idx": i % 30,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	var effects: Array = [
		{"op": "flag", "value": "fl-lot-drawn", "reason": "lot-was-drawn"},
		{"op": "reveal_map", "value": subject, "reason": "lot-named-the-road"},
	]
	var grade := String(raw.get("grade", ""))
	if grade == "上签":
		effects.append({"op": "reveal_map", "value": subject, "reason": "lot-upper-sign-extra-intel"})
	elif grade == "下签":
		effects.append({"op": "codex", "value": "cx-lot-caution", "reason": "lot-lower-sign-caution"})
	return effects


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	var idx: int = int(raw.get("idx", 0)) % 30
	return [DivinationData.result_text_key("lot", idx)]
