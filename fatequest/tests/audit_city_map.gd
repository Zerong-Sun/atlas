extends "res://tests/audit_ui_screens.gd"

func _run() -> void:
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		quit(1)
		return
	phase = "after"
	var preferences := ConfigFile.new()
	preferences.set_value("ui", "reduce_motion", true)
	preferences.save(UiScale.CFG)
	root.mode = Window.MODE_WINDOWED
	root.grab_focus()
	root.content_scale_size = Vector2i(1280, 720)
	root.size = root.content_scale_size
	main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await settle()
	main._begin(main.db.get_record("merchant"))
	await settle()
	Motion.reduce_motion = true
	main.state.active_event = ""
	main.state.pending_events.clear()
	main.state.city = "zayton"
	main.state.coins = 100000
	main._dock_h.clear()
	for preset in ["normal-zh", "compact-zh", "large-en"]:
		root.content_scale_size = Vector2i(960, 640) if preset == "compact-zh" else Vector2i(1280, 720)
		root.mode = Window.MODE_WINDOWED
		root.size = root.content_scale_size
		root.grab_focus()
		UiScale.step = UiScale.Size.NORMAL if preset == "normal-zh" else UiScale.Size.LARGE
		I18n.load_lang("en" if preset == "large-en" else "zh")
		main._restyle_all()
		clear_modals()
		main._open_city()
		main._city_view._figure_scroll.scroll_vertical = 0
		await capture(preset + "-city", main._city_view)
		main._city_view._figure_scroll.scroll_vertical = 99999
		await capture(preset + "-city-bottom", main._city_view)
		main.state.once_fired["ev-zayton-harbour"] = true
		main._open_city()
		main._city_view._figure_scroll.scroll_vertical = 0
		await capture(preset + "-city-visited", main._city_view)
		main.state.once_fired.erase("ev-zayton-harbour")
		main._open_market()
		await capture(preset + "-market", main._market_view)
		clear_modals()
		for c in ["zayton", "fuju", "kinsay", "chandu", "cambaluc"]:
			main.state.revealed[c] = 3
		for r in ["rt-fuju-zayton", "rt-kinsay-zayton"]:
			main.state.revealed[r] = 3
		main.state.journey_legs = [{"from": "kinsay", "to": "fuju", "jdn": 1}, {"from": "fuju", "to": "zayton", "jdn": 2}]
		main._refresh_hud()
		main._close_city()
		main._map.reset_local_view()
		main._log.text = I18n.t("ui.map.legend")
		await capture(preset + "-map-nearby")
		main._map.set_zoom(1.0, main._map_centre(), false)
		await capture(preset + "-map-world")
		main._map.set_zoom(12.0, main._map_centre(), false)
		main._map.center_on("zayton")
		await capture(preset + "-map-close")
	# Dense all-known eastern cities, with actual labels and repeat travel arrows.
	UiScale.step = UiScale.Size.NORMAL
	I18n.load_lang("zh")
	main._restyle_all()
	for c in main.db.cities():
		main.state.revealed[String(c.id)] = 3
	main.state.city = "kinsay"
	main._refresh_hud()
	main._map.reset_local_view()
	main._show_roads()
	await capture("dense-map-nearby")
	main._map.set_zoom(12, main._map_centre(), false)
	await capture("dense-map-close")
	for city in ["accon", "tauris", "baldacum", "alexandria"]:
		assert(not main.db.get_record(city).is_empty())
		main.state.city = city
		main._open_city()
		await capture("city-" + city, main._city_view)
	var file := FileAccess.open(evidence.path_join("after.json"), FileAccess.WRITE)
	file.store_string(JSON.stringify(records, "\t"))
	print("CITY_MAP_AUDIT: %d captures" % records.size())
	quit(0)

func settle() -> void:
	for i in 6:
		await process_frame
