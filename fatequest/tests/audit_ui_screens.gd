extends SceneTree

## Run in an isolated user-data project; -- before/after selects the evidence folder.
var main
var phase := "before"
var evidence := "res://build/ui-audit"
var records: Array = []
var elapsed := 0.0

func _init() -> void:
	if not OS.get_environment("FATEQUEST_AUDIT_OUTPUT").is_empty():
		evidence = OS.get_environment("FATEQUEST_AUDIT_OUTPUT")
	if not OS.get_cmdline_user_args().is_empty():
		phase = OS.get_cmdline_user_args()[0]
	call_deferred("_run")

func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 180:
		printerr("UI AUDIT: watchdog")
		quit(1)
	return false

func settle() -> void:
	for i in 12:
		await process_frame

func capture(id: String, panel: Control = null) -> void:
	await settle()
	await create_timer(0.25).timeout
	var row := {"screen": id, "viewport": str(root.get_visible_rect().size)}
	if panel != null:
		row["rect"] = str(panel.get_global_rect())
		row["fits"] = root.get_visible_rect().encloses(panel.get_global_rect())
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		var dir := evidence.path_join(phase)
		DirAccess.make_dir_recursive_absolute(dir)
		root.get_texture().get_image().save_png(dir.path_join(id + ".png"))
	records.append(row)
	print("CAPTURE ", row)

func clear_modals() -> void:
	for entry in main._modal_entries().values():
		if entry is Dictionary and entry.has("layer"):
			entry.layer.visible = false
	for layer in [main._dialog_layer, main._market_layer, main._book_layer,
		main._codex_layer, main._city_detail_layer, main._travel_confirm_layer,
		main._lesson_layer, main._annex_layer, main._save_layer,
		main._bag.layer, main._party.layer, main._settings.layer, main._ending_ui.layer]:
		layer.visible = false

func _run() -> void:
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		printerr("UI AUDIT: use the isolated FateQuest-UI-Audit user-data project")
		quit(1)
		return
	var preferences := ConfigFile.new()
	preferences.set_value("ui", "reduce_motion", true)
	preferences.save(UiScale.CFG)
	root.size = Vector2i(1280, 720)
	main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await settle()
	UiScale.step = UiScale.Size.NORMAL
	UiScale.high_contrast = false
	Motion.reduce_motion = true
	I18n.load_lang("zh")
	await capture("01-desk")
	main._show_journey_setup()
	await capture("02-journey-setup")
	main._draw_character()
	await capture("03-character")
	main._begin(main.db.get_record("merchant"))
	await settle()
	main.state.coins = 100000
	main.state.city = "zayton"
	main.state.active_event = ""
	main.state.pending_events.clear()
	for preset in ["normal-zh", "large-en", "compact-zh"]:
		root.content_scale_size = Vector2i(960, 640) if preset == "compact-zh" else Vector2i(1280, 720)
		root.size = root.content_scale_size
		UiScale.step = UiScale.Size.NORMAL if preset == "normal-zh" else UiScale.Size.LARGE
		I18n.load_lang("en" if preset == "large-en" else "zh")
		main._restyle_all()
		clear_modals()
		main._open_city()
		await capture(preset + "-04-city", main._city_view)
		main._city_view._market_btn.pressed.emit()
		await capture(preset + "-05-market", main._market_view)
		for row in main._market_view._stock_box.get_children():
			var bought := false
			for b in row.get_child(0).get_children():
				if b is Button and not b.disabled and b.get_meta("trade_action", "") == "buy":
					b.pressed.emit()
					bought = true
					break
			if bought: break
		await capture(preset + "-06-purchased", main._market_view)
		main._market_view._tabs.current_tab = 1
		await capture(preset + "-07-cargo", main._market_view)
		clear_modals()
		main._show_event(main.db.get_record("ev-alexandria-welcome-gate"))
		await capture(preset + "-08-story", main._dialog)
		main._dialog._scroll.scroll_vertical = 99999
		await capture(preset + "-09-story-end", main._dialog)
		clear_modals()
		main._open_book("vol-polo")
		await capture(preset + "-10-book", main._book_view)
		clear_modals()
		if not main._codex_view._all_codex.is_empty():
			main.state.codex.assign([main._codex_view._all_codex[0]])
		main._open_codex()
		main._codex_view._switch("codex")
		await capture(preset + "-11-codex", main._codex_view)
		main._codex_view._switch("sticker")
		await capture(preset + "-12-stickers", main._codex_view)
		clear_modals()
		main._open_bag()
		await capture(preset + "-13-bag", main._bag.panel)
		clear_modals()
		main._open_party()
		await capture(preset + "-14-party", main._party.panel)
		clear_modals()
		main._settings.layer.visible = true
		main._rebuild_settings_text()
		await capture(preset + "-15-settings", main._settings.panel)
		clear_modals()
		main._open_save_manager()
		await capture(preset + "-16-save", main._save_manager)
		clear_modals()
		main._open_divination_annex()
		await capture(preset + "-17-annex", main._annex_view)
		clear_modals()
		main._practice_annex_method("tarot")
		await capture(preset + "-18-lesson", main._lesson_ui)
		clear_modals()
		main.state.active_event = ""
		main.state.pending_events.clear()
		main._close_city()
		await capture(preset + "-19-map")
		main._on_city_clicked(main.db.get_record(main.state.city))
		await capture(preset + "-20-city-detail", main._city_detail_card)
		clear_modals()
		var routes: Array = main.travel.routes_from(main.state.city)
		if not routes.is_empty():
			main._on_depart(routes[0], String(routes[0].modes[0]))
			await capture(preset + "-21-depart", main._travel_confirm)
		clear_modals()
		main._open_ending()
		await capture(preset + "-22-ending", main._ending_ui.panel)
		clear_modals()
		if phase == "after":
			main._hire_ui.open(main.db.get_record("npc-zayton-guide"), "east_asia", "open")
			await capture(preset + "-23-contract", main._hire_ui._panel)
			main._hire_ui._on_cancel()
			if not routes.is_empty():
				var route: Dictionary = routes[0]
				main._show_transit(route, String(route.modes[0]), main.travel.other_end(route, main.state.city), 20, true)
				await capture(preset + "-24-transit")
				main._hide_transit()
			main._dialog_layer.show()
			main._dialog.show_result("ev.alexandria.welcome.gate.body")
			await capture(preset + "-25-result", main._dialog)
			clear_modals()
	DirAccess.make_dir_recursive_absolute(evidence)
	var file := FileAccess.open(evidence.path_join(phase + ".json"), FileAccess.WRITE)
	file.store_string(JSON.stringify(records, "\t"))
	print("UI AUDIT: captured ", records.size())
	var failures := records.filter(func(row): return row.has("fits") and not row.fits).size()
	quit(1 if phase == "after" and failures > 0 else 0)
