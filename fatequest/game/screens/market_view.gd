extends PanelContainer

## The market. Full-width tabs separate local goods from carried cargo.
##
## The screen's job is to make the ONE question answerable at a glance — is this
## worth carrying? — so every row shows the price, the demand tier and the hold
## cost together. GDD §9.2 makes arbitrage a matter of knowing where demand is,
## and a player who cannot see demand is just guessing.

signal closed()
signal traded()

var db: ContentDb
var market: Market
var state: WorldState
var jdn: int = 0

var _city: Dictionary = {}
var _stock_box: VBoxContainer
var _hold_box: VBoxContainer
var _purse: Label
var _title: Label
var _description: Label
var _description_scroll: ScrollContainer
var _hold_label: Label
var _tabs: TabContainer
var _close: Button
var _feedback: Label
var _feedback_key := ""
var _feedback_name_key := ""
var _last_trade_frame := -1
var _refresh_revision := 0
var _armed_good: String = ""   ## gid awaiting the second (confirm) press of Abandon


func setup(p_db: ContentDb, p_market: Market) -> void:
	db = p_db
	market = p_market
	_build()


func _build() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 12)
	add_child(root)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 16)
	root.add_child(head)
	_title = Panels.label("", UiScale.title(), Palette.ink())
	_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(_title)
	_close = Panels.styled_button(I18n.t("ui.leave_market"), func(): closed.emit())
	_close.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	head.add_child(_close)
	var metrics := HFlowContainer.new()
	metrics.add_theme_constant_override("h_separation", 24)
	root.add_child(metrics)
	_purse = Panels.label("", UiScale.hud(), Palette.ink())
	metrics.add_child(_purse)
	_hold_label = Panels.label("", UiScale.hud(), Palette.ink())
	metrics.add_child(_hold_label)
	_description_scroll = ScrollContainer.new()
	_description_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_description_scroll.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	root.add_child(_description_scroll)
	_description = Panels.label("", UiScale.ui(), Palette.ink_soft())
	_description.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_description.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_description_scroll.add_child(_description)
	_description.minimum_size_changed.connect(_fit_description)
	_tabs = TabContainer.new()
	_tabs.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(_tabs)
	_tabs.add_child(_column(true))
	_tabs.add_child(_column(false))
	_feedback = Panels.label("", UiScale.ui(), Palette.ink_soft())
	_feedback.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(_feedback)
	restyle()


func _ready() -> void:
	get_viewport().size_changed.connect(_fit_window)
	_fit_window()


func _fit_window() -> void:
	if not is_inside_tree():
		return
	var viewport_size := get_viewport_rect().size
	# Keep a heading larger than body text on compact windows, but avoid a
	# multi-line title consuming the entire stock list at the large type step.
	var title_size := mini(UiScale.title(), UiScale.ui() + 6) if viewport_size.x < 760 else UiScale.title()
	_title.add_theme_font_size_override("font_size", title_size)
	custom_minimum_size = Vector2(minf(1020, viewport_size.x - 48), minf(740, viewport_size.y - 48))
	# CenterContainer respects minimum size; reset stale sizes on a smaller window.
	size = custom_minimum_size
	_fit_description.call_deferred()


func _fit_description() -> void:
	if not is_inside_tree() or _description_scroll == null:
		return
	# A long cultural introduction must remain readable without consuming all
	# of the shopping area on a short window or at the largest text size.
	var limit := clampf(get_viewport_rect().size.y * 0.12, 48, 100)
	_description_scroll.custom_minimum_size.y = minf(_description.get_minimum_size().y, limit)


