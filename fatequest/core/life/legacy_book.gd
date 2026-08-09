class_name LegacyBook
extends RefCounted

const MortalityCore = preload("res://core/life/mortality.gd")

## Turns a finished life into the bounded inheritance chosen for this game:
## the written book, a less-certain copy of its map, and at most one heirloom.
## Money, learned methods and living relationships never transfer.


static func archive(state: WorldState, ending_id: String = "") -> Dictionary:
	var inherited_map := {}
	var prepared := bool(state.life.get("legacy_prepared", false))
	var certainty_loss := 1 if prepared else 2
	for id in state.revealed:
		var level := int(state.revealed[id])
		if level > 0:
			# A copied account is never equivalent to standing there. Level 1 is
			# retained as hearsay; detailed/visited knowledge loses one level.
			inherited_map[String(id)] = maxi(1, level - certainty_loss)
	return {
		"life_seed": state.seed,
		"predecessor": state.character.duplicate(true),
		"death": state.life.duplicate(true),
		"ending_id": ending_id,
		"last_city": state.city,
		"days_travelled": state.days_elapsed,
		"visited": Array(state.visited),
		"codex": Array(state.codex),
		"stickers": Array(state.stickers),
		"map": inherited_map,
		"prepared": prepared,
		"heirloom_options": MortalityCore.heirloom_options(state),
	}


static func current_volume(state: WorldState) -> Dictionary:
	var death_jdn := int(state.life.get("death_jdn", -1))
	var volumes: Array = state.legacy.get("volumes", [])
	for i in range(volumes.size() - 1, -1, -1):
		var volume: Dictionary = volumes[i]
		if String(volume.get("life_seed", "")) == state.seed \
				and int(volume.get("death", {}).get("death_jdn", -2)) == death_jdn:
			return volume
	return {}


static func inheritance_effects(volume: Dictionary, heirloom: String = "") -> Array:
	var effects: Array = []
	for id in volume.get("map", {}):
		effects.append({
			"op": "reveal_city" if not String(id).begins_with("rt-") else "reveal_route",
			"value": String(id),
			"level": int(volume["map"][id]),
			"reason": "inherited-map",
		})
	for codex_id in volume.get("codex", []):
		effects.append({"op": "codex", "value": String(codex_id), "reason": "inherited-book"})
	for sticker_id in volume.get("stickers", []):
		effects.append({"op": "sticker", "value": String(sticker_id), "reason": "inherited-book"})
	var allowed: Array = volume.get("heirloom_options", [])
	if not heirloom.is_empty() and heirloom in allowed:
		effects.append({"op": "item", "value": heirloom, "reason": "chosen-heirloom"})
	return effects
