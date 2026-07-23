class_name EffectExecutor
extends RefCounted

## The ONLY writer of WorldState. See docs/ARCHITECTURE.md §2.1, CODE_PLAN.md §3.
##
## Execution semantics are load-bearing for save replay — do not "optimise" them:
##   1. Instructions run IN ORDER. No reordering, no batching.
##   2. `chance` rolls use rng.fork(event_id + ":" + index), so the same
##      instruction in the same event resolves identically on replay.
##   3. A rejected instruction does NOT roll back earlier ones. Prevent bad
##      states with `when` at authoring time rather than with transactions here.
##   4. `days` queues clock events; it does not expand them inline (that recurses).


## A purse ceiling far above any reachable fortune, but low enough that adding
## to it cannot wrap a 64-bit integer.
const COIN_MAX := 1_000_000_000_000


class EffectResult extends RefCounted:
	var applied: Array[Dictionary] = []
	var rejected: Array[Dictionary] = []
	var log_lines: Array[String] = []
	var queued_days: int = 0
	var reading: Dictionary = {}  ## last DivinationRegistry.cast payload, if any


func execute(state: WorldState, effects: Array, ctx: Dictionary = {}) -> EffectResult:
	return _run(state, effects, ctx)


## Same code path as execute(), on a deep copy. Two implementations would drift.
func preview(state: WorldState, effects: Array, ctx: Dictionary = {}) -> EffectResult:
	return _run(state.duplicate_state(), effects, ctx)


func _run(state: WorldState, effects: Array, ctx: Dictionary) -> EffectResult:
	var res := EffectResult.new()
	var rng: Rng = ctx.get("rng", Rng.new(state.seed))
	var event_id: String = ctx.get("event_id", "anon")

	for i in effects.size():
		var e: Dictionary = effects[i]
		if not e.has("op"):
			push_error("Effect missing 'op' at index %d of %s" % [i, event_id])
			continue
		if not e.has("reason") or String(e["reason"]).is_empty():
			# G10. Enforced at runtime as well as in schema because an effect
			# without a reason makes "why did my coins change" unanswerable.
			push_error("Effect '%s' missing 'reason' at %s[%d]" % [e["op"], event_id, i])
			continue

		var chance := float(e.get("chance", 1.0))
		if chance < 1.0:
			var roll := rng.fork("%s:%d" % [event_id, i]).next()
			if roll >= chance:
				res.rejected.append(e)
				continue

		if _apply(state, e, res):
			res.applied.append(e)
			res.log_lines.append("%s:%s" % [e["op"], e["reason"]])
		else:
			res.rejected.append(e)

	return res


func _apply(state: WorldState, e: Dictionary, res: EffectResult) -> bool:
	var op := String(e["op"])
	var val: Variant = e.get("value", null)
	var id := String(e.get("id", ""))

	match op:
		"coins":
			var delta := int(val)
			if delta < 0 and state.coins + delta < 0:
				return false  # cannot go into debt; author should gate with `when`
			# Clamp the top as well. Normal play never approaches it, but a save
			# file is editable, and an overflowed purse wraps to a NEGATIVE
			# balance — a state nothing in the game can recover from.
			if delta > 0 and state.coins > COIN_MAX - delta:
				state.coins = COIN_MAX
			else:
				state.coins += delta
		"days":
			var d := int(val)
			state.days_elapsed += d
			state.jdn += d
			res.queued_days += d
		"goods":
			var n: int = state.goods.get(id, 0) + int(val)
			if n < 0:
				return false
			if n == 0:
				state.goods.erase(id)
			else:
				state.goods[id] = n
		"item":
			if String(val) not in state.items:
				state.items.append(String(val))
		"remove_item":
			state.items.erase(String(val))
		"cargo_slots":
			state.cargo_slots = maxi(0, state.cargo_slots + int(val))
		"reputation":
			var scope := String(e.get("scope", "city"))
			var key := id if not id.is_empty() else state.city
			var t: Dictionary = state.city_reputation if scope == "city" else state.band_reputation
			t[key] = int(t.get(key, 0)) + int(val)
		"faith":
			state.faith = String(val)
		"language":
			if String(val) not in state.languages:
				state.languages.append(String(val))
		"fate":
			# GDD: fate bars are 0-31 individual-values. Clamp, never wrap.
			var k := id if not id.is_empty() else "travel"
			state.fate[k] = clampi(int(state.fate.get(k, 0)) + int(val), 0, 31)
		"unlock_route":
			if String(val) not in state.unlocked_routes:
				state.unlocked_routes.append(String(val))
		"reveal_map":
			var cur: int = state.revealed.get(String(val), 0)
			state.revealed[String(val)] = mini(cur + 1, 3)
		"learn_divination":
			if String(val) not in state.learned_divinations:
				state.learned_divinations.append(String(val))
		"flag":
			state.flags[String(val)] = true
		"unflag":
			state.flags.erase(String(val))
		"goto":
			state.city = String(val)
		"sticker":
			if String(val) not in state.stickers:
				state.stickers.append(String(val))
		"codex":
			if String(val) not in state.codex:
				state.codex.append(String(val))
		"recruit":
			var rid := String(val)
			for m in state.retainers:
				if String(m.get("id", "")) == rid:
					return false          # already travelling with you
			state.retainers.append({
				"id": rid,
				"joined_jdn": state.jdn,
				"mood": 16,               # 0-31, like every other bar
				"present": true,
				"seal": 3,
			})
		"dismiss":
			var rid2 := String(val)
			var idx := -1
			for i in state.retainers.size():
				if String(state.retainers[i].get("id", "")) == rid2:
					idx = i
					break
			if idx < 0:
				return false
			state.retainers.remove_at(idx)
		"retainer_mood":
			var rid3 := id if not id.is_empty() else String(val)
			for m in state.retainers:
				if String(m.get("id", "")) == rid3:
					m["mood"] = clampi(int(m.get("mood", 16)) + int(val), 0, 31)
					return true
			return false
		"reveal_birth":
			var rid4 := id if not id.is_empty() else String(val)
			for m in state.retainers:
				if String(m.get("id", "")) == rid4:
					# The seal counts DOWN toward full knowledge (GDD §11.4).
					m["seal"] = maxi(0, int(m.get("seal", 3)) - maxi(1, int(val)))
					return true
			return false
			return true
		_:
			push_error("Unknown effect op: %s" % op)
			return false
	return true
