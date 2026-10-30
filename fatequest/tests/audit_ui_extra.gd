extends "res://tests/audit_ui_screens.gd"

func _run() -> void:
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		quit(1)
		return
	phase = "extras"
	root.size = Vector2i(1280, 720)
	main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await settle()
	main._begin(main.db.get_record("merchant"))
	await settle()
	UiScale.step = UiScale.Size.NORMAL
	UiScale.high_contrast = false
	Motion.reduce_motion = true
	I18n.load_lang("zh")
	main._restyle_all()
	clear_modals()
	for city in ["alexandria", "baldacum", "tauris", "babylonia-cairus"]:
		main.state.city = city
		main._open_city()
		await capture("city-" + city, main._city_view)
	root.content_scale_size = Vector2i(960, 640)
	root.size = root.content_scale_size
	UiScale.step = UiScale.Size.LARGE
	main._restyle_all()
	for method in main.divination_catalog.methods():
		clear_modals()
		main._practice_annex_method(method)
		await capture("practice-" + method, main._lesson_ui)
		if method in ["tarot", "qimen", "iching"]:
			var scroll: ScrollContainer = main._lesson_ui._challenge_view.get_node("ChallengeReadingArea")
			scroll.scroll_vertical = 99999
			await capture("practice-" + method + "-end", main._lesson_ui)
	clear_modals()
	main.state.city = "zayton"
	main._open_city()
	main._open_market()
	main.state.goods.clear()
	main._market_view.refresh()
	main._market_view._tabs.current_tab = 1
	await capture("empty-cargo", main._market_view)
	clear_modals()
	UiScale.high_contrast = true
	main._restyle_all()
	main._show_event(main.db.get_record("ev-alexandria-welcome-gate"))
	await capture("contrast-story", main._dialog)
	clear_modals()
	main._open_book("vol-polo")
	await capture("contrast-book", main._book_view)
	clear_modals()
	main._open_market()
	await capture("contrast-market", main._market_view)
	clear_modals()
	main._practice_annex_method("tarot")
	await capture("contrast-practice", main._lesson_ui)
	var file := FileAccess.open(evidence.path_join("extras.json"), FileAccess.WRITE)
	file.store_string(JSON.stringify(records, "\t"))
	var failures := records.filter(func(row): return row.has("fits") and not row.fits).size()
	print("UI EXTRA AUDIT: %d captures, %d overflows" % [records.size(), failures])
	quit(0 if failures == 0 else 1)
