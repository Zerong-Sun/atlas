extends SceneTree

var failures: Array[String] = []
var elapsed := 0.0

func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 75:
		printerr("FAIL market-boundary watchdog")
		quit(1)
	return false

func check(ok: bool, label: String) -> void:
	print("BOUNDARY %s: %s" % ["PASS" if ok else "FAIL", label])
	if not ok:
		failures.append(label)

func frames(count := 4) -> void:
	for _i in count:
		await process_frame

func buttons(node: Node, action: String) -> Array[Button]:
	var result: Array[Button] = []
	if node is Button and node.get_meta("trade_action", "") == action:
		result.append(node)
	for child in node.get_children():
		result.append_array(buttons(child, action))
	return result

func click_at(point: Vector2, double_click := false) -> void:
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
		event.double_click = double_click and down
		root.push_input(event, true)

func _init() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	main._begin(main.db.get_record("merchant"))
	await frames()
	main._dialog_layer.visible = false
	main.state.city = "zayton"
	main.state.coins = 10000000
	main.state.goods.clear()
	main.state.purchases.clear()
	main.state.cargo_slots = 8
	main._open_city()
	main._open_market()
	var view = main._market_view
	UiScale.step = UiScale.Size.LARGE
	for lang in ["en", "zh"]:
		I18n.load_lang(lang)
		view.restyle()
		for dimensions in [Vector2i(960, 640), Vector2i(800, 600), Vector2i(640, 480)]:
			root.content_scale_size = dimensions
			root.size = dimensions
			await frames(8)
			check(view.get_global_rect().position.x >= -1 and view.get_global_rect().end.x <= dimensions.x + 1,
				"%s %s market remains within window width" % [lang, dimensions])
			check(view.get_global_rect().position.y >= -1 and view.get_global_rect().end.y <= dimensions.y + 1,
				"%s %s market remains within window height" % [lang, dimensions])
			check(view._stock_box.get_parent().size.y >= 90, "%s %s keeps usable stock scroll height (%s)" % [lang, dimensions, view._stock_box.get_parent().size.y])
	root.content_scale_size = Vector2i(960, 640)
	root.size = Vector2i(960, 640)
	I18n.load_lang("en")
	view.restyle()
	await frames(8)
	var buy: Button = buttons(view._stock_box, "buy")[0]
	var point := buy.get_global_rect().get_center()
	var before: int = main.state.coins
	click_at(point)
	await frames()
	var after_first: int = main.state.coins
	check(after_first < before, "real mouse click buys an item")
	check(buttons(view._stock_box, "buy")[0].get_global_rect().intersects(view._stock_box.get_parent().get_global_rect()), "purchase keeps the focused row visible after layout")
	point = buttons(view._stock_box, "buy")[0].get_global_rect().get_center()
	click_at(point, true)
	await frames()
	check(main.state.coins == after_first, "OS double-click does not buy a second unit across frames")
	# A separate deliberate click must still work immediately, without a timer.
	point = buttons(view._stock_box, "buy")[0].get_global_rect().get_center()
	click_at(point)
	await frames()
	check(main.state.coins < after_first, "next ordinary click still buys immediately")

	main.state.coins = 0
	view.refresh()
	await frames()
	var focusable: Array[Control] = []
	main._modal_focusables(main._market_layer, focusable)
	for b in buttons(view._stock_box, "buy"):
		check(b.disabled and not b.tooltip_text.is_empty(), "unaffordable good explains its disabled action")
		check(b not in focusable, "unaffordable good is excluded from modal keyboard focus")
	var balance: int = main.state.coins
	view._buy(main.db.get_record("silk"))
	check(main.state.coins == balance and view._pending.is_empty(), "direct stale buy cannot bypass insufficient funds")

	main.state.coins = 10000000
	main.state.goods = {"silk": main.state.cargo_slots}
	view.refresh()
	await frames()
	for b in buttons(view._stock_box, "buy"):
		check(b.disabled and b.tooltip_text.contains(I18n.t("trade.no_cargo_room")), "full hold explains blocked purchases")
	var empty_city: Dictionary = main.db.get_record("zayton").duplicate(true)
	empty_city.market.goods = []
	main.state.goods = {"silk": 0, "obsolete-good": 1}
	view.open(empty_city, main.state, main.state.jdn)
	await frames()
	check(view._stock_box.get_child_count() == 1 and view._stock_box.get_child(0) is Label, "empty stock has an explicit empty state")
	check(buttons(view._hold_box, "sell").is_empty() and view._hold_box.get_child(0) is Label, "zero or obsolete goods do not create inert sale rows")

	I18n.load_lang("en")
	view.open(main.db.get_record("chamba"), main.state, main.state.jdn)
	await frames()
	check(I18n.missing_keys().is_empty(), "missing optional market prose does not contaminate required-key diagnostics")
	root.content_scale_size = Vector2i(640, 480)
	root.size = Vector2i(640, 480)
	var markets_checked := 0
	for place in main.db.get_table("cities"):
		if not place.has("market"):
			continue
		view.open(place, main.state, main.state.jdn)
		await frames(4)
		markets_checked += 1
		check(view.get_global_rect().end.y <= 481 and view._stock_box.get_parent().size.y >= 60,
			"short-window catalogue layout: " + String(place.id))
	check(markets_checked > 50 and I18n.missing_keys().is_empty(), "all market optional prose preserves clean translation diagnostics")
	root.content_scale_size = Vector2i(960, 640)
	root.size = Vector2i(960, 640)
	await frames()

	check(not I18n.has("test.required_absent") and I18n.missing_keys().is_empty(), "availability lookup has no diagnostic side effects")
	check(I18n.t("test.required_absent") == "test.required_absent" and I18n.missing_keys().has("test.required_absent"), "required translation failures remain visible")
	I18n.load_lang("zh")
	I18n._strings.erase("ui.market")
	check(I18n.has("ui.market") and I18n.t("ui.market") == "Market", "availability respects the active English fallback")
	I18n.load_lang("en")

	view._close.pressed.emit()
	await frames()
	var city = main._city_view
	var long_key := "test.boundary.long_title"
	I18n._strings[long_key] = "A very long title describing a meeting with merchants, guides and scholars at the harbour before setting out on the next stage of the journey"
	var ev: Dictionary = main.db.get_record(String(main.db.get_record("zayton").sites[0])).duplicate(true)
	ev.title = long_key
	var card: Control = city._make_figure(ev, "chinese", false, 0)
	city._figures.add_child(card)
	city._layout_cards()
	await frames(8)
	var card_labels: Array[Label] = []
	for child in card.get_children():
		if child is VBoxContainer:
			for descendant in child.get_children():
				if descendant is Label:
					card_labels.append(descendant)
	check(card_labels.size() >= 2, "long title audit finds both real card labels")
	for label in card_labels:
		check(label.get_global_rect().end.y <= card.get_global_rect().end.y, "long city title/status stays inside the card")
	var no_sites: Dictionary = main.db.get_record("zayton").duplicate(true)
	no_sites.sites = []
	no_sites.erase("mentorEvent")
	no_sites.erase("market")
	city.show_city(no_sites, main.state, main.conditions, main._ctx())
	await frames()
	check(city._figures.get_child_count() == 0 and not city._market_btn.visible, "empty city hides unavailable exploration and market")
	check(city._settings_btn.is_visible_in_tree() and city._foot.get_global_rect().end.y <= city.size.y + 1, "empty city retains reachable navigation")
	print("CITY_MARKET_BOUNDARIES: %s" % ["PASS" if failures.is_empty() else failures])
	quit(0 if failures.is_empty() else 1)