## OS double-clicks arrive on different frames, so the transaction-frame
## guard alone cannot distinguish them from two intended purchases. Swallow
## the second press only on trade controls; a later ordinary click remains
## immediate, and tabs/scrolling/closing keep their usual behaviour.
func _input(event: InputEvent) -> void:
	if not is_visible_in_tree() or not event is InputEventMouseButton:
		return
	var mouse := event as InputEventMouseButton
	if mouse.button_index != MOUSE_BUTTON_LEFT or not mouse.pressed or not mouse.double_click:
		return
	var point := get_canvas_transform().affine_inverse() * mouse.position
	if _trade_control_at(_stock_box, point) or _trade_control_at(_hold_box, point):
		get_viewport().set_input_as_handled()


func _trade_control_at(node: Node, point: Vector2) -> bool:
	if node is Control and not node.is_visible_in_tree():
		return false
	if node is Button and node.has_meta("trade_action"):
		return node.get_global_rect().has_point(point)
	for child in node.get_children():
		if _trade_control_at(child, point):
			return true
	return false


func _column(is_stock: bool) -> Control:
	var scroll := ScrollContainer.new()
	scroll.name = "Stock" if is_stock else "Hold"
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.follow_focus = true
	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_theme_constant_override("separation", 8)
	scroll.add_child(box)
	if is_stock:
		_stock_box = box
	else:
		_hold_box = box
	return scroll


func _relabel() -> void:
	var cid := String(_city.get("id", ""))
	# setup/restyle can run before the first market has been opened. Do not
	# ask I18n for invented city..market keys during that unbound state.
	_title.text = I18n.t("ui.market")
	_title.tooltip_text = ""
	_description.text = ""
	if not cid.is_empty():
		var name_key := "city.%s.market.name" % cid
		var desc_key := "city.%s.market.desc" % cid
		var name_s := I18n.t(name_key) if I18n.has(name_key) else name_key
		var desc_s := I18n.t(desc_key) if I18n.has(desc_key) else desc_key
		_title.text = name_s if name_s != name_key else I18n.t("ui.market")
		_title.tooltip_text = desc_s if desc_s != desc_key else ""
		_description.text = desc_s if desc_s != desc_key else ""
	_description_scroll.visible = not _description.text.is_empty()
	_fit_description.call_deferred()
	_close.text = I18n.t("ui.leave_market")
	_tabs.set_tab_title(0, I18n.t("ui.local_goods"))
	_tabs.set_tab_title(1, I18n.t("ui.your_bag"))
	_feedback.text = I18n.t("ui.market.trade_hint") if _feedback_key.is_empty() else I18n.t(_feedback_key) % I18n.t(_feedback_name_key)


func open(city: Dictionary, p_state: WorldState, p_jdn: int) -> void:
	_city = city
	state = p_state
	jdn = p_jdn
	visible = true
	# A market opening must start from a clean slate: a stale pending order
	# from an earlier screen would otherwise fire on the next press here.
	_pending = []
	_armed_good = ""
	_feedback_key = ""
	_feedback_name_key = ""
	_last_trade_frame = -1
	_tabs.current_tab = 0
	_relabel()
	refresh()


func refresh() -> void:
	_refresh_revision += 1
	var focused := get_viewport().gui_get_focus_owner() if is_inside_tree() else null
	var focus_good := ""
	var focus_action := ""
	if focused != null and is_ancestor_of(focused):
		focus_good = String(focused.get_meta("good_id", ""))
		focus_action = String(focused.get_meta("trade_action", ""))
	_purse.text = I18n.t("ui.market.purse") % int(state.coins / Market.FEN)
	_hold_label.text = I18n.t("ui.market.cargo") % [market.cargo_used(state), state.cargo_slots]

	for c in _stock_box.get_children():
		_stock_box.remove_child(c)
		c.queue_free()
	for c in _hold_box.get_children():
		_hold_box.remove_child(c)
		c.queue_free()

	for good in market.stock(_city):
		_stock_box.add_child(_stock_row(good))
	if _stock_box.get_child_count() == 0:
		_stock_box.add_child(Panels.label(I18n.t("ui.market.empty"), UiScale.ui(), Palette.ink_soft()))
	for gid in state.goods:
		var g := db.get_record(String(gid))
		if not g.is_empty() and int(state.goods[gid]) > 0:
			_hold_box.add_child(_hold_row(g, int(state.goods[gid])))
	if _hold_box.get_child_count() == 0:
		_hold_box.add_child(Panels.label(I18n.t("ui.market.empty"), UiScale.ui(), Palette.ink_soft()))
	if not focus_good.is_empty():
		_restore_trade_focus.call_deferred(focus_good, focus_action, _refresh_revision)


