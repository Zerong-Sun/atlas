extends "res://tests/audit_ui_screens.gd"

func settle() -> void:
	for i in 6: await process_frame

func _run() -> void:
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		quit(1)
		return
	phase = "after"
	var preferences := ConfigFile.new()
	preferences.set_value("ui", "reduce_motion", true)
	preferences.set_value("ui", "reading_tip_seen", true)
	preferences.save(UiScale.CFG)
	root.mode = Window.MODE_WINDOWED
	root.size = Vector2i(1280, 720)
	root.grab_focus()
	main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await settle()
	main._begin(main.db.get_record("merchant"))
	await settle()
	Motion.reduce_motion = true
	main.state.city = "zayton"
	main.state.active_event = ""
	main.state.pending_events.clear()
	main.state.coins = 0
	main.state.visited.assign(["zayton"])
	main.state.revealed["zayton"] = 3
	main.state.revealed["fuju"] = 2
	main.state.revealed["rt-fuju-zayton"] = 1
	main._refresh_hud()
	main._map.reset_local_view()
	for preset in ["normal-zh", "compact-zh", "large-en"]:
		root.mode = Window.MODE_WINDOWED
		root.content_scale_size = Vector2i(960, 640) if preset == "compact-zh" else Vector2i(1280, 720)
		root.size = root.content_scale_size
		root.grab_focus()
		UiScale.step = UiScale.Size.NORMAL if preset == "normal-zh" else UiScale.Size.LARGE
		I18n.load_lang("en" if preset == "large-en" else "zh")
		main._restyle_all()
		clear_modals()
		main._city_life_layer.hide()
		main._open_city()
		await capture(preset + "-city", main._city_view)
		main._open_city_life()
		var view = main._city_life_view
		view._tab = "work"
		view._job = "laundry"
		view._months = 12
		view._render()
		await capture(preset + "-laundry-year", view)
		view._scroll.scroll_vertical = 99999
		await capture(preset + "-work-bottom", view)
		view._tab = "credit"
		view._render()
		await capture(preset + "-credit", view)
		view._tab = "ending"
		view._end_kind = "failed"
		view._render()
		await capture(preset + "-end-confirm", view)
		main._close_city_life()
		main._open_market()
		await capture(preset + "-market", main._market_view)
		clear_modals()
		main._show_event(main.db.get_record("ev-zayton-harbour"))
		await capture(preset + "-story", main._dialog)
		clear_modals()
		main._close_city()
		await capture(preset + "-new-city-tags")
		if preset == "normal-zh":
			main._on_city_clicked(main.db.get_record("zayton"))
			await capture("normal-zh-city-card", main._city_detail_card)
			clear_modals()
			var route: Dictionary = main.db.get_record("rt-fuju-zayton")
			main._on_depart(route, String(route.modes[0]))
			await capture("normal-zh-travel-card", main._travel_confirm)
			clear_modals()
			main._open_book()
			await capture("normal-zh-book", main._book_view)
			clear_modals()
			main._open_codex()
			await capture("normal-zh-codex", main._codex_view)
			clear_modals()
			main._open_bag()
			await capture("normal-zh-bag", main._bag.panel)
			clear_modals()
			main._open_party()
			await capture("normal-zh-party", main._party.panel)
			clear_modals()
			main._settings.layer.show()
			await capture("normal-zh-settings", main._settings.panel)
			clear_modals()
	I18n.load_lang("zh")
	UiScale.step = UiScale.Size.NORMAL
	root.content_scale_size = Vector2i(1280, 720)
	root.size = root.content_scale_size
	main._restyle_all()
	main._open_city()
	main._open_city_life()
	var view = main._city_life_view
	view._tab = "work"
	view._job = "laundry"
	view._months = 12
	view._render()
	view._commit.pressed.emit()
	await capture("laundry-year-result", view)
	view._tab = "credit"
	view._render()
	view._commit.pressed.emit()
	await capture("loan-note", view)
	view._tab = "ending"
	view._end_kind = "failed"
	view._render()
	view._commit.pressed.emit()
	await capture("journey-failed", view)
	var out := FileAccess.open(evidence.path_join("after.json"), FileAccess.WRITE)
	out.store_string(JSON.stringify(records, "\t"))
	print("CITY_LIFE_AUDIT: %d captures" % records.size())
	quit(0)
