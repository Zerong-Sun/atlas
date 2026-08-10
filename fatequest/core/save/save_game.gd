class_name SaveGame
extends RefCounted

const MortalityCore = preload("res://core/life/mortality.gd")

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

const VERSION := 4
const DIR := "user://saves"
const EXT := ".fqsave"
const HEAD_EXT := ".fqhead"
const BACKUP_EXT := ".bak"
const _V3_HEADER_FIELDS := [
	"city", "jdn", "date", "days", "coins", "archetype",
	"saved_at", "version", "thumbnail_id", "slot",
]
const _V3_STATE_FIELDS := [
	"seed", "jdn", "city", "character", "coins", "days_elapsed",
	"faith", "fate", "languages", "items", "goods", "cargo_slots",
	"revealed", "unlocked_routes", "learned_divinations", "flags",
	"city_reputation", "band_reputation", "retainers", "once_fired",
	"stickers", "codex", "etiquette", "birthdate_jdn", "pending_events",
	"active_event", "active_journey", "recovery", "start_city", "visited",
	"longest_leg", "best_trade", "purchases",
]
const _V4_STATE_FIELDS := _V3_STATE_FIELDS + ["life", "legacy"]
const _V3_ARRAY_FIELDS := [
	"languages", "items", "unlocked_routes", "learned_divinations",
	"retainers", "stickers", "codex", "pending_events", "visited",
]
const _V3_DICTIONARY_FIELDS := [
	"character", "fate", "goods", "revealed", "flags", "city_reputation",
	"band_reputation", "once_fired", "etiquette", "active_journey",
	"recovery", "longest_leg", "best_trade", "purchases",
]
const _V4_DICTIONARY_FIELDS := _V3_DICTIONARY_FIELDS + ["life", "legacy"]


static func _ensure_dir() -> void:
	if not DirAccess.dir_exists_absolute(DIR):
		DirAccess.make_dir_recursive_absolute(DIR)


static func valid_slot(slot: String) -> bool:
	if slot.is_empty() or slot.length() > 64:
		return false
	for i in slot.length():
		var c := slot.unicode_at(i)
		var ok := (c >= 48 and c <= 57) or (c >= 65 and c <= 90) \
			or (c >= 97 and c <= 122) or c in [45, 95]
		if not ok:
			return false
	return true


## `saved_at` is wall-clock time — a legitimate thing for a load menu to show,
## but the kernel has no business reading the system clock (G11). The caller
## passes it in, so core/ stays free of real-world time and the rule keeps its
## edge instead of gaining an exception.
static func serialize(state: WorldState, _clock: WorldClock, extra: Dictionary = {},
		saved_at: String = "") -> Dictionary:
	# WorldState.jdn is the one authoritative date. Deriving the display header
	# from a caller-owned clock could make a valid snapshot advertise a stale
	# civil date if the presentation had not refreshed its clock yet.
	var g := WorldClock.new(state.jdn).date.to_gregorian()
	var doc := {
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
			"version": VERSION,
			"thumbnail_id": extra.get("thumbnail_id", state.city),
			"slot": "",
		},
		"state": {
			"seed": state.seed,
			"jdn": state.jdn,
			"city": state.city,
			"character": state.character.duplicate(true),
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
			"etiquette": state.etiquette.duplicate(true),
			"birthdate_jdn": state.birthdate_jdn,
			"pending_events": Array(state.pending_events),
			"active_event": state.active_event,
			"active_journey": state.active_journey.duplicate(true),
			"recovery": state.recovery.duplicate(true),
			"start_city": state.start_city,
			"visited": Array(state.visited),
			"longest_leg": state.longest_leg.duplicate(true),
			"best_trade": state.best_trade.duplicate(true),
			"purchases": state.purchases.duplicate(true),
			"life": state.life.duplicate(true),
			"legacy": state.legacy.duplicate(true),
		},
		"extra": extra,
	}
	return _seal(doc)


static func _canonical(value: Variant) -> String:
	match typeof(value):
		TYPE_DICTIONARY:
			var d: Dictionary = value
			var keys := d.keys()
			keys.sort_custom(func(a, b): return String(a) < String(b))
			var parts: Array[String] = []
			for key in keys:
				parts.append("%s:%s" % [JSON.stringify(String(key)), _canonical(d[key])])
			return "{%s}" % ",".join(PackedStringArray(parts))
		TYPE_ARRAY:
			var items: Array[String] = []
			for item in value:
				items.append(_canonical(item))
			return "[%s]" % ",".join(PackedStringArray(items))
		_:
			return JSON.stringify(value)


