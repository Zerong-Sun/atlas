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
var _grid: HBoxContainer


func _ready() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style(true))
	_grid = HBoxContainer.new()
	_grid.add_theme_constant_override("separation", 18)
	add_child(_grid)


func _cell(key: String, icon: String) -> void:
	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", 5)
	var lbl := Label.new()
	lbl.text = icon
	lbl.add_theme_font_size_override("font_size", UiScale.hud())
	lbl.add_theme_color_override("font_color", Palette.ink_soft())
	box.add_child(lbl)
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
	_cell("place", "◈")
	_cell("date", "☉")
	_cell("coins", "◎")
	_cell("days", "⏳")
	_cell("cargo", "▤")
	_cell("fate", "☯")


func refresh(state: WorldState, clock: WorldClock, place_name: String, cargo_used: int,
		culture: String = "latin") -> void:
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


func _put(key: String, text: String) -> void:
	if _rows.has(key):
		_rows[key].text = text


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style(true))
	for v in _rows.values():
		v.add_theme_font_size_override("font_size", UiScale.hud())
		v.add_theme_color_override("font_color", Palette.ink())
