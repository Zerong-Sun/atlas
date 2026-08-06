extends PanelContainer

## The market. Two columns: what the city sells, what you are carrying.
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
var _hold_label: Label


func setup(p_db: ContentDb, p_market: Market) -> void:
	db = p_db
	market = p_market
	_build()


func _build() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	custom_minimum_size = Vector2(860, 520)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 10)
	add_child(root)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 20)
	root.add_child(head)

	_purse = Label.new()
	_purse.add_theme_font_size_override("font_size", UiScale.hud())
	_purse.add_theme_color_override("font_color", Palette.ink())
	head.add_child(_purse)

	_hold_label = Label.new()
	_hold_label.add_theme_font_size_override("font_size", UiScale.hud())
	_hold_label.add_theme_color_override("font_color", Palette.ink())
	head.add_child(_hold_label)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(spacer)

	var close := Panels.styled_button(I18n.t("ui.leave_market"), func(): closed.emit())
	head.add_child(close)

	var cols := HBoxContainer.new()
	cols.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cols.add_theme_constant_override("separation", 16)
	root.add_child(cols)

	cols.add_child(_column(I18n.t("ui.local_goods"), true))
	cols.add_child(_column(I18n.t("ui.your_bag"), false))


func _column(title: String, is_stock: bool) -> Control:
	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	col.add_theme_constant_override("separation", 6)

	var head := Label.new()
	head.text = title
	head.add_theme_font_size_override("font_size", UiScale.ui() + 2)
	head.add_theme_color_override("font_color", Palette.ink())
	col.add_child(head)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	col.add_child(scroll)

	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_theme_constant_override("separation", 4)
	scroll.add_child(box)

	if is_stock:
		_stock_box = box
	else:
		_hold_box = box
	return col


func open(city: Dictionary, p_state: WorldState, p_jdn: int) -> void:
	_city = city
	state = p_state
	jdn = p_jdn
	visible = true
	refresh()


func refresh() -> void:
	_purse.text = I18n.t("ui.market.purse") % (state.coins / Market.FEN)
	_hold_label.text = I18n.t("ui.market.cargo") % [market.cargo_used(state), state.cargo_slots]

	for c in _stock_box.get_children():
		c.queue_free()
	for c in _hold_box.get_children():
		c.queue_free()

	for good in market.stock(_city):
		_stock_box.add_child(_stock_row(good))

	if state.goods.is_empty():
		var none := Label.new()
		none.text = I18n.t("ui.market.empty")
		none.add_theme_font_size_override("font_size", UiScale.ui())
		none.add_theme_color_override("font_color", Palette.ink_soft())
		_hold_box.add_child(none)
	else:
		for gid in state.goods:
			var g := db.get_record(String(gid))
			if not g.is_empty():
				_hold_box.add_child(_hold_row(g, int(state.goods[gid])))


## Demand shown as words, not numbers: the player needs to recognise a market,
## not compute one.
func _demand_note(good: Dictionary) -> String:
	match market.demand_tier(good, _city):
		0: return I18n.t("ui.local_produce")
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
		var isz := float(Metrics.icon_lg())
		tr.custom_minimum_size = Vector2(isz, isz)
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
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

	var check := market.can_buy(good, _city, state, jdn)
	var sub := Label.new()
	sub.text = I18n.t("ui.market.buy_sub") % [
		int(check["price"]) / Market.FEN, _demand_note(good), int(good.get("bulk", 1))]
	sub.add_theme_font_size_override("font_size", UiScale.ui() - 3)
	sub.add_theme_color_override("font_color", Palette.ink_soft())
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sub.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text.add_child(sub)

	var buy := Panels.styled_button(I18n.t("ui.buy"), Callable())
	if not check["ok"]:
		buy.disabled = true
		var why: Array[String] = []
		for r in check["reasons"]:
			why.append(I18n.fmt(String(r)))
		buy.tooltip_text = I18n.list(PackedStringArray(why))
	else:
		buy.pressed.connect(func(): _buy(good))
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
		var isz := float(Metrics.icon_lg())
		tr.custom_minimum_size = Vector2(isz, isz)
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
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

	var price := market.sell_price(good, _city, jdn, state.seed)
	var sub := Label.new()
	sub.text = I18n.t("ui.market.sell_sub") % [price / Market.FEN, _demand_note(good)]
	sub.add_theme_font_size_override("font_size", UiScale.ui() - 3)
	sub.add_theme_color_override("font_color", Palette.ink_soft())
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sub.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text.add_child(sub)

	var sell := Panels.primary_button(I18n.t("ui.sell"), func(): _sell(good))
	row.add_child(sell)
	return panel


func _buy(good: Dictionary) -> void:
	traded.emit()
	_pending = market.buy_effects(good, _city, jdn, state.seed)


func _sell(good: Dictionary) -> void:
	traded.emit()
	_pending = market.sell_effects(good, _city, jdn, state.seed,
		state.purchases.get(String(good.get("id", "")), {}))


## Trade never writes WorldState here — it hands effects to the executor, like
## every other system (ARCHITECTURE §2.1). The screen holds the order until the
## host applies it.
var _pending: Array = []


func take_pending() -> Array:
	var p := _pending
	_pending = []
	return p


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	# `visible` is true even while the parent layer is hidden, so state is the
	# real precondition here, not visibility.
	if state != null:
		refresh()