static func _digest(doc: Dictionary) -> String:
	var payload := doc.duplicate(true)
	payload.erase("integrity")
	return _canonical(payload).sha256_text()


static func _seal(doc: Dictionary) -> Dictionary:
	var out := doc.duplicate(true)
	out.erase("integrity")
	out["integrity"] = {"algorithm": "sha256", "digest": _digest(out)}
	return out


static func _document_status(doc: Dictionary) -> Dictionary:
	if doc.is_empty():
		return {"status": "corrupt", "code": "SAVE_EMPTY"}
	var version := int(doc.get("version", 0))
	if version > VERSION:
		return {
			"status": "incompatible",
			"code": "SAVE_NEWER_VERSION",
			"version": version,
			"header": doc.get("header", {}),
		}
	if version < 1:
		return {"status": "corrupt", "code": "SAVE_BAD_VERSION", "version": version}
	if typeof(doc.get("header", null)) != TYPE_DICTIONARY \
			or typeof(doc.get("state", null)) != TYPE_DICTIONARY:
		return {"status": "corrupt", "code": "SAVE_BAD_SHAPE", "version": version}
	if version >= 3:
		var integrity: Dictionary = doc.get("integrity", {})
		if integrity.get("algorithm", "") != "sha256" \
				or String(integrity.get("digest", "")) != _digest(doc):
			return {
				"status": "corrupt",
				"code": "SAVE_CHECKSUM_FAILED",
				"version": version,
				"header": doc.get("header", {}),
			}
		var header: Dictionary = doc["header"]
		var state: Dictionary = doc["state"]
		for field in _V3_HEADER_FIELDS:
			if not header.has(field):
				return {
					"status": "corrupt",
					"code": "SAVE_HEADER_FIELD_MISSING:%s" % field,
					"version": version,
					"header": header,
				}
		var required_state_fields := _V4_STATE_FIELDS if version >= 4 else _V3_STATE_FIELDS
		for field in required_state_fields:
			if not state.has(field):
				return {
					"status": "corrupt",
					"code": "SAVE_STATE_FIELD_MISSING:%s" % field,
					"version": version,
					"header": header,
				}
		for field in _V3_ARRAY_FIELDS:
			if typeof(state[field]) != TYPE_ARRAY:
				return {
					"status": "corrupt",
					"code": "SAVE_STATE_FIELD_BAD_TYPE:%s" % field,
					"version": version,
					"header": header,
				}
		var dictionary_fields := _V4_DICTIONARY_FIELDS if version >= 4 else _V3_DICTIONARY_FIELDS
		for field in dictionary_fields:
			if typeof(state[field]) != TYPE_DICTIONARY:
				return {
					"status": "corrupt",
					"code": "SAVE_STATE_FIELD_BAD_TYPE:%s" % field,
					"version": version,
					"header": header,
				}
		if version >= 4:
			var life: Dictionary = state.get("life", {})
			var vitality := int(life.get("vitality", -1))
			var stage := String(life.get("stage", ""))
			var deceased = life.get("deceased", null)
			if vitality < 0 or vitality > 100 or stage not in MortalityCore.VALID_STAGES \
					or typeof(deceased) != TYPE_BOOL \
					or typeof(life.get("conditions", null)) != TYPE_ARRAY:
				return {
					"status": "corrupt", "code": "SAVE_LIFE_STATE_INVALID",
					"version": version, "header": header,
				}
			if (bool(deceased) and (stage != MortalityCore.DECEASED \
					or int(life.get("death_jdn", -1)) < 0 \
					or String(life.get("cause", "")).is_empty())) \
					or (not bool(deceased) and stage == MortalityCore.DECEASED):
				return {
					"status": "corrupt", "code": "SAVE_LIFE_TERMINAL_INCONSISTENT",
					"version": version, "header": header,
				}
			var legacy: Dictionary = state.get("legacy", {})
			if int(legacy.get("generation", 0)) < 1 \
					or typeof(legacy.get("volumes", null)) != TYPE_ARRAY:
				return {
					"status": "corrupt", "code": "SAVE_LEGACY_STATE_INVALID",
					"version": version, "header": header,
				}
		if String(state.get("seed", "")).is_empty() \
				or String(state.get("city", "")).is_empty():
			return {
				"status": "corrupt",
				"code": "SAVE_STATE_IDENTITY_INVALID",
				"version": version,
				"header": header,
			}
		if String(header.get("city", "")) != String(state.get("city", "")) \
				or int(header.get("jdn", -1)) != int(state.get("jdn", -2)) \
				or int(header.get("days", -1)) != int(state.get("days_elapsed", -2)) \
				or int(header.get("coins", -1)) != int(state.get("coins", -2)):
			return {
				"status": "corrupt",
				"code": "SAVE_HEADER_STATE_MISMATCH",
				"version": version,
				"header": header,
			}
	return {
		"status": "ok",
		"code": "SAVE_OK" if version >= 3 else "SAVE_LEGACY",
		"version": version,
		"header": doc.get("header", {}),
	}


