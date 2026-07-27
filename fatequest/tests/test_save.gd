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
	SaveGame.erase(slot)
	_ok(not SaveGame.exists(slot), "erase removes it")

	# --- a missing slot is empty, not a crash ------------------------------
	_ok(SaveGame.read("no-such-slot").is_empty(), "a missing slot reads as empty")

	print("test_save: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0


## A world with something in every field, so nothing can pass by being empty.
func _populate() -> WorldState:
	var st := WorldState.new()
	st.seed = "save-test"
	st.jdn = GameDate.from_gregorian(1293, 7, 4).jdn
	st.city = "kinsay"
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
	return st