## Demand shown as words, not numbers: the player needs to recognise a market,
## not compute one.
func _demand_note(good: Dictionary) -> String:
	match market.demand_tier(good, _city):
		0:
			# A regional price band does not establish that this city makes it.
			if String(_city.get("id", "")) in good.get("origin", []):
				return I18n.t("ui.local_produce")
			return I18n.t("ui.market.regional_supply")
		2: return I18n.t("ui.local_shortage")
	return I18n.t("ui.common_goods")


func _row_panel() -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", Palette.panel_style(true))
	return p


func _stock_row(good: Dictionary) -> Control:
	var panel := _row_panel()
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)

	var icon := MapArt.goods_icon(String(good.get("id", "")))
	if icon != null:
		var tr := TextureRect.new()
		tr.texture = icon
		# EXPAND_IGNORE_SIZE: without it the TextureRect reports the full source
		# texture as its minimum (goods art is 512×512), which inflates every
		# row to hundreds of pixels tall and pushes the whole panel past the
		# window. With it the box is exactly the type-scaled icon size.
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		var isz := float(Metrics.icon_lg()) * 2.2
		tr.custom_minimum_size = Vector2(isz, isz)
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		row.add_child(tr)

	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(text)

	var name_lbl := Label.new()
	name_lbl.text = I18n.t(good.get("name", ""))
	name_lbl.add_theme_font_size_override("font_size", UiScale.ui())
	name_lbl.add_theme_color_override("font_color", Palette.ink())
	name_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text.add_child(name_lbl)
	# The quayside flavour written for this very stall: market.<city>.item.<id>.
	# Falls back silently when the city has no authored blurb for this good.
	var flavor_key := "market.%s.item.%s" % [String(_city.get("id", "")), String(good.get("id", ""))]
	var flavor := I18n.t(flavor_key) if I18n.has(flavor_key) else flavor_key
	if flavor != flavor_key:
		name_lbl.tooltip_text = flavor
		var detail := Panels.label(flavor, maxi(UiScale.ui() - 2, 10), Palette.ink_soft())
		detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		detail.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		text.add_child(detail)

	var check := market.can_buy(good, _city, state, jdn)
	var sub := Label.new()
	sub.text = I18n.t("ui.market.buy_sub") % [
		int(int(check["price"]) / Market.FEN), _demand_note(good), int(good.get("bulk", 1))]
	sub.add_theme_font_size_override("font_size", UiScale.ui() - 3)
	sub.add_theme_color_override("font_color", Palette.ink_soft())
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sub.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text.add_child(sub)

	var buy := Panels.styled_button(I18n.t("ui.buy"), Callable())
	buy.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	buy.custom_minimum_size.x = 100 * Metrics.factor()
	buy.set_meta("trade_action", "buy")
	buy.set_meta("good_id", String(good.get("id", "")))
	if not check["ok"]:
		buy.disabled = true
		var why: Array[String] = []
		for r in check["reasons"]:
			why.append(I18n.fmt(String(r)))
		buy.tooltip_text = I18n.list(PackedStringArray(why))
		var reason := Panels.label(buy.tooltip_text, UiScale.ui() - 2, Palette.loss())
		reason.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		text.add_child(reason)
	else:
		buy.pressed.connect(func():
			if buy.disabled or Engine.get_process_frames() == _last_trade_frame:
				return
			buy.disabled = true
			_buy(good))
	row.add_child(buy)
	return panel


