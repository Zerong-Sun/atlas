extends SceneTree

## Each city site must be distinct and reachable from both city and road views.
var failures: Array[String] = []


func _check(ok: bool, label: String) -> void:
	if not ok:
		failures.append(label)
		printerr("FAIL " + label)


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	main._begin(main.db.get_record("merchant"))
	await process_frame
	main._dialog_layer.visible = false
	main.state.active_event = ""
	main.state.pending_events.clear()
	for city_id in ["nanghin", "tiju"]:
		var city: Dictionary = main.db.get_record(city_id)
		var site_ids: Array = city.get("sites", [])
		var distinct: Dictionary = {}
		for event_id in site_ids:
			distinct[event_id] = true
		_check(site_ids.size() >= 2 and distinct.size() == site_ids.size(),
			"%s has at least two distinct site ids" % city_id)
		main.state.city = city_id
		main._open_city()
		await process_frame
		for event_id in site_ids:
			var cards := 0
			for figure in main._city_view._figures.get_children():
				if String(figure.get_meta("event_id", "")) == event_id:
					cards += 1
			_check(cards == 1, "%s shows one city card for %s" % [city_id, event_id])
		main._close_city()
		await process_frame
		for event_id in site_ids:
			var buttons := 0
			var title: String = I18n.t(main.db.get_record(event_id).get("title", ""))
			for child in main._panel.get_children():
				if child is Button and String(child.text).contains(title):
					buttons += 1
			_check(buttons == 1, "%s shows one road-panel action for %s" % [city_id, event_id])
	print("PLAYABILITY_CITY_SITES: %s" % ("PASS" if failures.is_empty() else str(failures)))
	quit(0 if failures.is_empty() else 1)
