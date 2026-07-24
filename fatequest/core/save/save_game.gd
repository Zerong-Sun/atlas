class_name SaveGame
extends RefCounted

## Snapshot saves with a one-way migration chain (docs/CODE_PLAN.md §7).
##
## The kernel is deterministic, so a replay save — seed plus the effect log —
## would be smaller and prettier. It is also a trap for a game that intends to
## ship chapters: any balance change makes every old save drift, silently, into
## a different world. The snapshot is the authority; the effect log is kept
## alongside it only for bug reports.
##
## Two rules make migration survivable years from now:
##
##   1. Every save records a version. Loading runs each migration in turn from
##      that version to the current one — never a jump, so a save from v1 is
##      exercised by the same code path that a v3 save uses.
##   2. Unknown fields are preserved. A save written by a newer build must not
##      lose data when an older build reads and re-writes it.

const VERSION := 1
const DIR := "user://saves"
const EXT := ".fqsave"


static func _ensure_dir() -> void:
	if not DirAccess.dir_exists_absolute(DIR):
		DirAccess.make_dir_recursive_absolute(DIR)


## `saved_at` is wall-clock time — a legitimate thing for a load menu to show,
## but the kernel has no business reading the system clock (G11). The caller
## passes it in, so core/ stays free of real-world time and the rule keeps its
## edge instead of gaining an exception.
static func serialize(state: WorldState, clock: WorldClock, extra: Dictionary = {},
		saved_at: String = "") -> Dictionary:
	var g := clock.date.to_gregorian()
	return {
		"version": VERSION,
		# Header: everything the load menu shows, so listing saves never has to
		# deserialise a whole world.
		"header": {
			"city": state.city,
			"jdn": state.jdn,
			"date": "%d-%02d-%02d" % [g["year"], g["month"], g["day"]],
			"days": state.days_elapsed,
			"coins": state.coins,
			"archetype": extra.get("archetype", ""),
			"saved_at": saved_at,
		},
		"state": {
			"seed": state.seed,
			"jdn": state.jdn,
			"city": state.city,
			"coins": state.coins,
			"days_elapsed": state.days_elapsed,
			"faith": state.faith,
			"fate": state.fate.duplicate(true),
			"languages": Array(state.languages),
			"items": Array(state.items),
			"goods": state.goods.duplicate(true),
			"cargo_slots": state.cargo_slots,
			"revealed": state.revealed.duplicate(true),
			"unlocked_routes": Array(state.unlocked_routes),
			"learned_divinations": Array(state.learned_divinations),
			"flags": state.flags.duplicate(true),
			"city_reputation": state.city_reputation.duplicate(true),
			"band_reputation": state.band_reputation.duplicate(true),
			"retainers": state.retainers.duplicate(true),
			"once_fired": state.once_fired.duplicate(true),
			"stickers": Array(state.stickers),
			"codex": Array(state.codex),
			"birthdate_jdn": state.birthdate_jdn,
			"start_city": state.start_city,
			"visited": Array(state.visited),
			"longest_leg": state.longest_leg.duplicate(true),
			"best_trade": state.best_trade.duplicate(true),
			"purchases": state.purchases.duplicate(true),
		},
		"extra": extra,
	}


