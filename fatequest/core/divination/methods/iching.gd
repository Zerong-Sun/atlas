class_name IChingMethod
extends DivinationMethod

## 易占 — three-coin method, six throws, moving lines.
## Port of atlas/packages/engines/src/iching.ts (the 64-hexagram table itself
## belongs in content, not here — this file is only the casting logic).
##
## This is the reference implementation of the DivinationMethod contract:
## every other method should read like this one.

func id() -> String:
	return "iching"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city", "year"]


func cast(ctx: DivinationContext) -> Dictionary:
	var lines: Array = []          # 6,7,8,9 bottom-to-top
	for i in 6:
		# Three coins: heads=3, tails=2. Sum 6..9.
		var s := 0
		for c in 3:
			s += 3 if ctx.rng.next() < 0.5 else 2
		lines.append(s)

	var primary := 0
	var derived := 0
	var moving: Array = []
	for i in 6:
		var l: int = lines[i]
		var yang := (l == 7 or l == 9)
		var moves := (l == 6 or l == 9)
		if yang:
			primary |= 1 << i
		# A moving line flips in the derived hexagram.
		var d_yang := (not yang) if moves else yang
		if d_yang:
			derived |= 1 << i
		if moves:
			moving.append(i)

	return {
		"lines": lines,
		"primary": primary,
		"derived": derived if not moving.is_empty() else primary,
		"moving": moving,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	# A reading's payoff is INFORMATION, not resources (GDD §8.2). Reveal what
	# the road holds; do not hand out coins. A divination that pays money is a
	# slot machine wearing a hexagram.
	var effects: Array = []
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city

	effects.append({
		"op": "reveal_map", "value": subject,
		"reason": "iching-read-the-road",
	})

	# More moving lines = a more emphatic reading = one extra intel step.
	var moving: Array = raw.get("moving", [])
	if moving.size() >= 3:
		effects.append({
			"op": "reveal_map", "value": subject,
			"reason": "iching-many-moving-lines",
		})

	# The hexagram itself becomes a codex entry, so casting builds the almanac.
	effects.append({
		"op": "codex", "value": "cx-hex-%d" % int(raw.get("primary", 0)),
		"reason": "iching-recorded-the-hexagram",
	})
	return effects


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	var primary: int = int(raw.get("primary", 0)) % 64
	var hex: Dictionary = DivinationData.hexagram(primary)
	var keys: Array = []
	if not hex.is_empty():
		keys.append(String(hex.get("nameKey", "div.iching.hex.%d" % primary)))
		keys.append(String(hex.get("adviceKey", "")))
	else:
		keys.append("div.iching.hex.%d" % primary)
	keys.append(DivinationData.result_text_key("iching", primary % 30))
	if not (raw.get("moving", []) as Array).is_empty():
		var derived: int = int(raw.get("derived", 0)) % 64
		keys.append("div.iching.hex.%d" % derived)
	return keys.filter(func(k): return String(k) != "")
