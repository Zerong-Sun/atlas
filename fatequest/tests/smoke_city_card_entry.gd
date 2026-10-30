extends SceneTree

var failures := 0
var elapsed := 0.0

func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 75:
		printerr("FAIL: city-card watchdog")
		quit(1)
	return false

func check(value: bool, message: String) -> void:
	print("CITY_CARD %s: %s" % ["PASS" if value else "FAIL", message])
	if not value:
		failures += 1

func frames(count := 4) -> void:
	for index in count:
		await process_frame

func find_button(node: Node, text: String) -> Button:
	if node is Button and node.text == text and node.is_visible_in_tree() and not node.disabled:
		return node
	for child in node.get_children():
		var found := find_button(child, text)
		if found != null:
			return found
	return null

func press(node: Node, key: String) -> void:
	var button := find_button(node, I18n.t(key))
	check(button != null, "reachable button: " + key)
	if button != null:
		button.pressed.emit()
	await frames()

func click_at(point: Vector2) -> void:
	var motion := InputEventMouseMotion.new()
	motion.position = point
	motion.global_position = point
	root.push_input(motion, true)
	for down in [true, false]:
		var event := InputEventMouseButton.new()
		event.position = point
		event.global_position = point
		event.button_index = MOUSE_BUTTON_LEFT
		event.pressed = down
		root.push_input(event, true)

func inside(control: Control) -> bool:
	return Rect2(Vector2.ZERO, Vector2(root.content_scale_size)).grow(1).encloses(control.get_global_rect())

func drain(main: Node) -> void:
	for step in 64:
		await frames(2)
		if main._dialog_layer.visible:
			for child in main._dialog._choices.get_children():
				if child is Button and not child.disabled and child.is_visible_in_tree():
					child.pressed.emit()
					break
		elif main.state.active_journey.is_empty() and main.state.active_event.is_empty() \
				and main.state.pending_events.is_empty():
			return
		else:
			await create_timer(0.05).timeout
	check(false, "story returns within bounded steps")

func open_card(main: Node, city: Dictionary) -> void:
	main._close_city()
	await frames()
	main._on_city_clicked(city)
	await create_timer(0.3).timeout
	await frames()

func _init() -> void:
	await process_frame
	root.content_scale_size = Vector2i(1280, 720)
	root.size = Vector2i(1280, 720)
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await frames()
	var arch: Dictionary = main.db.get_record("battuta").duplicate(true)
	arch.startKit.coins = 100000
	main._begin(arch)
	await drain(main)
	await press(main._city_view, "ui.set_out")
	var cairo: Dictionary = main.db.get_record("babylonia-cairus")
	var route_button: Button = null
	for child in main._panel.get_children():
		if child is Button and not child.disabled and child.text.contains(I18n.t(cairo.name)) \
				and child.text.contains(I18n.t("transport.foot.name")):
			route_button = child
			break
	check(route_button != null, "actual Cairo foot route exists")
	if route_button == null:
		quit(1)
		return
	route_button.pressed.emit()
	await frames()
	check(main._travel_confirm_layer.visible, "route opens confirmation")
	main._travel_confirm._confirm.pressed.emit()
	# Check immediately, before the visual travel countdown can complete.
	check(not main.state.active_journey.is_empty(), "confirmed journey is in progress")
	main._on_city_clicked(cairo)
	var journey: Dictionary = main.state.active_journey.duplicate(true)
	check(main._city_detail_card._enter_btn.disabled, "destination cannot be entered while travelling")
	main._city_detail_card.enter_requested.emit(cairo.id)
	check(main.state.active_journey == journey and not main._city_view.visible,
		"forged enter signal cannot skip the journey")
	main._city_detail_card._close_btn.pressed.emit()
	await create_timer(4).timeout
	await drain(main)
	check(main.state.city == cairo.id and main.state.active_journey.is_empty()
		and main._city_view.visible, "actual Alexandria to Cairo arrival enters the city")
	# Keep this a market-only layout fixture even as authored city sites expand.
	var market_only := cairo.duplicate(true)
	market_only["sites"] = []
	main._city_view.show_city(market_only, main.state, main.conditions, main._ctx())
	check(main._city_view._market_btn.visible and main._city_view._figures.get_child_count() == 0,
		"market remains available without exploration sites")
	await press(main._city_view, "ui.market")
	check(main._market_layer.visible, "Cairo market opens")
	await press(main._market_view, "ui.leave_market")
	check(main._city_view.visible, "closing Cairo market returns to city")
	check(main._save("cairo-entry"), "Cairo save written")

	for language in ["zh", "en"]:
		I18n.load_lang(language)
		UiScale.step = UiScale.Size.LARGE
		main._restyle_all()
		for dimensions in [Vector2i(640, 480), Vector2i(1280, 720)]:
			root.content_scale_size = dimensions
			root.size = dimensions
			await frames(8)
			await open_card(main, cairo)
			var card = main._city_detail_card
			check(inside(card) and inside(card._enter_btn) and inside(card._close_btn),
				"%s %s card and both actions fit" % [language, dimensions])
			check(card._scroll.size.y >= 60 and card._enter_btn.text == I18n.t("ui.city.enter"),
				"readable body and translated enter action")
			if DisplayServer.get_name() != "headless":
				await RenderingServer.frame_post_draw
				root.get_texture().get_image().save_png(
					"res://build/playtest/cairo-card-%s-%d.png" % [language, dimensions.x])
			var coins: int = main.state.coins
			var day: int = main.state.jdn
			click_at(card._enter_btn.get_global_rect().get_center())
			await frames()
			check(main._city_view.visible and not main._city_detail_layer.visible
				and main.state.coins == coins and main.state.jdn == day,
				"real mouse enters current city without charging or passing time")

	await open_card(main, main.db.get_record("alexandria"))
	check(main._city_detail_card._enter_btn.disabled, "remote known city cannot be entered")
	main._city_detail_card.enter_requested.emit("alexandria")
	check(main.state.city == cairo.id and not main._city_view.visible, "remote signal cannot teleport")
	check(main._load("cairo-entry"), "Cairo save loads")
	await frames()
	check(main._city_view.visible and not main._city_detail_layer.visible, "load restores city and clears stale card")
	main._arrive()
	await frames()
	check(main._city_view.visible and not main._dialog_layer.visible, "repeat arrival enters city without replaying entry")

	# A paused consequence is a committed story, even if opened from the map.
	main.executor.execute(main.state, [{"op": "queue_event", "value": "ev-road-fadlan-25-followup",
		"reason": "entry-resume-fixture"}], {})
	await open_card(main, cairo)
	check(main._city_detail_card._enter_btn.text == I18n.t("ui.continue_pending"),
		"pending story replaces entry with Continue")
	main._city_detail_card._enter_btn.pressed.emit()
	await frames()
	check(main._dialog_layer.visible and main.state.active_event == "ev-road-fadlan-25-followup"
		and not main._city_view.visible, "city card resumes the committed story before city access")
	await drain(main)
	check(main._city_view.visible and main.state.pending_events.is_empty(), "story completion returns to Cairo")
	await open_card(main, cairo)
	main.state.life["deceased"] = true
	main._city_detail_card.restyle()
	check(main._city_detail_card._enter_btn.disabled, "terminal life cannot re-enter")
	main._city_detail_card.enter_requested.emit(cairo.id)
	check(not main._city_view.visible, "terminal signal cannot re-enter")
	if not I18n.missing_keys().is_empty(): printerr("Missing translations: ", I18n.missing_keys())
	check(I18n.missing_keys().is_empty(), "no missing translations")
	print("CITY_CARD: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
