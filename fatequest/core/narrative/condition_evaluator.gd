class_name ConditionEvaluator
extends RefCounted

## Data-driven `when` evaluator. Grammar: docs/CODE_PLAN.md §4.
##
## Content authors write JSON, not GDScript. Keys within one object are ANDed;
## values within one array are ORed. Combinators are exactly `any`/`all`/`not` —
## no `and`/`or` aliases, because synonyms produce two dialects in the content
## library and make both validation and search harder.

const _LEAF_KEYS := [
	"cities", "bands", "faiths", "season", "years",
	"flags", "not_flags", "has_item", "lacks_item",
	"learned_divination", "language", "min_reputation", "fate", "coins",
	"etiquette", "has_retainer",
]

var db: ContentDb


func _init(p_db: ContentDb = null) -> void:
	db = p_db


## An empty or null condition is always true — most events fire unconditionally
## and should not be forced to carry a placeholder.
func evaluate(cond: Variant, state: WorldState, ctx: Dictionary = {}) -> bool:
	if cond == null:
		return true
	if typeof(cond) != TYPE_DICTIONARY:
		push_error("Condition must be a Dictionary, got: %s" % typeof(cond))
		return false
	var d: Dictionary = cond
	if d.is_empty():
		return true

	if d.has("any"):
		var ok := false
		for c in d["any"]:
			if evaluate(c, state, ctx):
				ok = true
				break
		if not ok:
			return false
	if d.has("all"):
		for c in d["all"]:
			if not evaluate(c, state, ctx):
				return false
	if d.has("not"):
		if evaluate(d["not"], state, ctx):
			return false

	for key in d.keys():
		if key in ["any", "all", "not"]:
			continue
		if key not in _LEAF_KEYS:
			# Unknown key. Fail loudly rather than silently passing: a typo like
			# `city` for `cities` would otherwise make the condition vacuously
			# true and fire the event in the wrong places, with no error anywhere.
			push_error("Unknown condition key '%s'. Valid: %s" % [key, _LEAF_KEYS])
			return false
		if not _leaf(key, d[key], state, ctx):
			return false
	return true


func _leaf(key: String, val: Variant, state: WorldState, ctx: Dictionary) -> bool:
	match key:
		"cities":
			return state.city in val
		"bands":
			return ctx.get("band", "") in val
		"faiths":
			return state.faith in val
		"season":
			return ctx.get("month", 0) in val
		"years":
			var y: int = ctx.get("year", 0)
			return y >= val[0] and y <= val[1]
		"flags":
			for f in val:
				if not state.flags.get(f, false):
					return false
			return true
		"not_flags":
			for f in val:
				if state.flags.get(f, false):
					return false
			return true
		"has_item":
			for i in val:
				if i not in state.items:
					return false
			return true
		"lacks_item":
			for i in val:
				if i in state.items:
					return false
			return true
		"learned_divination":
			for dv in val:
				if dv not in state.learned_divinations:
					return false
			return true
		"language":
			return String(val) in state.languages
		"min_reputation":
			return state.reputation(val.get("scope", "city"), val.get("id", state.city)) >= int(val.get("value", 0))
		"fate":
			var cur: int = state.fate.get(val.get("id", "travel"), 0)
			if val.has("min") and cur < int(val["min"]):
				return false
			if val.has("max") and cur > int(val["max"]):
				return false
			return true
		"coins":
			if val.has("min") and state.coins < int(val["min"]):
				return false
			if val.has("max") and state.coins > int(val["max"]):
				return false
			return true
		"etiquette":
			# {scope, min} — must know the customs of a region at least this well.
			var region := String(val.get("scope", ""))
			var min_lvl := int(val.get("value", 0))
			return int(state.etiquette.get(region, 0)) >= min_lvl
		"has_retainer":
			# {id} or {role} — is a specific person or kind of person in the party.
			var want_id := String(val.get("id", ""))
			if want_id != "":
				for r in state.retainers:
					if bool(r.get("present", true)) and String(r.get("id", "")) == want_id:
						return true
				return false
			var want_role := String(val.get("role", ""))
			if want_role != "" and db != null:
				for r in state.retainers:
					if not bool(r.get("present", true)):
						continue
					var rec := db.get_record(String(r.get("id", "")))
					if want_role in rec.get("roles", []) \
							or String(rec.get("role", "")) == want_role \
							or String(rec.get("job", "")) == want_role:
						return true
				return false
			return false
	return false


## Returns the human-readable reasons a condition FAILED — drives greyed-out
## choice tooltips. GDD §7.1 wants insufficient language to yield partial
## information rather than an error; this is where that copy comes from.
func explain(cond: Variant, state: WorldState, ctx: Dictionary = {}) -> Array[String]:
	var out: Array[String] = []
	if cond == null or typeof(cond) != TYPE_DICTIONARY:
		return out
	var d: Dictionary = cond
	for key in d.keys():
		if key in ["any", "all", "not"]:
			continue
		if key in _LEAF_KEYS and not _leaf(key, d[key], state, ctx):
			out.append(_reason(key, d[key], state))
	return out


func _reason(key: String, val: Variant, state: WorldState) -> String:
	match key:
		"language":
			return "explain.need_language:%s" % val
		"has_item":
			return "explain.need_item:%s" % ",".join(PackedStringArray(val))
		"min_reputation":
			return "explain.need_reputation:%d/%d" % [
				state.reputation(val.get("scope", "city"), val.get("id", state.city)),
				int(val.get("value", 0)),
			]
		"learned_divination":
			return "explain.need_divination:%s" % ",".join(PackedStringArray(val))
		"coins":
			# The HUD, market and status panel all display coins (fen / 100);
			# a needs label in raw fen reads 100x wrong next to them.
			return "explain.need_coins:%d" % int(ceil(float(val.get("min", 0)) / Market.FEN))
	return "explain.generic:%s" % key