func _hold_row(good: Dictionary, count: int) -> Control:
	var panel := _row_panel()
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)

	var icon := MapArt.goods_icon(String(good.get("id", "")))
	if icon != null:
		var tr := TextureRect.new()
		tr.texture = icon
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		var isz := float(Metrics.icon_lg()) * 2.2
		tr.custom_minimum_size = Vector2(isz, isz)
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		row.add_child(tr)

	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(text)

	var name_lbl := Label.new()
	name_lbl.text = "%s ×%d" % [I18n.t(good.get("name", "")), count]
	name_lbl.add_theme_font_size_override("font_size", UiScale.ui())
	name_lbl.add_theme_color_override("font_color", Palette.ink())
	name_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text.add_child(name_lbl)

	var basis: Dictionary = state.purchases.get(String(good.get("id", "")), {})
	var granted_here := int(basis.get("granted", {}).get(String(_city.get("id", "")), 0))
	var price := market.sell_price(good, _city, jdn, state.seed)
	var sub := Label.new()
	if granted_here > 0:
		# The travel brake (GDD §9.2). The quote stays visible, but the row
		# tells the truth: this counter will not pay it.
		sub.text = I18n.t("ui.market.sell_local_quote") % int(price / Market.FEN)
		name_lbl.text += " — " + I18n.t("ui.market.local_grant_count") % granted_here
	else:
		sub.text = I18n.t("ui.market.sell_sub") % [int(price / Market.FEN), _demand_note(good)]
		# The changer's cut, shown before the player commits: a sale across
		# currency zones bleeds EXCHANGE_LOSS at the money-changer.
		var bband := String(basis.get("band", ""))
		var cband := String(_city.get("band", ""))
		if not bband.is_empty() and bband != cband:
			var cut := market.exchange_penalty(bband, cband, price)
			if cut > 0:
				sub.text += "\n" + I18n.t("ui.market.exchange_cut") % int(cut / Market.FEN)
	sub.add_theme_font_size_override("font_size", UiScale.ui() - 3)
	sub.add_theme_color_override("font_color", Palette.ink_soft())
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sub.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text.add_child(sub)

	if granted_here > 0:
		var sell := Panels.primary_button(I18n.t("ui.sell"), func(): return)
		sell.disabled = true
		sell.tooltip_text = I18n.t("ui.market.local_grant")
		sell.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		sell.set_meta("trade_action", "sell")
		sell.set_meta("good_id", String(good.get("id", "")))
		row.add_child(sell)
	else:
		var sell := Panels.primary_button(I18n.t("ui.sell"), func(): _sell(good))
		sell.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		sell.set_meta("trade_action", "sell")
		sell.set_meta("good_id", String(good.get("id", "")))
		row.add_child(sell)

	# The release valve: a hold must never strand cargo with no way out.
	# Two presses: the first arms the button, the second commits — cargo is
	# the one thing the market destroys for nothing, so it asks twice.
	var gid := String(good.get("id", ""))
	var armed := _armed_good == gid
	var jettison := Panels.styled_button(
		I18n.t("ui.market.confirm_abandon") if armed else I18n.t("ui.market.abandon"),
		func(): _abandon(good))
	jettison.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	jettison.set_meta("trade_action", "abandon")
	jettison.set_meta("good_id", gid)
	jettison.tooltip_text = I18n.t("ui.market.abandon_tip")
	row.add_child(jettison)
	return panel


func _buy(good: Dictionary) -> void:
	if not market.can_buy(good, _city, state, jdn).get("ok", false) or not _begin_trade(good, "ui.market.bought"):
		return
	# Order matters: the host consumes _pending on the traded signal, so the
	# order must be queued BEFORE the signal fires — otherwise the first press
	# of a session applies nothing and the next press applies this trade.
	_pending = market.buy_effects(good, _city, jdn, state.seed)
	traded.emit()


