class_name EffectExecutor
extends RefCounted

const MortalityCore = preload("res://core/life/mortality.gd")

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
	var queued_events: Array[String] = []
	var reading: Dictionary = {}  ## last DivinationRegistry.cast payload, if any
	## Set by EventMachine only after the choice passes every core preflight.
	## An empty applied list is not enough to tell: valid chance effects may all
	## miss, while an invalid choice must not be narrated or dequeued.
	var resolved := false


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
		"vitality":
			if bool(state.life.get("deceased", false)):
				return false
			state.life["vitality"] = clampi(
				int(state.life.get("vitality", 100)) + int(val), 0, 100)
		"life_stage":
			var stage := String(val)
			# `deceased` is a compound terminal transition and may only be
			# entered through the death op, which also records cause and date.
			if stage not in MortalityCore.VALID_STAGES or stage == MortalityCore.DECEASED \
					or bool(state.life.get("deceased", false)):
				return false
			state.life["stage"] = stage
			state.life["stage_since_jdn"] = state.jdn
		"condition_add":
			if typeof(val) != TYPE_DICTIONARY or String(val.get("id", "")).is_empty():
				return false
			var conditions: Array = state.life.get("conditions", [])
			var condition_id := String(val.get("id", ""))
			for condition in conditions:
				if String(condition.get("id", "")) == condition_id:
					condition["severity"] = maxi(int(condition.get("severity", 1)),
						int(val.get("severity", 1)))
					state.life["conditions"] = conditions
					return true
			conditions.append((val as Dictionary).duplicate(true))
			state.life["conditions"] = conditions
		"condition_remove":
			var remove_id := String(val)
			var existing: Array = state.life.get("conditions", [])
			var kept: Array = []
			for condition in existing:
				if String(condition.get("id", "")) != remove_id:
					kept.append(condition)
			if kept.size() == existing.size():
				return false
			state.life["conditions"] = kept
		"prepare_legacy":
			state.life["legacy_prepared"] = bool(val)
		"death":
			if bool(state.life.get("deceased", false)):
				return false
			state.life["deceased"] = true
			state.life["stage"] = MortalityCore.DECEASED
			state.life["stage_since_jdn"] = state.jdn
			state.life["death_jdn"] = state.jdn
			state.life["cause"] = String(val)
		"legacy_archive":
			if typeof(val) != TYPE_DICTIONARY:
				return false
			var volumes: Array = state.legacy.get("volumes", [])
			volumes.append((val as Dictionary).duplicate(true))
			state.legacy["volumes"] = volumes
		"goods":
			var n: int = state.goods.get(id, 0) + int(val)
			if n < 0:
				return false
			if n == 0:
				state.goods.erase(id)
				# An empty hold has no cost basis. Leaving a stale one behind
				# would price the next lot of this good at the old figure.
				state.purchases.erase(id)
			else:
				state.goods[id] = n
				if int(val) > 0:
					# Provenance: a lot granted by an event is braked from
					# same-city resale (GDD §9.2). Market buys clear this via
					# the `bought` op that rebuilds the basis after the grant.
					var _basis: Dictionary = state.purchases.get(id, {})
					_basis["granted_city"] = state.city
					state.purchases[id] = _basis
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
			# An open road is necessarily a known road. Keeping map intel in
			# sync here prevents a route from being usable while invisible.
			state.revealed[String(val)] = maxi(1, int(state.revealed.get(String(val), 0)))
		"reveal_map":
			var cur: int = state.revealed.get(String(val), 0)
			state.revealed[String(val)] = mini(cur + 1, 3)
		"reveal_city", "reveal_route":
			var reveal_id := String(val)
			var level := clampi(int(e.get("level", 1)), 1, 3)
			state.revealed[reveal_id] = maxi(level, int(state.revealed.get(reveal_id, 0)))
		"queue_event":
			var queued_id := String(val)
			if queued_id.is_empty():
				return false
			state.pending_events.append(queued_id)
			res.queued_events.append(queued_id)
		"dequeue_event":
			var expected := String(val)
			if state.pending_events.is_empty():
				return false
			if not expected.is_empty() and state.pending_events[0] != expected:
				return false
			state.pending_events.remove_at(0)
		"active_event":
			state.active_event = String(val)
		"fire_event":
			state.once_fired[String(val)] = true
		"journey":
			if typeof(val) != TYPE_DICTIONARY:
				return false
			state.active_journey = (val as Dictionary).duplicate(true)
		"end_journey":
			state.active_journey.clear()
		"recovery":
			var bucket := id if not id.is_empty() else "general"
			var facts: Array = state.recovery.get(bucket, [])
			facts.append(val)
			state.recovery[bucket] = facts
		"learn_divination":
			if String(val) not in state.learned_divinations:
				state.learned_divinations.append(String(val))
		"flag":
			state.flags[String(val)] = true
		"unflag":
			state.flags.erase(String(val))
		"goto":
			# Arrival is the only moment a city becomes part of the journey, so
			# the record is kept here rather than by whoever happens to move the
			# player. The origin is captured on the first move: a run starts with
			# the player already standing somewhere, and that first city belongs
			# in the book too.
			var dest := String(val)
			if state.start_city.is_empty() and not state.city.is_empty():
				state.start_city = state.city
				state.visited.append(state.city)
			if dest not in state.visited:
				state.visited.append(dest)
			state.city = dest
		"leg":
			# The longest single road walked, for the epilogue's {longestRoute}.
			# Ties keep the first: the road that was hard *first* is the one a
			# traveller tells stories about.
			var km := int(val)
			if km > int(state.longest_leg.get("km", 0)):
				state.longest_leg = {
					"route": String(e.get("id", "")),
					"km": km,
					"days": int(e.get("days", 0)),
				}
		"bought":
			# Cost basis, kept as a running average so that selling a mixed lot
			# cannot be gamed by ordering. Erased by the goods op when the last
			# unit leaves the hold.
			var bid := String(e.get("id", ""))
			var unit := int(val)
			var prev: Dictionary = state.purchases.get(bid, {})
			var held := int(state.goods.get(bid, 0))
			var old_unit := int(prev.get("unit", 0))
			var avg := unit if held <= 1 else int((old_unit * (held - 1) + unit) / float(held))
			state.purchases[bid] = {"band": String(e.get("band", "")), "unit": avg}
		"trade":
			# The best single sale, for {richestTrade}. Losses are ignored — the
			# field asks what the player is remembered for, not their worst day.
			var profit := int(val)
			if profit > int(state.best_trade.get("profit", 0)):
				state.best_trade = {"good": String(e.get("id", "")), "profit": profit}
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
		"etiquette":
			# Per-culture-region familiarity (CODE_PLAN §3.2). Level 0 = outsider,
			# higher values grant access to culturally-gated choices.
			var region := String(e.get("scope", ""))
			if region.is_empty():
				push_error("etiquette effect missing scope")
				return false
			state.etiquette[region] = clampi(int(state.etiquette.get(region, 0)) + int(val), 0, 31)
		_:
			push_error("Unknown effect op: %s" % op)
			return false
	return true
