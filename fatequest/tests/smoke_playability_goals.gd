extends SceneTree

## A reached destination can complete a reach goal. A network goal stays
## visible until the game has an actual relationship completion condition.
var failures: Array[String] = []
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 60.0:
		printerr("PLAYABILITY_GOALS: watchdog")
		quit(1)
	return false


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
	var original_visits: Array[String] = main.state.visited.duplicate()
	for lang in ["zh", "en"]:
		I18n.load_lang(lang)
		for archetype in main.db.get_table("archetypes"):
			var target := String(archetype.get("goal", {}).get("target", ""))
			if target.is_empty():
				continue
			main.state.character["archetype_id"] = String(archetype.get("id", ""))
			main.state.visited = original_visits.duplicate()
			var before: String = main._journey_guide_text(main.db.get_record(main.state.city))
			main.state.visited.append(target)
			var after: String = main._journey_guide_text(main.db.get_record(main.state.city))
			var name: String = main._city_name(target)
			var is_network: bool = String(archetype.get("goal", {}).get("type", "")) == "network"
			_check(before.contains(name), "%s %s goal names target before visit" % [lang, archetype.id])
			if is_network:
				_check(after.contains(I18n.t("ui.guide.goal_network") % name),
					"%s %s keeps network objective after visit" % [lang, archetype.id])
			else:
				_check(after.contains(I18n.t("ui.guide.goal_arrived") % name),
					"%s %s acknowledges reaching target" % [lang, archetype.id])
	# Verify the player's city screen uses the same message after reaching a
	# network target, including when the language changes while it is open.
	main.state.character["archetype_id"] = "merchant"
	main.state.city = "zayton"
	main.state.visited.clear()
	main.state.visited.append("ormus")
	main.state.visited.append("zayton")
	main._open_city()
	await process_frame
	_check(main._city_view._guide.text.contains(I18n.t("ui.guide.goal_network") %
		main._city_name("zayton")), "arrived city retains network objective")
	I18n.load_lang("zh")
	main._restyle_all()
	await process_frame
	_check(main._city_view._guide.text.contains(I18n.t("ui.guide.goal_network") %
		main._city_name("zayton")), "open city refreshes translated objective")
	print("PLAYABILITY_GOALS: %s" % ("PASS" if failures.is_empty() else str(failures)))
	quit(0 if failures.is_empty() else 1)
