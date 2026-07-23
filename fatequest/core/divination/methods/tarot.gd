class_name TarotMethod
extends DivinationMethod

## 塔罗 — RWS 78 + 9 spreads from content tables (Atlas tarot.ts / tarot-deck.ts).


func id() -> String:
	return "tarot"


func inputs() -> Array:
	return ["question"]


func reads() -> Array:
	return ["route", "city", "self"]


func cast(ctx: DivinationContext) -> Dictionary:
	var spread_id := ctx.spread if ctx.spread != "" else "three-timeline"
	var spread: Dictionary = DivinationData.get_spread(spread_id)
	if spread.is_empty():
		spread = DivinationData.get_spread("three-timeline")
		spread_id = "three-timeline"
	var positions: Array = spread.get("positions", ["当前主象"])
	var deck: Array = DivinationData.all_cards().duplicate()
	if deck.is_empty():
		return {"spreadId": spread_id, "cards": [], "idx": 0}

	# Fisher–Yates with ctx.rng
	for i in range(deck.size() - 1, 0, -1):
		var j: int = ctx.rng.next_int(i + 1)
		var tmp = deck[i]
		deck[i] = deck[j]
		deck[j] = tmp

	var cards: Array = []
	for p_i in positions.size():
		if p_i >= deck.size():
			break
		var card: Dictionary = deck[p_i]
		var reversed: bool = ctx.rng.next() < 0.3
		cards.append({
			"id": String(card.get("id", "")),
			"name": String(card.get("name", "")),
			"nameKey": String(card.get("nameKey", "")),
			"arcana": String(card.get("arcana", "")),
			"suit": String(card.get("suit", "")),
			"reversed": reversed,
			"position": String(positions[p_i]),
			"meaningKey": String(card.get("reversedKey" if reversed else "uprightKey", "")),
		})

	var idx: int = 0
	if not cards.is_empty():
		var cid := String(cards[0].get("id", "major-0"))
		var parts: PackedStringArray = cid.split("-")
		if parts.size() >= 2 and parts[1].is_valid_int():
			idx = int(parts[1]) % 30
		else:
			idx = ctx.rng.next_int(30)

	return {
		"spreadId": spread_id,
		"spreadNameKey": String(spread.get("name", "")),
		"cards": cards,
		"idx": idx,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	var spread_id := String(raw.get("spreadId", ""))
	var effects: Array = [
		{"op": "codex", "value": "cx-tarot", "reason": "tarot-recorded-the-spread"},
	]

	match spread_id:
		"choice-gate":
			var a := ctx.exit_a if ctx.exit_a != "" else subject
			var b := ctx.exit_b if ctx.exit_b != "" else subject
			effects.append({"op": "reveal_map", "value": a, "reason": "tarot-choice-gate-path-a"})
			effects.append({"op": "reveal_map", "value": b, "reason": "tarot-choice-gate-path-b"})
			# Emphasize the stronger path by a second reveal on A when first card upright
			var cards: Array = raw.get("cards", [])
			if not cards.is_empty() and not bool(cards[0].get("reversed", false)):
				effects.append({"op": "reveal_map", "value": a, "reason": "tarot-choice-gate-favor-a"})
		"three-timeline":
			effects.append({"op": "reveal_map", "value": subject, "reason": "tarot-timeline-near-risk"})
			var cards2: Array = raw.get("cards", [])
			if cards2.size() >= 3 and not bool(cards2[2].get("reversed", false)):
				effects.append({"op": "reveal_map", "value": subject, "reason": "tarot-timeline-clear-trend"})
		_:
			effects.append({"op": "reveal_map", "value": subject, "reason": "tarot-read-the-fork"})

	return effects


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	var keys: Array = [DivinationData.result_text_key("tarot", int(raw.get("idx", 0)) % 30)]
	for c in raw.get("cards", []):
		var mk := String(c.get("meaningKey", ""))
		if mk != "":
			keys.append(mk)
	return keys
