extends RefCounted

const CharacterGeneratorCore = preload("res://core/character/character_generator.gd")

var _fails := 0


func _ok(value: bool, message: String) -> void:
	if not value:
		printerr("  FAIL: %s" % message)
		_fails += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var era: Dictionary = db.get_record("era-1325")
	var a: Array = CharacterGeneratorCore.generate_slate(
		db.get_table("archetypes"), era, Rng.new("slate-test"), 3)
	var b: Array = CharacterGeneratorCore.generate_slate(
		db.get_table("archetypes"), era, Rng.new("slate-test"), 3)
	_ok(a == b, "same seed creates the same complete slate")
	_ok(a.size() == 3, "opening slate contains three candidates")
	var ids := {}
	for candidate in a:
		ids[String(candidate.get("id", ""))] = true
		_ok(CharacterGeneratorCore.validate_candidate(candidate).is_empty(),
			"candidate is internally valid")
		_ok(int(candidate["start_date"]["year"]) == 1325,
			"candidate uses the selected campaign era")
		_ok(int(candidate["birth"]["age"]) >= 18 \
			and int(candidate["birth"]["age"]) <= 60,
			"candidate age is within the authored range")
		_ok(CharacterGeneratorCore.age_on_date(candidate["birth"],
			candidate["start_date"]) == int(candidate["birth"]["age"]),
			"displayed age matches birth date on the exact start day")
	_ok(ids.size() == 3, "the three offered backgrounds do not repeat")

	var other: Array = CharacterGeneratorCore.generate_slate(
		db.get_table("archetypes"), db.get_record("era-1405"), Rng.new("slate-test"), 3)
	_ok(a != other, "changing era changes the slate")
	var rerolled: Array = CharacterGeneratorCore.generate_slate(
		db.get_table("archetypes"), era, Rng.new("another-slate"), 3)
	var fingerprints := {}
	for candidate in a + rerolled:
		var cid := String(candidate.get("candidate_id", ""))
		_ok(not fingerprints.has(cid), "different generated people do not reuse a run identity")
		fingerprints[cid] = true

	print("test_character_generator: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
