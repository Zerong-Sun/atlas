class_name Hud
extends PanelContainer

## The traveller's own state, always visible.
##
## Previously the only readout was one line of text and the purse was invisible
## until a choice was greyed out for want of coin — the player could not answer
## "can I afford this?" without trying it. Money, day, fate and cargo are the
## four numbers every decision in the game is made against, so they are on
## screen at all times.

var _rows: Dictionary = {}
var _icons: Dictionary = {}
var _grid: HBoxContainer
var _fate_bars: HBoxContainer


func _ready() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style(true))
	_grid = HBoxContainer.new()
	_grid.add_theme_constant_override("separation", 18)
	add_child(_grid)


func _cell(key: String, emoji: String, art: Texture2D = null) -> void:
	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", 5)
	if art != null:
		var tr := TextureRect.new()
		tr.texture = art
		tr.custom_minimum_size = Vector2(18, 18)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		box.add_child(tr)
		_icons[key] = tr
	else:
		var lbl := Label.new()
		lbl.text = emoji
		lbl.add_theme_font_size_override("font_size", UiScale.hud())
		lbl.add_theme_color_override("font_color", Palette.ink_soft())
		box.add_child(lbl)
		_icons[key] = lbl
	var val := Label.new()
	val.add_theme_font_size_override("font_size", UiScale.hud())
	val.add_theme_color_override("font_color", Palette.ink())
	box.add_child(val)
	_grid.add_child(box)
	_rows[key] = val


func build() -> void:
	for c in _grid.get_children():
		c.queue_free()
	_rows.clear()
	_icons.clear()
	_cell("place", "◈", MapArt.ui("orn-seal"))
	_cell("date", "☉")
	_cell("coins", "◎", MapArt.ui("icon-coin"))
	_cell("days", "⏳")
	_cell("cargo", "▤", MapArt.ui("cargo-tag"))
	_cell("fate", "☯", MapArt.fate_wheel())

	_fate_bars = HBoxContainer.new()
	_fate_bars.add_theme_constant_override("separation", 4)
	for axis in ["travel", "rapport", "wealth"]:
		var bar := MapArt.fate_bar(axis)
		if bar == null:
			continue
		var tr := TextureRect.new()
		tr.texture = bar
		tr.custom_minimum_size = Vector2(22, 22)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.tooltip_text = axis
		_fate_bars.add_child(tr)
	if _fate_bars.get_child_count() > 0:
		_grid.add_child(_fate_bars)


func refresh(state: WorldState, clock: WorldClock, place_name: String, cargo_used: int,
		culture: String = "latin", currency: String = "") -> void:
	if _rows.is_empty():
		build()
	# The date is read in the calendar of where the traveller is standing —
	# GDD §7.2, one internal day with several civil readings. Showing Gregorian
	# in 1292 would misdate the world by a week.
	var g := clock.date.civil(culture)
	_put("place", place_name)
	_put("date", "%d年%d月%d日 %s" % [g["year"], g["month"], g["day"], clock.date.ganzhi_day()])
	# Money is kept in fen internally; show it the way a traveller would count.
	_put("coins", "%d 银" % (state.coins / 100))
	_put("days", "第 %d 日" % state.days_elapsed)
	_put("cargo", "%d/%d" % [cargo_used, state.cargo_slots])
	_put("fate", "行%d 交%d 财%d" % [
		int(state.fate.get("travel", 0)),
		int(state.fate.get("rapport", 0)),
		int(state.fate.get("wealth", 0))])

	# Swap the coin cell's art for the local currency emblem when one exists.
	if currency != "" and _icons.has("coins") and _icons["coins"] is TextureRect:
		var cur := MapArt.currency_icon(currency)
		if cur != null:
			(_icons["coins"] as TextureRect).texture = cur


func _put(key: String, text: String) -> void:
	if _rows.has(key):
		_rows[key].text = text


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style(true))
	for v in _rows.values():
		v.add_theme_font_size_override("font_size", UiScale.hud())
		v.add_theme_color_override("font_color", Palette.ink())
