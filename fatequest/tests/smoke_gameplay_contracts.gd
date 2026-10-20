extends SceneTree

## Runtime content contract: every visible choice, city and opening screen must
## have a recoverable next step. This complements validate.mjs, which checks the
## same records statically, by loading the production ContentDb and main scene.

var failures := 0
var event_choices := 0
var cities_checked := 0
var routes_checked := 0


func check(ok: bool, message: String) -> void:
	if not ok:
		failures += 1
		printerr("FAIL contract: " + message)


func _effects_have_queue(value: Variant) -> bool:
	if value is Array:
		for effect in value:
			if _effects_have_queue(effect):
				return true
		return false
	if value is Dictionary:
		if String(value.get("op", "")) == "queue_event":
			return true
		for nested in value.values():
			if nested is Array or nested is Dictionary:
				if _effects_have_queue(nested):
					return true
	return false


func _choice_has_feedback(choice: Dictionary) -> bool:
	return not String(choice.get("resultText", "")).is_empty() \
		or not String(choice.get("divination", "")).is_empty() \
		or _effects_have_queue(choice.get("effects", [])) \
		or _effects_have_queue(choice.get("pass", {})) \
		or _effects_have_queue(choice.get("fail", {})) \
		or _effects_have_queue(choice.get("lessonFailEffects", []))


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	I18n.load_lang("en")
	var db := ContentDb.new()
	var record_count := db.load_all()
	check(record_count > 0, "content database loads production records")

	var event_ids := {}
	var events: Array = db.get_table("events")
	for event in events:
		event_ids[String(event.get("id", ""))] = true
	for event in events:
		var choices: Array = event.get("choices", [])
		check(not choices.is_empty(), "%s has at least one choice" % String(event.get("id", "")))
		for i in choices.size():
			var choice: Dictionary = choices[i]
			event_choices += 1
			check(not String(choice.get("label", "")).is_empty(),
				"%s choice %d has a label" % [String(event.get("id", "")), i + 1])
			check(_choice_has_feedback(choice),
				"%s choice %d has visible feedback or a queued continuation" \
				% [String(event.get("id", "")), i + 1])
			for effects in [choice.get("effects", []), choice.get("pass", {}).get("effects", []),
					choice.get("fail", {}).get("effects", []), choice.get("lessonFailEffects", [])]:
				for effect in effects:
					if String(effect.get("op", "")) == "queue_event":
						check(event_ids.has(String(effect.get("value", ""))),
							"%s queues an existing event" % String(event.get("id", "")))

	var city_ids := {}
	for city in db.cities():
		var city_id := String(city.get("id", ""))
		city_ids[city_id] = true
		cities_checked += 1
		var outbound := 0
		for route in db.get_table("routes"):
			if String(route.get("from", "")) == city_id or String(route.get("to", "")) == city_id:
				outbound += 1
		check(outbound > 0, "city %s has a map exit" % city_id)
	for route in db.get_table("routes"):
		routes_checked += 1
		var from_id := String(route.get("from", ""))
		var to_id := String(route.get("to", ""))
		check(city_ids.has(from_id) and city_ids.has(to_id),
			"route %s points to existing cities" % String(route.get("id", "")))
		check(not Array(route.get("modes", [])).is_empty(),
			"route %s offers a travel mode" % String(route.get("id", "")))

	var audio := root.get_node_or_null("AudioDirector")
	check(audio != null and audio.has_method("intro_available") and audio.intro_available(),
		"opening theme is available to the runtime")
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	await process_frame
	if audio != null and audio.has_method("intro_active"):
		check(audio.intro_active(), "boot desk starts the separate opening theme")
	if is_instance_valid(main):
		main.queue_free()
	print("GAMEPLAY CONTRACTS: records=%d events_choices=%d cities=%d routes=%d failures=%d" \
		% [record_count, event_choices, cities_checked, routes_checked, failures])
	quit(0 if failures == 0 else 1)
