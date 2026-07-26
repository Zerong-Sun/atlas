class_name GeomancyMethod
extends DivinationMethod

## 沙盘（伊尔姆·拉姆勒）：十六象之一，答是否与风险。


func id() -> String:
	return "geomancy"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city"]


func cast(ctx: DivinationContext) -> Dictionary:
	var figures: Array = DivinationData.geomancy_figures()
	var idx_fig := 0
	var fig: Dictionary = {}
	if figures.is_empty():
		idx_fig = ctx.rng.next_int(16)
		fig = {"id": "gf-%d" % idx_fig, "name": "figure-%d" % idx_fig, "verdict": "hold"}
	else:
		idx_fig = ctx.rng.next_int(figures.size())
		fig = figures[idx_fig]
	var idx := idx_fig % 30
	return {
		"method": id(),
		"figure_id": String(fig.get("id", "")),
		"figure": String(fig.get("name", "")),
		"verdict": String(fig.get("verdict", "hold")),
		"idx": idx,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	var verdict := String(raw.get("verdict", "hold"))
	var effects: Array = [
		{"op": "codex", "value": "cx-geomancy", "reason": "geomancy-recorded"},
	]
	match verdict:
		"go":
			effects.append({"op": "reveal_map", "value": subject, "reason": "geomancy-opened-the-road"})
		"stop":
			effects.append({"op": "flag", "value": "fl-geomancy-stop", "reason": "geomancy-warned-off"})
			effects.append({"op": "days", "value": 1, "reason": "geomancy-paused-to-heed"})
		_:
			effects.append({"op": "reveal_map", "value": subject, "reason": "geomancy-held-counsel"})
			effects.append({"op": "days", "value": 1, "reason": "geomancy-held-a-day"})
	return effects


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return [DivinationData.result_text_key("geomancy", int(raw.get("idx", 0)) % 30)]
