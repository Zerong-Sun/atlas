extends RefCounted

const MortalityCore = preload("res://core/life/mortality.gd")
const LegacyBookCore = preload("res://core/life/legacy_book.gd")

var _fails := 0


func _ok(value: bool, message: String) -> void:
	if not value:
		printerr("  FAIL: %s" % message)
		_fails += 1


func run() -> bool:
	var ex := EffectExecutor.new()
	var st := WorldState.new()
	st.seed = "mortality-test"
	st.jdn = GameDate.from_gregorian(1325, 1, 1).jdn
	st.birthdate_jdn = GameDate.from_gregorian(1280, 1, 1).jdn
	st.character = {"archetype_id": "translator", "birth_year": 1280}
	st.city = "balc"
	st.revealed = {"balc": 3, "rt-balc-samarcanda": 3}
	st.codex = ["cx-balc"]
	st.items = ["it-letter-of-introduction", "it-paiza"]
	st.birthdate_jdn = GameDate.from_gregorian(1280, 12, 31).jdn
	_ok(MortalityCore.age_years(st) == 44,
		"mortality age respects whether the birthday has occurred")

	# Even maximum exposure cannot kill a healthy character in one unseen roll.
	var fx := MortalityCore.exposure_effects(st, 60, 5, ["fever"], Rng.new("first"), "hard-road")
	ex.execute(st, fx, {"event_id": "mortality:first"})
	_ok(not bool(st.life.get("deceased", false)), "first exposure never kills without warning")
	_ok(String(st.life.get("stage", "")) in MortalityCore.VALID_STAGES, "life stage remains valid")

	# A dying character left unresolved crosses the explicit terminal boundary.
	st.life["vitality"] = 5
	st.life["stage"] = MortalityCore.DYING
	st.life["stage_since_jdn"] = st.jdn - MortalityCore.CRISIS_GRACE_DAYS
	var terminal := MortalityCore.exposure_effects(st, 1, 0, [], Rng.new("terminal"), "unresolved")
	ex.execute(st, terminal, {"event_id": "mortality:terminal"})
	_ok(bool(st.life.get("deceased", false)), "unresolved warned crisis can end the life")

	st.life["legacy_prepared"] = true
	var volume := LegacyBookCore.archive(st, "end-witness-of-the-world")
	_ok(int(volume["map"]["balc"]) == 2, "inherited map loses one certainty level")
	var unprepared := st.duplicate_state()
	unprepared.life["legacy_prepared"] = false
	var rough_copy := LegacyBookCore.archive(unprepared)
	_ok(int(rough_copy["map"]["balc"]) == 1,
		"preparing the legacy has a visible map-certainty benefit")
	st.legacy["volumes"].append(volume)
	_ok(LegacyBookCore.current_volume(st) == volume,
		"the current life archive can be reused without duplication")
	var successor := WorldState.new()
	successor.seed = "successor"
	successor.city = "balc"
	ex.execute(successor, LegacyBookCore.inheritance_effects(volume, "it-paiza"),
		{"event_id": "inheritance"})
	_ok(successor.revealed.get("balc", 0) == 2, "successor receives copied map")
	_ok("cx-balc" in successor.codex, "successor receives the written codex")
	_ok("it-paiza" in successor.items and "it-letter-of-introduction" not in successor.items,
		"successor receives exactly the selected heirloom")
	_ok(successor.coins == 0 and successor.learned_divinations.is_empty(),
		"wealth and learned methods do not transfer")
	var invalid_stage := WorldState.new()
	_ok(ex.execute(invalid_stage, [{"op": "life_stage", "value": "deceased",
		"reason": "invalid-shortcut"}], {"event_id": "invalid-stage"}).applied.size() == 0,
		"life_stage cannot create a deceased state without death metadata")

	print("test_mortality: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
