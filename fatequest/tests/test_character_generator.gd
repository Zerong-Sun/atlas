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
	var archetypes := db.get_table("archetypes")
	var eras := db.get_table("campaign_eras")
	var names := db.get_table("character_names")
	_ok(names.size() == 20, "the name library has twenty people")
	var prior_language := I18n.lang()
	for language in ["zh", "en"]:
		I18n.load_lang(language)
		var rendered_names := {}
		for person in names:
			var key := String(person.get("name", ""))
			var rendered := I18n.t(key)
			_ok(not key.is_empty() and rendered != key and not rendered_names.has(rendered),
				"%s name %s has a unique translation" % [language, key])
			rendered_names[rendered] = true
	I18n.load_lang(prior_language)
	var a: Array = CharacterGeneratorCore.generate_slate(
		archetypes, eras, names, Rng.new("slate-test"), 3)
	var b: Array = CharacterGeneratorCore.generate_slate(
		archetypes, eras, names, Rng.new("slate-test"), 3)
	_ok(a == b, "same seed creates the same complete slate")
	_ok(a.size() == 3, "opening slate contains three candidates")
	var ids := {}
	var cultures := {}
	var person_names := {}
	var era_ids := {}
	for candidate in a:
		ids[String(candidate.get("id", ""))] = true
		cultures[String(candidate.get("culture", ""))] = true
		person_names[String(candidate.get("person_name", ""))] = true
		era_ids[String(candidate.get("era_id", ""))] = true
		_ok(CharacterGeneratorCore.validate_candidate(candidate).is_empty(),
			"candidate is internally valid")
		var era: Dictionary = db.get_record(String(candidate["era_id"]))
		_ok(candidate["start_date"] == era.get("startDate", {}),
			"candidate carries its randomly assigned campaign era")
		var person: Dictionary = names.filter(func(entry: Dictionary):
			return entry.get("name", "") == candidate.get("person_name", ""))[0]
		_ok(person.get("culture") == candidate.get("culture") \
			and person.get("faith") == candidate.get("faith"),
			"person name matches heritage and faith")
		_ok(int(candidate["birth"]["age"]) >= 18 \
			and int(candidate["birth"]["age"]) <= 60,
			"candidate age is within the authored range")
		_ok(CharacterGeneratorCore.age_on_date(candidate["birth"],
			candidate["start_date"]) == int(candidate["birth"]["age"]),
			"displayed age matches birth date on the exact start day")
	_ok(ids.size() == 3, "the three offered roles do not repeat")
	_ok(cultures.size() == 3, "the three offered backgrounds do not repeat")
	_ok(person_names.size() == 3, "the three offered names do not repeat")
	_ok(era_ids.size() == 1, "all three choices share one campaign era")

	var rerolled: Array = CharacterGeneratorCore.generate_slate(
		archetypes, eras, names, Rng.new("another-slate"), 3)
	_ok(a != rerolled, "a new draw changes the slate")
	var fingerprints := {}
	for candidate in a + rerolled:
		var cid := String(candidate.get("candidate_id", ""))
		_ok(not fingerprints.has(cid), "different generated people do not reuse a run identity")
		fingerprints[cid] = true
	for era in eras:
		var single_era_slate: Array = CharacterGeneratorCore.generate_slate(archetypes,
			[era], names, Rng.new("era-coverage:%s" % era.id), 3)
		_ok(single_era_slate.size() == 3,
			"era %s has three valid playable roles" % era.id)
	var observed_roles := {}
	var observed_eras := {}
	for seed_index in 100:
		var slate: Array = CharacterGeneratorCore.generate_slate(archetypes, eras, names,
			Rng.new("coverage:%d" % seed_index), 3)
		var slate_roles := {}
		var slate_cultures := {}
		var slate_names := {}
		var slate_eras := {}
		for candidate in slate:
			observed_roles[candidate.id] = true
			observed_eras[candidate.era_id] = true
			slate_roles[candidate.id] = true
			slate_cultures[candidate.culture] = true
			slate_names[candidate.person_name] = true
			slate_eras[candidate.era_id] = true
			var role: Dictionary = db.get_record(String(candidate.id))
			_ok(role.get("availableEras", []).is_empty()
				or candidate.era_id in role.get("availableEras", []),
				"draw %d does not place a role outside its era" % seed_index)
		_ok(slate.size() == 3 and slate_roles.size() == 3
			and slate_cultures.size() == 3 and slate_names.size() == 3
			and slate_eras.size() == 1,
			"draw %d contains three distinct contemporaries" % seed_index)
	_ok(observed_roles.size() == archetypes.size(),
		"random draws make every authored role reachable")
	_ok(observed_eras.size() == eras.size(),
		"random draws reach every authored era")

	var short_pool: Array = archetypes.slice(0, 2)
	_ok(CharacterGeneratorCore.generate_slate(short_pool, eras, names,
		Rng.new("insufficient-roles"), 3).is_empty(),
		"fewer than three distinct backgrounds never creates a partial choice")
	var thin_names: Array = names.filter(func(person: Dictionary):
		return person.get("culture", "") in ["latin", "steppe"])
	_ok(CharacterGeneratorCore.generate_slate(archetypes, eras, thin_names,
		Rng.new("insufficient-names"), 3).is_empty(),
		"a depleted name library never creates a partial choice")
	var one_era: Dictionary = db.get_record("era-1253")
	var viable_era: Dictionary = db.get_record("era-1325")
	var era_pool: Array = archetypes.filter(func(role: Dictionary):
		return role.get("id", "") in ["polo", "merchant", "cartographer"])
	var recovered: Array = CharacterGeneratorCore.generate_slate(era_pool,
		[one_era, viable_era], names, Rng.new("skip-ineligible-era"), 3)
	_ok(recovered.size() == 3 and recovered[0].era_id == viable_era.id,
		"draw skips an era with too few available identities")

	print("test_character_generator: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
