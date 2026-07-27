class_name Ending
extends RefCounted

## Endings and the closing paragraph (GDD §14, docs/AUDIT_2026-07.md §9.2).
##
## Three layers, and the order between them is the design:
##
##   1. The player closes the book themselves, anywhere, at any time.
##   2. A life took a recognisable shape — reached the east, learned the arts,
##      never went home.
##   3. The world state alone says what happened: wealth, breadth, mapmaking.
##
## Layer 1 is always available and always last-resort, so no run can strand a
## player with nothing to end on. Among layers 2 and 3, the most demanding
## reachable ending wins — a traveller who qualifies for both "saw the world"
## and "laid down the pen" is told the larger of the two truths.
##
## The epilogue interpolates from the journey record in WorldState, never from
## estimates. If a run has no best trade, {richestTrade} says so plainly rather
## than inventing a figure: this paragraph is the last thing the player reads,
## and a number they never earned would be the one falsehood they notice.

var db: ContentDb

func _init(content_db: ContentDb) -> void:
	db = content_db


## Every ending whose conditions the state satisfies, best first.
func qualifying(state: WorldState) -> Array:
	var out: Array = []
	for e in db.get_table("endings"):
		if _matches(state, e.get("conditions", {})):
			out.append(e)
	out.sort_custom(func(a, b): return _weight(a) > _weight(b))
	return out


## What this run ends as if it ended now. Never empty — layer 1 has no
## conditions and so always qualifies.
func best(state: WorldState) -> Dictionary:
	var q := qualifying(state)
	return q[0] if not q.is_empty() else {}


## Demandingness. Layer is the coarse key; within a layer, the ending that asks
## for more cities is the more specific claim about this life.
func _weight(e: Dictionary) -> int:
	var c: Dictionary = e.get("conditions", {})
	var n := int(c.get("visitedCities", 0)) + 4 * c.keys().size()
	return int(e.get("layer", 1)) * 1000 + n


func _matches(state: WorldState, cond: Dictionary) -> bool:
	for key in cond.keys():
		var want: Variant = cond[key]
		match String(key):
			"visitedCities":
				if state.visited.size() < int(want):
					return false
			"returnedToStart":
				# An empty start city means the player never left; that is not
				# a return, whatever the flag asks for.
				var back := (not state.start_city.is_empty()
					and state.city == state.start_city
					and state.visited.size() > 1)
				if back != bool(want):
					return false
			"reputationBands":
				var n := 0
				for b in state.band_reputation.keys():
					if int(state.band_reputation[b]) > 0:
						n += 1
				if n < int(want):
					return false
			"netWorth":
				if _net_worth(state) < int(want):
					return false
			"revealedRoutes":
				var n := 0
				for k in state.revealed.keys():
					if String(k).begins_with("rt-"):
						n += 1
				if n < int(want):
					return false
			"learnedDivinations":
				for d in want:
					if String(d) not in state.learned_divinations:
						return false
			"flags":
				for f in want:
					if not state.flags.has(String(f)):
						return false
			"retainersKept":
				if state.retainers.size() < int(want):
					return false
			"codexPct":
				var total := _codex_total()
				if total == 0:
					push_error("Ending: codexPct asked for, but no event grants any codex entry")
					return false
				if float(state.codex.size()) / float(total) * 100.0 < float(want):
					return false
			_:
				# Loudly, like the condition evaluator: a typo in a condition key
				# would otherwise make an ending quietly unreachable forever.
				push_error("Ending: unknown condition key '%s'" % key)
				return false
	return true


## There is no codex table — an entry exists because some event grants it. The
## denominator is therefore counted from content, the same way the codex screen
## builds its list, so the two can never disagree about what "complete" means.
func _codex_total() -> int:
	var seen := {}
	for ev in db.get_table("events"):
		for ch in ev.get("choices", []):
			for eff in ch.get("effects", []):
				if String(eff.get("op", "")) == "codex":
					seen[String(eff.get("value", ""))] = true
			# Divination pass/fail branches may also grant codex entries.
			for branch in [ch.get("pass", {}).get("effects", []), ch.get("fail", {}).get("effects", [])]:
				for eff in branch:
					if String(eff.get("op", "")) == "codex":
						seen[String(eff.get("value", ""))] = true
	return seen.size()


## Coins plus what the hold would fetch at cost. Goods are valued at what was
## paid, not at some destination's price — net worth should not depend on a sale
## that has not happened.
func _net_worth(state: WorldState) -> int:
	var w := state.coins
	for gid in state.goods.keys():
		var basis: Dictionary = state.purchases.get(gid, {})
		w += int(basis.get("unit", 0)) * int(state.goods[gid])
	return w


# --------------------------------------------------------------- epilogue

## Fill an ending's epilogue from the journey record. `lang` selects which
## i18n strings the named values (cities, faiths) come back in.
func epilogue(state: WorldState, e: Dictionary, clock: WorldClock) -> String:
	var text := I18n.t(String(e.get("epilogue", "")))
	for name in e.get("variables", []):
		text = text.replace("{%s}" % name, _value(state, String(name), clock))
	return text


func _value(state: WorldState, name: String, clock: WorldClock) -> String:
	match name:
		"cities":
			return str(state.visited.size())
		"years":
			# Whole years on the road, floored, minimum one: a book covering
			# eight months is still "a year of travels" and never "0 years".
			return str(maxi(1, int(state.days_elapsed / 365.0)))
		"start":
			return _city_name(state.start_city)
		"lastCity":
			return _city_name(state.city)
		"faith":
			return I18n.t("faith.%s" % state.faith)
		"longestRoute":
			if state.longest_leg.is_empty():
				return I18n.t("epilogue.no_long_road")
			var r := db.get_record(String(state.longest_leg.get("route", "")))
			if r.is_empty():
				return I18n.t("epilogue.no_long_road")
			return "%s — %s" % [_city_name(String(r.get("from", ""))),
				_city_name(String(r.get("to", "")))]
		"richestTrade":
			if state.best_trade.is_empty() or int(state.best_trade.get("profit", 0)) <= 0:
				return I18n.t("epilogue.no_great_trade")
			var g := db.get_record(String(state.best_trade.get("good", "")))
			return I18n.t(String(g.get("name", state.best_trade.get("good", ""))))
	push_error("Ending: no value for epilogue variable '{%s}'" % name)
	return "{%s}" % name


func _city_name(id: String) -> String:
	if id.is_empty():
		return I18n.t("epilogue.nowhere")
	var c := db.get_record(id)
	return I18n.t(String(c.get("name", id))) if not c.is_empty() else id
