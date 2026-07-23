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

	var close := Button.new()
	close.text = "离开市集"
	close.add_theme_font_size_override("font_size", UiScale.ui())
	close.add_theme_stylebox_override("normal", Palette.button_style())
	close.add_theme_stylebox_override("hover", Palette.button_style(true))
	close.add_theme_color_override("font_color", Palette.ink())
	close.pressed.connect(func(): closed.emit())
	head.add_child(close)

	var cols := HBoxContainer.new()
	cols.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cols.add_theme_constant_override("separation", 16)
	root.add_child(cols)

	cols.add_child(_column("此地货殖", true))
	cols.add_child(_column("你的行囊", false))


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
	_purse.text = "囊中 %d 银" % (state.coins / Market.FEN)
	_hold_label.text = "货格 %d/%d" % [market.cargo_used(state), state.cargo_slots]

	for c in _stock_box.get_children():
		c.queue_free()
	for c in _hold_box.get_children():
		c.queue_free()

	for good in market.stock(_city):
		_stock_box.add_child(_stock_row(good))

	if state.goods.is_empty():
		var none := Label.new()
		none.text = "（空）"
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
		0: return "此地自产"
		2: return "此地紧缺"
	return "寻常货色"


func _row_panel() -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", Palette.panel_style(true))
	return p


func _stock_row(good: Dictionary) -> Control:
	var panel := _row_panel()
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)

	var icon := MapArt.tex("ic-good-%s" % good.get("id", ""))
	if icon != null:
		var tr := TextureRect.new()
		tr.texture = icon
		tr.custom_minimum_size = Vector2(34, 34)
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)

	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(text)

	var name_lbl := Label.new()
	name_lbl.text = I18n.t(good.get("name", ""))
	name_lbl.add_theme_font_size_override("font_size", UiScale.ui())
	name_lbl.add_theme_color_override("font_color", Palette.ink())
	text.add_child(name_lbl)

	var check := market.can_buy(good, _city, state, jdn)
	var sub := Label.new()
	sub.text = "%d 银 · %s · 占 %d 格" % [
		int(check["price"]) / Market.FEN, _demand_note(good), int(good.get("bulk", 1))]
	sub.add_theme_font_size_override("font_size", UiScale.ui() - 3)
	sub.add_theme_color_override("font_color", Palette.ink_soft())
	text.add_child(sub)

	var buy := Button.new()
	buy.text = "买"
	buy.add_theme_font_size_override("font_size", UiScale.ui())
	buy.add_theme_stylebox_override("normal", Palette.button_style())
	buy.add_theme_stylebox_override("hover", Palette.button_style(true))
	buy.add_theme_color_override("font_color", Palette.ink())
	buy.add_theme_color_override("font_disabled_color", Palette.ink_soft())
	if not check["ok"]:
		buy.disabled = true
		var why: Array[String] = []
		for r in check["reasons"]:
			why.append(I18n.fmt(String(r)))
		buy.tooltip_text = "、".join(PackedStringArray(why))
	else:
		buy.pressed.connect(func(): _buy(good))
	row.add_child(buy)
	return panel


func _hold_row(good: Dictionary, count: int) -> Control:
	var panel := _row_panel()
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)

	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(text)

	var name_lbl := Label.new()
	name_lbl.text = "%s ×%d" % [I18n.t(good.get("name", "")), count]
	name_lbl.add_theme_font_size_override("font_size", UiScale.ui())
	name_lbl.add_theme_color_override("font_color", Palette.ink())
	text.add_child(name_lbl)

	var price := market.sell_price(good, _city, jdn, state.seed)
	var sub := Label.new()
	sub.text = "此地可售 %d 银 · %s" % [price / Market.FEN, _demand_note(good)]
	sub.add_theme_font_size_override("font_size", UiScale.ui() - 3)
	sub.add_theme_color_override("font_color", Palette.ink_soft())
	text.add_child(sub)

	var sell := Button.new()
	sell.text = "卖"
	sell.add_theme_font_size_override("font_size", UiScale.ui())
	sell.add_theme_stylebox_override("normal", Palette.button_style())
	sell.add_theme_stylebox_override("hover", Palette.button_style(true))
	sell.add_theme_color_override("font_color", Palette.ink())
	sell.pressed.connect(func(): _sell(good))
	row.add_child(sell)
	return panel


func _buy(good: Dictionary) -> void:
	traded.emit()
	_pending = market.buy_effects(good, _city, jdn, state.seed)


func _sell(good: Dictionary) -> void:
	traded.emit()
	_pending = market.sell_effects(good, _city, jdn, state.seed, String(_city.get("band", "")))


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
