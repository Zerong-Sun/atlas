extends SceneTree

var failures: Array[String] = []
var elapsed := 0.0

func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 90:
		printerr("FAIL city-market watchdog")
		quit(1)
	return false

func _check(ok: bool, label: String) -> void:
	if not ok:
		failures.append(label)
		printerr("FAIL " + label)

func _frames(count := 4) -> void:
	for _i in count:
		await process_frame

func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await _frames()
	n.state.city = "zayton"
	n.state.coins = 200000
	n._dialog_layer.visible = false
	n._open_city()
	UiScale.step = UiScale.Size.LARGE
	I18n.load_lang("en")
	n._restyle_all()
	await _frames(8)
	_check(not n._right_spine.visible and not n._controls.visible, "city hides duplicate floating actions")
	_check(not n.get_node("MuteBtn").visible, "city hides floating mute")
	_check(n._city_view._settings_btn.is_visible_in_tree(), "city footer keeps a visible settings action")
	n._city_view._settings_btn.pressed.emit()
	await _frames()
	_check(n._settings.layer.is_visible_in_tree(), "city settings action opens settings")
	var escape := InputEventKey.new()
	escape.pressed = true
	escape.keycode = KEY_ESCAPE
	n._input(escape)
	await _frames()
	_check(not n._settings.layer.visible and n._city_view.visible, "closing settings returns to city")
	_check(n._city_view._figures is Control and not n._city_view._figures is Container, "city uses a free-positioned scene")
	_check(not n._city_view._status.text.contains("年"), "language change refreshes calendar formatting")
	for card in n._city_view._figures.get_children():
		_check(card.size.x <= n._city_view._figure_scroll.size.x, "city card fits viewport")
		var labels: Array[Node] = card.find_children("*", "Label", true, false)
		_check(labels.size() >= 2, "scene landmark includes title and availability")
		for child in labels:
			_check(child.size.x <= card.size.x, "city title/status fit landmark")

	_check(n._city_view._foot.get_global_rect().end.y <= n._city_view.size.y + 1, "city navigation remains visible")
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/city-polish-large-en.png")
	n._city_view._market_btn.grab_focus()
	n._open_market()
	await _frames(8)
	var view = n._market_view
	_check(not n._controls.visible and not n._right_spine.visible, "market hides global floating controls")
	_check(not n.get_node("MuteBtn").visible, "market hides floating mute")
	_check(n._top_modal() == n._market_layer, "market owns the modal stack")
	var targets: Array[Control] = []
	n._modal_focusables(n._market_layer, targets)
	_check(not targets.is_empty(), "market has keyboard targets")
	var tab := InputEventKey.new()
	tab.pressed = true
	tab.keycode = KEY_TAB
	for i in targets.size() + 2:
		n._input(tab)
		_check(n._market_layer.is_ancestor_of(root.gui_get_focus_owner()), "Tab remains inside market")
	targets[0].grab_focus()
	tab.shift_pressed = true
	n._input(tab)
	_check(root.gui_get_focus_owner() == targets[-1], "Shift Tab wraps inside market")
	_check(view.get_global_rect().position.x >= 0 and view.get_global_rect().end.x <= root.get_visible_rect().size.x + 1, "market fits horizontally")
	_check(view.get_global_rect().position.y >= 0 and view.get_global_rect().end.y <= root.get_visible_rect().size.y + 1, "market fits vertically")
	var first_buy: Button
	for row in view._stock_box.get_children():
		for item in row.get_child(0).get_children():
			if item is Button and item.text == I18n.t("ui.buy") and not item.disabled:
				first_buy = item
				_check(item.size.y <= Metrics.tap_target() + 10, "buy buttons have compact height")
				break
		if first_buy != null:
			break
	_check(first_buy != null, "market has a purchase action")
	var before: int = n.state.coins
	first_buy.grab_focus()
	var focus_good: String = first_buy.get_meta("good_id", "")
	first_buy.pressed.emit()
	var after: int = n.state.coins
	first_buy.pressed.emit()
	_check(after < before and n.state.coins == after, "stale double click buys once")
	_check(not view._feedback.text.contains("ui.market."), "purchase feedback is translated")
	await _frames()
	_check(root.gui_get_focus_owner().get_meta("good_id", "") == focus_good, "trade restores keyboard focus to its replacement row")
	var text_before: String = view._title.text
	I18n.load_lang("zh")
	n._restyle_all()
	await _frames(8)
	_check(view._title.text != text_before, "open market title changes language")
	_check(view._close.text == I18n.t("ui.leave_market"), "open market close changes language")
	_check(view._tabs.get_tab_title(0) == I18n.t("ui.local_goods"), "open market tabs change language")
	_check(view._title.get_theme_font_size("font_size") == UiScale.title(), "open market heading updates font size")
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/market-polish-large-zh.png")
	root.content_scale_size = Vector2i(960, 640)
	root.size = Vector2i(960, 640)
	await _frames(10)
	_check(view.get_global_rect().end.x <= root.get_visible_rect().size.x + 1, "narrow market fits horizontally")
	_check(view.get_global_rect().end.y <= root.get_visible_rect().size.y + 1, "narrow market fits vertically")
	_check(n._city_view._figures.custom_minimum_size.y > 0, "narrow city preserves scrollable scene")
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://build/playtest/market-polish-narrow-zh.png")
	view._close.pressed.emit()
	await _frames()
	_check(n._city_view.visible and not n._market_layer.visible, "closing market returns to city")
	_check(not n._controls.visible and not n._right_spine.visible, "closing market preserves uncluttered city controls")
	_check(n._city_view._settings_btn.is_visible_in_tree(), "narrow city keeps footer settings visible")
	_check(n._city_view._settings_btn.get_global_rect().end.y <= n._city_view.size.y + 1, "narrow settings button stays within viewport")
	_check(n._city_view._foot.get_global_rect().end.y <= n._city_view.size.y + 1, "narrow large-font footer fits with settings")
	_check(root.gui_get_focus_owner() == n._city_view._market_btn, "closing market restores the invoking city button")
	_check(not I18n.missing_keys().has("city..market.name") and not I18n.missing_keys().has("city..market.desc"), "unopened market never requests empty-city keys")
	print("CITY_MARKET_USABILITY: %s" % ("PASS" if failures.is_empty() else str(failures)))
	quit(0 if failures.is_empty() else 1)
