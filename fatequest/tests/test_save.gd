extends RefCounted

## Save round-trip and forward compatibility.
##
## The property that matters is not "it writes a file" but "what comes back is
## the world that went in" — every field, including the ones added last week.
## A save system that drops a field loses a player's journey silently, and the
## bug surfaces hours later as a missing codex entry nobody can explain.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var st := _populate()
	var clock := WorldClock.new(st.jdn)

	# --- round trip ---------------------------------------------------------
	var doc := SaveGame.serialize(st, clock, {"archetype": "polo"})
	var back: Dictionary = SaveGame.deserialize(doc)
	var got: WorldState = back["state"]

	_ok(got.seed == st.seed, "seed survives")
	_ok(got.city == st.city, "city survives")
	_ok(got.character == st.character, "generated character survives")
	_ok(got.coins == st.coins, "coins survive")
	_ok(got.jdn == st.jdn, "date survives")
	_ok(got.days_elapsed == st.days_elapsed, "elapsed days survive")
	_ok(got.faith == st.faith, "faith survives")
	_ok(got.cargo_slots == st.cargo_slots, "cargo slots survive")
	_ok(got.birthdate_jdn == st.birthdate_jdn, "birthdate survives")
	_ok(got.languages == st.languages, "languages survive")
	_ok(got.items == st.items, "items survive")
	_ok(got.goods == st.goods, "goods survive")
	_ok(got.revealed == st.revealed, "map intel survives")
	_ok(got.unlocked_routes == st.unlocked_routes, "unlocked routes survive")
	_ok(got.learned_divinations == st.learned_divinations, "learned arts survive")
	_ok(got.flags == st.flags, "flags survive")
	_ok(got.city_reputation == st.city_reputation, "city standing survives")
	_ok(got.band_reputation == st.band_reputation, "regional standing survives")
	_ok(got.once_fired == st.once_fired, "once-fired events survive")
	_ok(got.stickers == st.stickers, "stickers survive")
	_ok(got.codex == st.codex, "codex survives")
	_ok(got.etiquette == st.etiquette, "etiquette survives")
	_ok(got.fate == st.fate, "fate bars survive")
	_ok(got.pending_events == st.pending_events, "consequence queue survives")
	_ok(got.active_event == st.active_event, "active queued event survives")
	_ok(got.active_journey == st.active_journey, "journey checkpoint survives")
	_ok(got.recovery == st.recovery, "recovery facts survive")

	# --- every field is covered --------------------------------------------
	# Catches the real failure mode: someone adds a field to WorldState and
	# forgets the save. Comparing against a fresh instance finds it here rather
	# than in a player's ruined run.
	var fresh := WorldState.new()
	var missed: Array[String] = []
	for prop in fresh.get_property_list():
		var n: String = prop["name"]
		if prop["usage"] & PROPERTY_USAGE_SCRIPT_VARIABLE == 0:
			continue
		if st.get(n) != null and str(st.get(n)) != str(fresh.get(n)):
			if str(got.get(n)) != str(st.get(n)):
				missed.append(n)
	_ok(missed.is_empty(), "no WorldState field is dropped by the save (%s)" % str(missed))

	# --- json survives the trip through text -------------------------------
	var text := JSON.stringify(doc)
	var reparsed = ContentDb._normalize(JSON.parse_string(text))
	var got2: WorldState = SaveGame.deserialize(reparsed)["state"]
	_ok(got2.coins == st.coins, "coins survive JSON text (int not float)")
	_ok(got2.goods == st.goods, "goods survive JSON text")
	_ok(got2.revealed == st.revealed, "intel levels survive JSON text")

	# --- header is readable without loading the world ----------------------
	var h: Dictionary = doc["header"]
	_ok(h.has("city") and h.has("date") and h.has("coins"),
		"header carries what a load menu shows")
	_ok(String(h.get("archetype", "")) == "polo", "header keeps the archetype")
	_ok(int(h.get("version", 0)) == SaveGame.VERSION, "header carries save version")
	_ok(doc.has("integrity"), "v3 saves carry integrity metadata")
	var missing_field := doc.duplicate(true)
	missing_field["state"].erase("revealed")
	missing_field = SaveGame._seal(missing_field)
	_ok(String(SaveGame._document_status(missing_field).get(
		"code", "")).begins_with("SAVE_STATE_FIELD_MISSING"),
		"sealed but incomplete v3 save is rejected by schema")
	var mismatched_header := doc.duplicate(true)
	mismatched_header["header"]["city"] = "zayton"
	mismatched_header = SaveGame._seal(mismatched_header)
	_ok(SaveGame._document_status(mismatched_header).get("code") \
		== "SAVE_HEADER_STATE_MISMATCH",
		"header cannot advertise a different world than the snapshot")

	# --- unknown fields are preserved --------------------------------------
	var future := doc.duplicate(true)
	future["state"]["a_field_from_a_later_build"] = 42
	var kept := SaveGame.migrate(future)
	_ok(kept["state"].has("a_field_from_a_later_build"),
		"a field from a newer build is not dropped on load")

	# --- disk ---------------------------------------------------------------
	var slot := "test-slot"
	SaveGame.erase(slot)
	_ok(SaveGame.write(slot, st, clock, {"archetype": "polo"}), "writes to disk")
	_ok(SaveGame.exists(slot), "the file is there")
	var disk := SaveGame.read(slot)
	_ok(not disk.is_empty(), "reads back")
	var dst: WorldState = SaveGame.deserialize(disk)["state"]
	_ok(dst.coins == st.coins and dst.codex == st.codex, "disk round-trip is faithful")

	var slots := SaveGame.list_slots()
	_ok(slots.any(func(s): return s.get("slot") == slot), "the slot is listed")

	# A second complete write keeps the first one as a validated backup.
	var original_coins := st.coins
	st.coins += 77
	_ok(SaveGame.write(slot, st, clock, {"archetype": "polo"}), "overwrites safely")
	_ok(FileAccess.file_exists(SaveGame.backup_path(slot)), "previous save is backed up")
	var backup := SaveGame.read_backup(slot)
	_ok(not backup.is_empty(), "backup validates")
	_ok(int(backup.get("state", {}).get("coins", -1)) == original_coins,
		"backup is the previous snapshot")

	# Header sidecars are intentionally fast and cannot detect same-length
	# damage in the full body. Deep inspection and the actual load path must.
	var live_file := FileAccess.open(SaveGame.slot_path(slot), FileAccess.READ)
	var live_text := live_file.get_as_text()
	live_file.close()
	var coin_token := "\"coins\":%d" % st.coins
	var coin_at := live_text.rfind(coin_token)
	_ok(coin_at >= 0, "same-size tamper fixture finds state coin token")
	if coin_at >= 0:
		var digit_at := coin_at + coin_token.length() - 1
		var old_digit := live_text.substr(digit_at, 1)
		var new_digit := "8" if old_digit != "8" else "7"
		var damaged := live_text.substr(0, digit_at) + new_digit \
			+ live_text.substr(digit_at + 1)
		var same_size := FileAccess.open(SaveGame.slot_path(slot), FileAccess.WRITE)
		same_size.store_string(damaged)
		same_size.close()
		_ok(damaged.length() == live_text.length(), "tamper preserves file length")
		_ok(SaveGame.inspect_slot(slot, false).get("status") == "ok",
			"fast sidecar remains a menu hint, not a false integrity promise")
		_ok(SaveGame.inspect_slot(slot, true).get("status") == "corrupt",
			"deep inspection detects same-size body corruption")
		_ok(SaveGame.read(slot).is_empty(),
			"actual load detects same-size body corruption")
		DirAccess.remove_absolute(SaveGame.slot_path(slot))
		_ok(SaveGame.restore_backup(slot), "backup recovers same-size corruption")
		_ok(SaveGame.write(slot, st, clock, {"archetype": "polo"}),
			"valid recovered slot can be saved again")

	# Corrupt the live file: it must not load or erase the usable backup.
	var tamper := FileAccess.open(SaveGame.slot_path(slot), FileAccess.WRITE)
	tamper.store_string("{\"version\":3,\"truncated\":true}")
	tamper.close()
	_ok(SaveGame.read(slot).is_empty(), "checksum/shape failure refuses corrupt live save")
	var corrupt_info := SaveGame.inspect_slot(slot, true)
	_ok(corrupt_info.get("status") == "corrupt", "corruption is reported")
	_ok(corrupt_info.get("backup_available", false), "recovery reports backup")
	_ok(not SaveGame.write(slot, st, clock, {"archetype": "polo"}),
		"save refuses to overwrite a corrupt live slot")
	_ok(int(SaveGame.read_backup(slot).get("state", {}).get("coins", -1)) \
		== original_coins, "refused overwrite preserves valid backup")
	DirAccess.remove_absolute(SaveGame.slot_path(slot))
	_ok(not SaveGame.write(slot, st, clock, {"archetype": "polo"}),
		"backup-only interrupted slot cannot be hidden by a fresh save")
	_ok(SaveGame.restore_backup(slot), "validated backup restores")
	var restored := SaveGame.read(slot)
	_ok(int(restored.get("state", {}).get("coins", -1)) == original_coins,
		"restored world matches backup")

	SaveGame.erase(slot)
	_ok(not SaveGame.exists(slot), "erase removes it")
	_ok(not FileAccess.file_exists(SaveGame.backup_path(slot)), "erase removes backup")
	_ok(not FileAccess.file_exists(SaveGame.header_path(slot)), "erase removes header sidecar")

	# Five manual slots are independent snapshots, not five labels pointing at
	# one file. Read them in reverse order to catch accidental shared state.
	for i in range(1, 6):
		var manual := "manual-test-%d" % i
		SaveGame.erase(manual)
		st.coins = 200000 + i
		_ok(SaveGame.write(manual, st, clock, {"archetype": "polo"}),
			"manual slot %d writes" % i)
	for i in range(5, 0, -1):
		var manual := "manual-test-%d" % i
		var manual_doc := SaveGame.read(manual)
		_ok(int(manual_doc.get("state", {}).get("coins", -1)) == 200000 + i,
			"manual slot %d is independent" % i)
		SaveGame.erase(manual)

	# --- a missing slot is empty, not a crash ------------------------------
	_ok(SaveGame.read("no-such-slot").is_empty(), "a missing slot reads as empty")
	_ok(not SaveGame.valid_slot("../escape"), "path traversal is not a valid slot")
	_ok(not SaveGame.write("../escape", st, clock), "invalid slot cannot be written")

	# Committed legacy fixtures migrate step by step instead of being forged
	# by the current serializer on the spot (requirement §13.1).
	_migration_fixtures()

	# A future build is visible as incompatible, never migrated or rewritten.
	var future_version := doc.duplicate(true)
	future_version["version"] = SaveGame.VERSION + 1
	future_version = SaveGame._seal(future_version)
	var future_status := SaveGame._document_status(future_version)
	_ok(future_status.get("status") == "incompatible", "newer save is read-only incompatible")

	print("test_save: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0


## Committed v1/v2 save fixtures. A real old file exercises the migration
## steps with the shapes they actually shipped in — a v1->v3 shortcut or a
## fixture forged by today's serializer would never catch a dropped field.
func _migration_fixtures() -> void:
	for spec in [
		["save_v1.json", 1, false],
		["save_v2.json", 2, true],
	]:
		var fname: String = spec[0]
		var expect_version: int = spec[1]
		var has_character: bool = spec[2]
		var f := FileAccess.open(
			"res://tests/fixtures/%s" % fname, FileAccess.READ)
		_ok(f != null, "fixture %s exists" % fname)
		if f == null:
			continue
		var parsed = JSON.parse_string(f.get_as_text())
		f.close()
		_ok(typeof(parsed) == TYPE_DICTIONARY, "fixture %s parses" % fname)
		if typeof(parsed) != TYPE_DICTIONARY:
			continue
		var doc: Dictionary = ContentDb._normalize(parsed)
		_ok(int(doc.get("version", 0)) == expect_version,
			"%s starts at v%d" % [fname, expect_version])

		# A legacy file is readable as-is (no integrity to verify), then
		# stepped one version at a time to the current format.
		var status: Dictionary = SaveGame._document_status(doc)
		_ok(status.get("status", "") == "ok",
			"%s is readable as legacy" % fname)
		var migrated: Dictionary = SaveGame.migrate(doc)
		_ok(int(migrated.get("version", 0)) == SaveGame.VERSION,
			"%s migrates to v%d" % [fname, SaveGame.VERSION])

		# Full load path: safe defaults for the v2/v3 additions, and every
		# field the old file actually carried survives.
		var back: Dictionary = SaveGame.deserialize(doc)
		_ok(not back.is_empty(), "%s deserializes" % fname)
		var st: WorldState = back["state"]
		_ok(st.city == String(doc["state"]["city"]), "%s city survives" % fname)
		_ok(st.coins == int(doc["state"]["coins"]), "%s coins survive" % fname)
		_ok(st.pending_events.size() == (1 if has_character else 0),
			"%s pending_events default/kept" % fname)
		if has_character:
			_ok((st.character as Dictionary).get("archetype_id", "") == "polo",
				"%s character survives" % fname)
			_ok(st.pending_events.has("ev-kinsay-entry"),
				"%s pending event survives" % fname)
		_ok(st.active_journey.is_empty() and st.recovery.is_empty() \
			and st.active_event == "",
			"%s v3 journey defaults are empty" % fname)


## A world with something in every field, so nothing can pass by being empty.
func _populate() -> WorldState:
	var st := WorldState.new()
	st.seed = "save-test"
	st.jdn = GameDate.from_gregorian(1293, 7, 4).jdn
	st.city = "kinsay"
	st.character = {"archetype_id": "polo", "start_city": "tauris", "birth_year": 1268}
	st.coins = 123456
	st.days_elapsed = 412
	st.faith = "buddhism"
	st.fate = {"travel": 22, "rapport": 9, "wealth": 17}
	st.cargo_slots = 12
	st.birthdate_jdn = GameDate.from_gregorian(1268, 3, 2).jdn
	st.languages.append("persian")
	st.languages.append("chinese")
	st.items.append("it-paiza")
	st.goods = {"silk": 3, "pepper": 1}
	st.revealed = {"kinsay": 3, "zayton": 1, "rt-kinsay-zayton": 2}
	st.unlocked_routes.append("rt-kinsay-zayton")
	st.learned_divinations.append("iching")
	st.flags = {"fl-good-sailing-window": true}
	st.city_reputation = {"kinsay": 4}
	st.band_reputation = {"china": 2}
	st.once_fired = {"ev-kinsay-entry": true}
	st.stickers.append("st-zayton-haven")
	st.codex.append("cx-monsoon")
	st.codex.append("cx-balc")
	st.etiquette = {"china": 2, "steppe": 1}
	st.pending_events.append("ev-kinsay-entry")
	st.active_event = "ev-kinsay-entry"
	st.active_journey = {
		"route": "rt-kinsay-zayton",
		"origin": "kinsay",
		"destination": "zayton",
		"phase": "encounters",
	}
	st.recovery = {"skipped_events": ["ev-missing"]}
	return st