func _sell(good: Dictionary) -> void:
	if int(state.goods.get(String(good.get("id", "")), 0)) < 1:
		return
	var basis: Dictionary = state.purchases.get(String(good.get("id", "")), {})
	if int(basis.get("granted", {}).get(String(_city.get("id", "")), 0)) > 0:
		return  # the gate held even if the button was somehow pressed
	if not _begin_trade(good, "ui.market.sold"):
		return
	_pending = market.sell_effects(good, _city, jdn, state.seed, basis)
	traded.emit()


## Abandon a unit for nothing. Money never comes out of an abandon — it
## exists so a gated or bulk-heavy hold can always free a cargo slot.
## First press arms the button; the second press commits.
func _abandon(good: Dictionary) -> void:
	var gid := String(good.get("id", ""))
	if int(state.goods.get(gid, 0)) < 1:
		return
	if _armed_good != gid:
		_armed_good = gid
		refresh()
		return
	if not _begin_trade(good, "ui.market.abandoned"):
		return
	_armed_good = ""
	_pending = [{
		"op": "goods", "id": gid, "value": -1,
		"reason": "abandoned-at-%s" % String(_city.get("id", "")),
	}]
	traded.emit()


## Trade never writes WorldState here — it hands effects to the executor, like
## every other system (ARCHITECTURE §2.1). The screen holds the order until the
## host applies it.
var _pending: Array = []


func take_pending() -> Array:
	var p := _pending
	_pending = []
	return p


func _restore_trade_focus(gid: String, action: String, revision: int) -> void:
	# Rebuilt rows have not been laid out during this frame's deferred calls.
	# Focusing them immediately makes ScrollContainer follow a stale position
	# and can jump the first bought item far above the visible stock viewport.
	await get_tree().process_frame
	if revision != _refresh_revision or not is_visible_in_tree():
		return
	for box in [_stock_box, _hold_box]:
		for panel in box.get_children():
			if not panel is PanelContainer:
				continue
			for item in panel.get_child(0).get_children():
				if item is Button and item.is_visible_in_tree() and not item.disabled and item.get_meta("good_id", "") == gid and item.get_meta("trade_action", "") == action:
					item.grab_focus()
					return
	# The sold/abandoned item may have disappeared, or the hold may be full.
	# Keep keyboard focus in the market instead of dropping it behind the modal.
	_close.grab_focus()


## Same-frame presses, including a stale button signal after refresh, cannot
## buy a second unit. Intentional purchases on later frames stay immediate.
func _begin_trade(good: Dictionary, feedback_key: String) -> bool:
	var frame := Engine.get_process_frames()
	if frame == _last_trade_frame or not _pending.is_empty():
		return false
	_last_trade_frame = frame
	_armed_good = ""
	_feedback_key = feedback_key
	_feedback_name_key = String(good.get("name", ""))
	_feedback.text = I18n.t(feedback_key) % I18n.t(_feedback_name_key)
	return true


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	for label in [_purse, _hold_label]:
		label.add_theme_font_size_override("font_size", UiScale.hud())
		label.add_theme_color_override("font_color", Palette.ink())
	for label in [_description, _feedback]:
		label.add_theme_font_size_override("font_size", UiScale.ui())
		label.add_theme_color_override("font_color", Palette.ink_soft())
	_tabs.add_theme_font_size_override("font_size", UiScale.ui())
	_tabs.add_theme_color_override("font_selected_color", Palette.ink())
	_tabs.add_theme_color_override("font_unselected_color", Palette.ink_soft())
	_tabs.add_theme_stylebox_override("tab_selected", Palette.button_style(Palette.State.HOVER))
	_tabs.add_theme_stylebox_override("tab_unselected", Palette.button_style())
	_tabs.add_theme_stylebox_override("panel", Palette.panel_style())
	Panels.style_button(_close)
	_relabel()
	_fit_window()
	if state != null:
		refresh()
