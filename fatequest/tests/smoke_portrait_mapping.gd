extends SceneTree

const PORTRAIT_TAGS_PATH := "res://assets/art/PORTRAIT_TAGS.json"

var failures: Array[String] = []
var checks := 0

func _init() -> void:
	var unknown := {"id": "ev-new-port-mentor-tea", "title": "未知见闻"}
	_check(MapArt.event_portrait(unknown, "islamic", 0) == null, "Unbound event must not become a merchant/mentor")
	_check(MapArt.event_portrait(unknown, "islamic", 5) == null, "Card reorder must not assign a new face")
	var meal := {"id": "ev-alexandria-welcome-meal"}
	var host := MapArt.event_portrait(meal, "islamic", 0)
	_check(host != null, "Reviewed meal host must resolve")
	_check(host == MapArt.event_portrait(meal, "latin", 4), "Explicit character stays the same across slots/cultures")
	_check(MapArt.event_portrait({"id": "ev-alexandria-welcome-gate"}, "islamic") == MapArt.tex("npc-alexandria-porter"), "Gate porter uses the reviewed single-person portrait")
	_check(MapArt.event_portrait({"job": "guide", "gender": "f"}, "islamic") == null, "Female job must not borrow male portrait")
	_check(MapArt.event_portrait({"portrait": "missing-art"}, "islamic") == null, "Missing explicit portrait must fail safely")
	var guide := MapArt.retainer_portrait("npc-baldacum-mentor", "islamic")
	_check(guide == MapArt.tex("retainer-guide-isl"), "Guide/interpreter mentor must follow roles, not id keyword")
	_check(guide == MapArt.retainer_portrait("npc-baldacum-mentor", "east_asia"), "Travel must not change retainer origin/face")
	_check(MapArt.retainer_portrait("npc-zayton-mentor", "east_asia", "f") == null, "Elderly female mentor must not use paired/male image")
	_check(MapArt.retainer_portrait("npc-chandu-guide", "steppe") == null, "Steppe character must not borrow unrelated culture")
	_check(MapArt.job_portrait("guide", "east_asia") == null, "Mislabeled con guide must not appear")
	_check(MapArt.mentor_portrait("iching") == null, "Unsplit mentor sheet must not appear as one person")
	_check(MapArt.retainer_portrait("unknown-guide", "islamic") == null, "Unknown retainer id must not invent identity")
	var city := {"id": "balc", "band": "central_asia", "culture": "steppe"}
	_check(MapArt.city_explore_bg(city, 0) == MapArt.city_explore_bg(city, 2), "City background must not depend on site order")
	_check(MapArt.city_explore_bg(city) != MapArt.tex("site-balc-1"), "Unsplit three-scene plate must not become city background")
	_check(MapArt.event_scene(unknown, city) == MapArt.city_scene(city), "Unknown event must use city establishing shot")
	_check(MapArt.city_scene({"id": "unknown", "band": "unknown"}) == null, "Unknown geography must not default to Christian Europe")
	_check(MapArt.event_portrait({"id": null, "art": null, "job": null, "gender": null}, "islamic") == null,
		"Null optional metadata must remain safe")
	_check(MapArt.event_scene({"id": null, "art": false, "scene": ["bad"]}, city) == MapArt.city_scene(city),
		"Malformed optional scene metadata must use city fallback")
	_check(MapArt.city_scene({"id": null, "band": null, "scene": {"unexpected": true}}) == null,
		"Null city metadata must not invent geography")
	_check(MapArt.event_portrait({"characterId": "npc-zayton-mentor", "portrait": "retainer-seer-isl"}, "islamic") == null,
		"Explicit art must not override a known woman's recorded gender")
	_check(MapArt.tex("../art/npc-inn-isl") == null and MapArt.tex("npc-inn-isl.webp") == null,
		"Texture stems cannot traverse directories or include extensions")
	_check(MapArt.event_portrait({"portrait": "npc-job-guide-con"}, "east_asia") == null,
		"Explicit authored portrait still requires the audited allowlist")
	var manifest: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(MapArt.PORTRAIT_MAP_PATH))
	var tags: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(PORTRAIT_TAGS_PATH))
	var tag_rows: Dictionary = tags.get("portraits", {})
	_check(not tag_rows.is_empty(), "Portrait tag database is present")
	for stem in manifest.get("portraits", {}):
		_check(MapArt.tex(String(stem)) != null, "Every audited portrait resolves: " + String(stem))
		_check(tag_rows.has(stem), "Every audited portrait has a label: " + String(stem))
		if tag_rows.has(stem):
			var tag: Dictionary = tag_rows[stem]
			for field in ["gender", "culture_background", "age_range", "attire_props", "source_basis", "review_status"]:
				_check(tag.has(field) and not String(tag.get(field, "")).is_empty(),
					"Portrait label has %s: %s" % [field, String(stem)])
			var expected_culture := _culture_from_stem(String(stem))
			_check(expected_culture == "unknown" or String(tag.get("culture_background", "")) == expected_culture,
				"Portrait label culture matches asset set: " + String(stem))
	for section in ["jobs", "venues"]:
		for culture in manifest.get(section, {}):
			for role in manifest[section][culture]:
				var stem := String(manifest[section][culture][role])
				_check(manifest["portraits"].has(stem), "Every role references audited art: " + String(role))
				_check(tag_rows.has(stem), "Every role references labeled art: " + String(role))
				if tag_rows.has(stem):
					_check(String(tag_rows[stem].get("culture_background", "")) == String(culture),
						"Role culture cannot borrow another set: %s/%s" % [String(culture), String(role)])
	var db := ContentDb.new()
	db.load_all()
	for section in ["events", "characters"]:
		for record_id in manifest.get(section, {}):
			_check(not db.get_record(String(record_id)).is_empty(), "Binding points to an existing record: " + String(record_id))
			var stem := String(manifest[section][record_id].get("portrait", ""))
			_check(stem.is_empty() or manifest["portraits"].has(stem), "Explicit binding references audited art: " + String(record_id))
	for method in manifest.get("mentors", {}):
		_check(manifest["portraits"].has(manifest["mentors"][method]), "Method illustration references audited art: " + String(method))
	for section in ["events", "characters"]:
		for record_id in manifest.get(section, {}):
			var binding: Dictionary = manifest[section][record_id]
			var stem := String(binding.get("portrait", ""))
			if stem.is_empty():
				continue
			_check(tag_rows.has(stem), "Explicit binding references labeled art: " + String(record_id))
			if tag_rows.has(stem) and binding.has("gender"):
				_check(String(tag_rows[stem].get("gender", "")) == String(binding.get("gender", "")),
					"Explicit binding gender matches labeled art: " + String(record_id))
	# Dynamic retainer resolution must preserve the authored origin culture and
	# any explicitly declared gender. Unknown/unsupported cultures may return no
	# portrait, but they may never borrow a different culture's image.
	for rec in db.get_table("retainers"):
		var rec_id := String(rec.get("id", ""))
		var origin: Dictionary = rec.get("origin", {})
		var origin_culture := String(origin.get("culture", ""))
		var requested_gender := String(rec.get("gender", ""))
		var resolved := MapArt.retainer_portrait(rec_id, origin_culture, requested_gender)
		if resolved == null:
			continue
		var resolved_stem := ""
		for stem in tag_rows:
			if MapArt.tex(String(stem)) == resolved:
				resolved_stem = String(stem)
				break
		_check(not resolved_stem.is_empty(), "Resolved retainer image has a label: " + rec_id)
		if not resolved_stem.is_empty():
			_check(String(tag_rows[resolved_stem].get("culture_background", "")) == origin_culture,
				"Retainer origin culture cannot change portrait: " + rec_id)
			if not requested_gender.is_empty():
				_check(String(tag_rows[resolved_stem].get("gender", "")) == requested_gender,
					"Retainer gender cannot change portrait: " + rec_id)
	var snapshot := MapArt._portrait_map.duplicate(true)
	MapArt._portrait_map["events"] = null
	MapArt._portrait_map["jobs"] = []
	MapArt._portrait_map["mentors"] = false
	_check(MapArt.event_portrait(meal, "islamic") == null and MapArt.job_portrait("guide", "islamic") == null
		and MapArt.mentor_portrait("bazi") == null, "Malformed mapping sections fail closed")
	MapArt._portrait_map = snapshot
	for failure in failures:
		printerr("FAIL: " + failure)
	print("PORTRAIT_MAPPING: %s (%d checks, %d failures)" % ["PASS" if failures.is_empty() else "FAIL", checks, failures.size()])
	quit(0 if failures.is_empty() else 1)

func _check(condition: bool, message: String) -> void:
	checks += 1
	if not condition:
		failures.append(message)


func _culture_from_stem(stem: String) -> String:
	if stem.ends_with("-chr"):
		return "latin"
	if stem.ends_with("-isl"):
		return "islamic"
	if stem.ends_with("-con"):
		return "east_asia"
	if stem.ends_with("-mazu"):
		return "indian_ocean"
	if stem == "mentor-bazi":
		return "east_asia"
	return "unknown"