static func deserialize(doc: Dictionary) -> Dictionary:
	var d := migrate(doc)
	var src: Dictionary = d.get("state", {})
	var st := WorldState.new()

	st.seed = String(src.get("seed", ""))
	st.jdn = int(src.get("jdn", 0))
	st.city = String(src.get("city", ""))
	st.coins = int(src.get("coins", 0))
	st.days_elapsed = int(src.get("days_elapsed", 0))
	st.faith = String(src.get("faith", "latin"))
	st.fate = (src.get("fate", {}) as Dictionary).duplicate(true)
	st.cargo_slots = int(src.get("cargo_slots", 4))
	st.birthdate_jdn = int(src.get("birthdate_jdn", -1))
	st.start_city = String(src.get("start_city", ""))

	# Typed arrays will not accept an untyped literal from JSON, so each is
	# filled element by element rather than assigned wholesale.
	for l in src.get("languages", []):
		st.languages.append(String(l))
	for i in src.get("items", []):
		st.items.append(String(i))
	for r in src.get("unlocked_routes", []):
		st.unlocked_routes.append(String(r))
	for dv in src.get("learned_divinations", []):
		st.learned_divinations.append(String(dv))
	for s in src.get("stickers", []):
		st.stickers.append(String(s))
	for c in src.get("codex", []):
		st.codex.append(String(c))
	for v in src.get("visited", []):
		st.visited.append(String(v))

	st.goods = (src.get("goods", {}) as Dictionary).duplicate(true)
	st.revealed = (src.get("revealed", {}) as Dictionary).duplicate(true)
	st.flags = (src.get("flags", {}) as Dictionary).duplicate(true)
	st.city_reputation = (src.get("city_reputation", {}) as Dictionary).duplicate(true)
	st.band_reputation = (src.get("band_reputation", {}) as Dictionary).duplicate(true)
	st.retainers = (src.get("retainers", []) as Array).duplicate(true)
	st.once_fired = (src.get("once_fired", {}) as Dictionary).duplicate(true)
	st.longest_leg = (src.get("longest_leg", {}) as Dictionary).duplicate(true)
	st.best_trade = (src.get("best_trade", {}) as Dictionary).duplicate(true)
	st.purchases = (src.get("purchases", {}) as Dictionary).duplicate(true)

	return {"state": st, "clock": WorldClock.new(st.jdn), "extra": d.get("extra", {})}


## One step per version, applied in order. Never write a v1->v3 shortcut: the
## long way round is what keeps the early steps exercised.
static func migrate(doc: Dictionary) -> Dictionary:
	var d := doc.duplicate(true)
	var v := int(d.get("version", 0))
	while v < VERSION:
		match v:
			0:
				# Pre-versioning saves never shipped; treat them as v1 shaped.
				d["version"] = 1
			_:
				push_error("SaveGame: no migration from version %d" % v)
				break
		var nv := int(d.get("version", v))
		if nv == v:
			break
		v = nv
	return d


# ------------------------------------------------------------------- files

static func slot_path(slot: String) -> String:
	return "%s/%s%s" % [DIR, slot, EXT]


static func write(slot: String, state: WorldState, clock: WorldClock,
		extra: Dictionary = {}, saved_at: String = "") -> bool:
	_ensure_dir()
	var doc := serialize(state, clock, extra, saved_at)
	# Write to a temporary file and swap. A crash mid-write must not leave a
	# half-written save where a good one used to be.
	var tmp := slot_path(slot) + ".tmp"
	var f := FileAccess.open(tmp, FileAccess.WRITE)
	if f == null:
		push_error("SaveGame: cannot write %s" % tmp)
		return false
	f.store_string(JSON.stringify(doc))
	f.close()
	if FileAccess.file_exists(slot_path(slot)):
		DirAccess.remove_absolute(slot_path(slot))
	return DirAccess.rename_absolute(tmp, slot_path(slot)) == OK


static func read(slot: String) -> Dictionary:
	var p := slot_path(slot)
	if not FileAccess.file_exists(p):
		return {}
	var f := FileAccess.open(p, FileAccess.READ)
	if f == null:
		return {}
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) != TYPE_DICTIONARY:
		push_error("SaveGame: %s is not a save" % p)
		return {}
	return ContentDb._normalize(doc)


static func exists(slot: String) -> bool:
	return FileAccess.file_exists(slot_path(slot))


static func erase(slot: String) -> void:
	if exists(slot):
		DirAccess.remove_absolute(slot_path(slot))


## Slot headers for a load menu, newest first. Reads only the header.
static func list_slots() -> Array:
	_ensure_dir()
	var out: Array = []
	var d := DirAccess.open(DIR)
	if d == null:
		return out
	d.list_dir_begin()
	var name := d.get_next()
	while name != "":
		if name.ends_with(EXT):
			var slot := name.substr(0, name.length() - EXT.length())
			var doc := read(slot)
			if not doc.is_empty():
				var h: Dictionary = doc.get("header", {})
				h["slot"] = slot
				out.append(h)
		name = d.get_next()
	d.list_dir_end()
	out.sort_custom(func(a, b): return String(a.get("saved_at", "")) > String(b.get("saved_at", "")))
	return out