static func deserialize(doc: Dictionary) -> Dictionary:
	var status := _document_status(doc)
	if status.get("status", "") != "ok":
		push_error("SaveGame: cannot deserialize %s" % status.get("code", "SAVE_INVALID"))
		return {}
	var d := migrate(doc)
	var src: Dictionary = d.get("state", {})
	var st := WorldState.new()

	st.seed = String(src.get("seed", ""))
	st.jdn = int(src.get("jdn", 0))
	st.city = String(src.get("city", ""))
	st.character = (src.get("character", {}) as Dictionary).duplicate(true)
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
	for pe in src.get("pending_events", []):
		st.pending_events.append(String(pe))
	st.active_event = String(src.get("active_event", ""))

	st.goods = (src.get("goods", {}) as Dictionary).duplicate(true)
	st.revealed = (src.get("revealed", {}) as Dictionary).duplicate(true)
	st.flags = (src.get("flags", {}) as Dictionary).duplicate(true)
	st.city_reputation = (src.get("city_reputation", {}) as Dictionary).duplicate(true)
	st.band_reputation = (src.get("band_reputation", {}) as Dictionary).duplicate(true)
	# Retainer state arrives from JSON where integral values are floats
	# (mood: 16.0, seal: 3.0). _normalize fixes the whole class before any
	# comparison or arithmetic sees the wrong type.
	var raw_retainers: Array = src.get("retainers", [])
	for r in raw_retainers:
		st.retainers.append(ContentDb._normalize(r))
	st.once_fired = (src.get("once_fired", {}) as Dictionary).duplicate(true)
	st.longest_leg = (src.get("longest_leg", {}) as Dictionary).duplicate(true)
	st.best_trade = (src.get("best_trade", {}) as Dictionary).duplicate(true)
	st.purchases = (src.get("purchases", {}) as Dictionary).duplicate(true)
	st.etiquette = (src.get("etiquette", {}) as Dictionary).duplicate(true)
	st.active_journey = (src.get("active_journey", {}) as Dictionary).duplicate(true)
	st.recovery = (src.get("recovery", {}) as Dictionary).duplicate(true)
	st.life = (src.get("life", MortalityCore.default_life()) as Dictionary).duplicate(true)
	st.legacy = (src.get("legacy", {
		"generation": 1, "lineage_id": "", "volumes": [], "pending_heirloom": ""}) \
		as Dictionary).duplicate(true)

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
			1:
				# v2 makes generated character facts and authored consequence
				# queues first-class save data. Old runs load with safe defaults.
				var state: Dictionary = d.get("state", {})
				if not state.has("character"):
					state["character"] = {}
				if not state.has("pending_events"):
					state["pending_events"] = []
				d["state"] = state
				d["version"] = 2
			2:
				# v3 adds resumable journeys and explicit non-fatal recovery
				# facts. Integrity is applied when the migrated world is next
				# written; legacy files remain readable without pretending
				# they carried a checksum they never had.
				var state3: Dictionary = d.get("state", {})
				if not state3.has("active_journey"):
					state3["active_journey"] = {}
				if not state3.has("recovery"):
					state3["recovery"] = {}
				if not state3.has("active_event"):
					state3["active_event"] = ""
				d["state"] = state3
				d["version"] = 3
			3:
				# v4 adds the warning-first life state and bounded lineage archive.
				# Existing travellers resume healthy; no old run can die merely by
				# loading into the new system.
				var state4: Dictionary = d.get("state", {})
				if not state4.has("life"):
					state4["life"] = MortalityCore.default_life()
				if not state4.has("legacy"):
					state4["legacy"] = {
						"generation": 1,
						"lineage_id": "",
						"volumes": [],
						"pending_heirloom": "",
					}
				d["state"] = state4
				d["version"] = 4
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
	if not valid_slot(slot):
		return ""
	return "%s/%s%s" % [DIR, slot, EXT]


