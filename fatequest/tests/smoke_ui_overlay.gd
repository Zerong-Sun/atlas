extends SceneTree

## Q1 visual regression (720p / 200% type / en+zh / overlay walk):
##
##   1. the satchel must stay inside the window with its close button visible
##      even when a goods row runs long (a long un-wrapped label used to inflate
##      the panel past the viewport and drag the close button off-screen);
##   2. market goods icons must render at the type-scaled icon size, not at the
##      512×512 source texture (which blew every row up and the whole panel out
##      of the window);
##   3. a long single-paragraph entry chapter must be split into readable
##      paragraphs;
##   4. every major overlay (settings, party, city card, event dialog) stays
##      inside the viewport at the 200% type step.
const _WATCHDOG := 120.0
var _t := 0.0


func _process(d: float) -> bool:
	_t += d
	if _t > _WATCHDOG:
		printerr("WATCHDOG: overlay smoke exceeded %d s" % int(_WATCHDOG))
		quit(1)
	return false


func _in_viewport(r: Rect2, vp: Vector2) -> bool:
	return r.end.x <= vp.x + 0.5 and r.end.y <= vp.y + 0.5 \
		and r.position.x >= -0.5 and r.position.y >= -0.5


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	# Q1 walks both languages at the 200% step — the widest, tallest case.
	I18n.load_lang("en")
	UiScale.step = UiScale.Size.MASSIVE
	n.state.city = "zayton"
	n.state.coins = 200000
	n.state.goods["pepper"] = 3
	n.state.goods["silk"] = 2
	n.state.goods["cloves"] = 1
	n.state.goods["turquoise"] = 1
	n.state.goods["carpet"] = 1

	var vp: Vector2 = n.get_viewport().get_visible_rect().size

	# --------------------------------------------------------------- satchel
	n._open_bag()
	await process_frame
	await process_frame
	var bag: Rect2 = n._bag["panel"].get_global_rect()
	var bag_ok: bool = _in_viewport(bag, vp)
	var close_btn: Button = null
	for c in n._bag["box"].get_children():
		if c is HBoxContainer:
			for b in c.get_children():
				if b is Button:
					close_btn = b
	var close_ok: bool = close_btn != null and _in_viewport(close_btn.get_global_rect(), vp)
	# A deliberately absurd row (the pre-fix defect) must wrap and never widen.
	var absurd: String = "The best quality Black Pepper from Calicut with the finest saffron blend ×999　占 999 格　此地可售 99999 银"
	var icon: Texture2D = MapArt.goods_icon("pepper")
	n._bag["list"].add_child(n._icon_line(icon, absurd))
	await process_frame
	await process_frame
	var bag2: Rect2 = n._bag["panel"].get_global_rect()
	var wrap_ok: bool = _in_viewport(bag2, vp)
	n._bag["layer"].visible = false
	await process_frame

	# ---------------------------------------------------------------- market
	n._open_market()
	await process_frame
	await process_frame
	var mkt: Rect2 = n._market_view.get_global_rect()
	var mkt_ok: bool = _in_viewport(mkt, vp)
	# icon sanity: a stock row's icon box must be the icon metric, not 512².
	var icon_ok: bool = true
	for row in n._market_view._stock_box.get_children():
		for ch in row.get_children():
			if ch is HBoxContainer:
				for k in ch.get_children():
					if k is TextureRect:
						var isz: Vector2 = (k as TextureRect).get_minimum_size()
						if isz.x > Metrics.icon_lg() * 1.6 or isz.y > Metrics.icon_lg() * 1.6:
							icon_ok = false
	n._market_layer.visible = false
	await process_frame

	# --------------------------------------------------------- other overlays
	var settings_ok := false
	n._settings["layer"].visible = true
	await process_frame
	await process_frame
	settings_ok = _in_viewport(n._settings["panel"].get_global_rect(), vp)
	n._settings["layer"].visible = false
	await process_frame

	var party_ok := false
	n._open_party()
	await process_frame
	await process_frame
	party_ok = _in_viewport(n._party["panel"].get_global_rect(), vp)
	n._party["layer"].visible = false
	await process_frame

	var card_ok := false
	n.state.city = "balc"
	var bc: Dictionary = n.db.get_record("city-balc")
	n._city_detail_card.show_city(bc, n.state)
	n._city_detail_layer.visible = true
	await process_frame
	await process_frame
	card_ok = _in_viewport(n._city_detail_card.get_global_rect(), vp)
	n._city_detail_layer.visible = false
	await process_frame

	# ------------------------------------------------------- entry dialog
	var dlg_ok := false
	var para_ok := false
	var ev: Dictionary = n.db.get_record("ev-balc-entry")
	n._show_event(ev)
	await process_frame
	await process_frame
	var dr: Rect2 = n._dialog.get_global_rect()
	dlg_ok = _in_viewport(dr, vp)
	para_ok = n._dialog._body.text.contains("\n\n")
	n._dialog_layer.visible = false
	await process_frame

	# ---------------------------------------------------------- zh pass
	var zh_ok := true
	I18n.load_lang("zh")
	await process_frame
	n._open_bag()
	await process_frame
	await process_frame
	zh_ok = zh_ok and _in_viewport(n._bag["panel"].get_global_rect(), vp)
	n._bag["layer"].visible = false
	await process_frame
	n._open_market()
	await process_frame
	await process_frame
	zh_ok = zh_ok and _in_viewport(n._market_view.get_global_rect(), vp)
	n._market_layer.visible = false
	await process_frame
	n._show_event(ev)
	await process_frame
	await process_frame
	zh_ok = zh_ok and _in_viewport(n._dialog.get_global_rect(), vp)
	zh_ok = zh_ok and n._dialog._body.text.contains("\n\n")
	n._dialog_layer.visible = false
	await process_frame

	# ------------------------------------------------- keyboard traversal
	# Escape closes the topmost overlay; drive the real handler so the layer
	# ordering and closers are exercised, not just `visible` flags.
	var esc_ok := true
	var ev_esc := InputEventKey.new()
	ev_esc.keycode = KEY_ESCAPE
	ev_esc.pressed = true

	n._open_bag()
	await process_frame
	n._unhandled_key_input(ev_esc)
	await process_frame
	esc_ok = esc_ok and not n._bag["layer"].visible
	await process_frame

	n._open_market()
	await process_frame
	n._unhandled_key_input(ev_esc)
	await process_frame
	esc_ok = esc_ok and not n._market_layer.visible and n._city_view.visible
	await process_frame

	n._settings["layer"].visible = true
	await process_frame
	n._unhandled_key_input(ev_esc)
	await process_frame
	esc_ok = esc_ok and not n._settings["layer"].visible
	await process_frame

	var ok: bool = bag_ok and close_ok and wrap_ok and mkt_ok and icon_ok \
		and settings_ok and party_ok and card_ok and dlg_ok and para_ok and zh_ok and esc_ok
	print("UI_OVERLAY: bag=%s close=%s wrap=%s market=%s icons=%s settings=%s party=%s card=%s dialog=%s paras=%s zh=%s esc=%s" % [
		bag_ok, close_ok, wrap_ok, mkt_ok, icon_ok,
		settings_ok, party_ok, card_ok, dlg_ok, para_ok, zh_ok, esc_ok])
	print("UI_OVERLAY: vp=%s bag=%s market=%s dialog=%s" % [vp, bag2, mkt, dr])
	print("UI_OVERLAY: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