static func backup_path(slot: String) -> String:
	var p := slot_path(slot)
	return "" if p.is_empty() else p + BACKUP_EXT


static func header_path(slot: String) -> String:
	if not valid_slot(slot):
		return ""
	return "%s/%s%s" % [DIR, slot, HEAD_EXT]


static func _read_path(path: String) -> Dictionary:
	if path.is_empty() or not FileAccess.file_exists(path):
		return {}
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		return {}
	var parsed = JSON.parse_string(f.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return {}
	return ContentDb._normalize(parsed)


static func _write_text(path: String, value: String) -> bool:
	var f := FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		return false
	f.store_string(value)
	f.close()
	return true


static func _file_size(path: String) -> int:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		return -1
	var size := f.get_length()
	f.close()
	return size


static func _write_header(slot: String, doc: Dictionary) -> bool:
	var p := slot_path(slot)
	var hp := header_path(slot)
	if p.is_empty() or hp.is_empty():
		return false
	var sidecar := _seal({
		"header": doc.get("header", {}).duplicate(true),
		"save_version": int(doc.get("version", 0)),
		"save_digest": String(doc.get("integrity", {}).get("digest", "")),
		"save_bytes": _file_size(p),
	})
	var tmp := hp + ".tmp"
	if not _write_text(tmp, JSON.stringify(sidecar)):
		return false
	if FileAccess.file_exists(hp):
		DirAccess.remove_absolute(hp)
	return DirAccess.rename_absolute(tmp, hp) == OK


static func _read_header(slot: String) -> Dictionary:
	var sidecar := _read_path(header_path(slot))
	if sidecar.is_empty():
		return {}
	var integrity: Dictionary = sidecar.get("integrity", {})
	if integrity.get("algorithm", "") != "sha256" \
			or String(integrity.get("digest", "")) != _digest(sidecar):
		return {}
	return sidecar


static func write(slot: String, state: WorldState, clock: WorldClock,
		extra: Dictionary = {}, saved_at: String = "") -> bool:
	_ensure_dir()
	if not valid_slot(slot):
		push_error("SaveGame: invalid slot '%s'" % slot)
		return false
	var p := slot_path(slot)
	var bak := backup_path(slot)
	# Never turn a bad live file into the new backup, and never hide a
	# backup-only interrupted replacement behind a fresh save. Recovery or an
	# explicit erase must happen first.
	if FileAccess.file_exists(p):
		var existing_status := _document_status(_read_path(p))
		if existing_status.get("status", "") != "ok":
			push_error("SaveGame: refusing to overwrite invalid slot %s (%s)" % [
				slot, existing_status.get("code", "SAVE_INVALID")])
			return false
	elif FileAccess.file_exists(bak):
		push_error("SaveGame: refusing to overwrite backup-only slot %s" % slot)
		return false
	var doc := serialize(state, clock, extra, saved_at)
	var header: Dictionary = doc.get("header", {})
	header["slot"] = slot
	doc["header"] = header
	doc = _seal(doc)
	var tmp := p + ".tmp"
	if not _write_text(tmp, JSON.stringify(doc)):
		push_error("SaveGame: cannot write %s" % tmp)
		return false
	var check := _read_path(tmp)
	var check_status := _document_status(check)
	if check_status.get("status", "") != "ok":
		push_error("SaveGame: temporary save failed validation: %s" % check_status.get("code", ""))
		DirAccess.remove_absolute(tmp)
		return false

	# Keep the previous complete file recoverable. Godot has no cross-platform
	# replace-over-existing primitive, so the backup is copied first and is
	# restored if the final rename fails.
	if FileAccess.file_exists(p):
		if FileAccess.file_exists(bak):
			DirAccess.remove_absolute(bak)
		if DirAccess.copy_absolute(p, bak) != OK:
			push_error("SaveGame: cannot create backup for %s" % slot)
			DirAccess.remove_absolute(tmp)
			return false
		DirAccess.remove_absolute(p)
	var err := DirAccess.rename_absolute(tmp, p)
	if err != OK:
		push_error("SaveGame: cannot install new save for %s" % slot)
		if FileAccess.file_exists(bak):
			DirAccess.copy_absolute(bak, p)
		return false
	# A missing sidecar does not invalidate the world; it only makes the load
	# menu fall back to a deep inspection on the next listing.
	_write_header(slot, doc)
	return true


static func read(slot: String) -> Dictionary:
	var p := slot_path(slot)
	if p.is_empty():
		return {}
	var doc := _read_path(p)
	var status := _document_status(doc)
	if status.get("status", "") != "ok":
		if not doc.is_empty():
			push_error("SaveGame: %s: %s" % [p, status.get("code", "SAVE_INVALID")])
		return {}
	return doc


static func read_backup(slot: String) -> Dictionary:
	var doc := _read_path(backup_path(slot))
	return doc if _document_status(doc).get("status", "") == "ok" else {}


static func restore_backup(slot: String) -> bool:
	_ensure_dir()
	var bak := backup_path(slot)
	var p := slot_path(slot)
	if bak.is_empty() or p.is_empty():
		return false
	var doc := _read_path(bak)
	if _document_status(doc).get("status", "") != "ok":
		return false
	var tmp := p + ".restore"
	if FileAccess.file_exists(tmp):
		DirAccess.remove_absolute(tmp)
	if DirAccess.copy_absolute(bak, tmp) != OK:
		return false
	if FileAccess.file_exists(p):
		DirAccess.remove_absolute(p)
	if DirAccess.rename_absolute(tmp, p) != OK:
		return false
	_write_header(slot, doc)
	return true


static func inspect_slot(slot: String, deep: bool = false) -> Dictionary:
	_ensure_dir()
	var p := slot_path(slot)
	var bak_available := FileAccess.file_exists(backup_path(slot))
	if p.is_empty() or not FileAccess.file_exists(p):
		return {
			"status": "empty" if not bak_available else "corrupt",
			"code": "SAVE_MISSING",
			"slot": slot,
			"backup_available": bak_available,
		}

	if not deep:
		var sidecar := _read_header(slot)
		if not sidecar.is_empty():
			var expected_size := int(sidecar.get("save_bytes", -1))
			if expected_size == _file_size(p):
				var h: Dictionary = sidecar.get("header", {}).duplicate(true)
				h["slot"] = slot
				return {
					"status": "ok",
					"code": "SAVE_HEADER_OK",
					"slot": slot,
					"header": h,
					"backup_available": bak_available,
				}

	var doc := _read_path(p)
	var result := _document_status(doc)
	result["slot"] = slot
	result["backup_available"] = bak_available
	if result.get("header", {}).is_empty() and not doc.is_empty():
		result["header"] = doc.get("header", {})
	return result


static func exists(slot: String) -> bool:
	var p := slot_path(slot)
	return not p.is_empty() and FileAccess.file_exists(p)


static func erase(slot: String) -> void:
	if not valid_slot(slot):
		return
	var base := slot_path(slot)
	var head := header_path(slot)
	for p in [
		base, backup_path(slot), head,
		base + ".tmp", base + ".restore", head + ".tmp",
	]:
		if not p.is_empty() and FileAccess.file_exists(p):
			DirAccess.remove_absolute(p)


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
		if name.ends_with(EXT) and not name.ends_with(EXT + BACKUP_EXT):
			var slot := name.substr(0, name.length() - EXT.length())
			var info := inspect_slot(slot)
			var h: Dictionary = info.get("header", {}).duplicate(true)
			h["slot"] = slot
			h["status"] = info.get("status", "corrupt")
			h["code"] = info.get("code", "")
			h["backup_available"] = info.get("backup_available", false)
			out.append(h)
		name = d.get_next()
	d.list_dir_end()
	out.sort_custom(func(a, b): return String(a.get("saved_at", "")) > String(b.get("saved_at", "")))
	return out
