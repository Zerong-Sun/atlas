class_name Hud
extends PanelContainer

## The traveller's own state, always visible.
##
## Previously the only readout was one line of text and the purse was invisible
## until a choice was greyed out for want of coin — the player could not answer
## "can I afford this?" without trying it. Money, day, fate and cargo are the
## four numbers every decision in the game is made against, so they are on
## screen at all times.
##
## Two things this bar did badly, now fixed:
##
## It was a single HBoxContainer. Six cells plus three fate bars, at the HUGE
## type step, come to well over 1280 px, and an HBox does not wrap — it simply
## ran off the right edge and the fate readout was gone. A HFlowContainer wraps
## to a second line instead, which costs 30 px of map and loses nothing.
##
## And every number simply snapped to its new value. A journey is forty days of
## small arithmetic; if forty silver leave the purse during an event, the player
## should see them leave. Changed cells now flash green or red for a moment and
## show the delta, so a cost is witnessed rather than reconstructed by comparing
## a remembered number against a current one.

const FLASH_HOLD := 1.6

var _rows: Dictionary = {}
var _icons: Dictionary = {}
var _deltas: Dictionary = {}
var _last: Dictionary = {}
var _grid: HFlowContainer
var _fate_bars: HBoxContainer
## Suppressed for the first refresh after a load, so restoring a save does not
## light up the whole bar as though the player had just earned it all.
var _quiet: bool = true

## Long-form labels for each cell, shown on hover. The bar is terse by
## necessity; the meaning of "行52" should not depend on having read the manual.
var _tips: Dictionary = {}


func _tip(key: String, fallback: String = "") -> String:
	if _tips.is_empty():
		_tips = {
			"place": I18n.t("ui.current_location"),
			"date": I18n.t("ui.hud.tip_date"),
			"coins": I18n.t("ui.hud.tip_coins"),
			"days": I18n.t("ui.days_travelled"),
			"cargo": I18n.t("ui.hud.tip_cargo"),
			"fate": I18n.t("ui.hud.tip_fate"),
			"life": I18n.t("ui.hud.tip_life"),
		}
	return String(_tips.get(key, fallback))


func _ready() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style(true))
	_grid = HFlowContainer.new()
	_grid.add_theme_constant_override("h_separation", Metrics.lg())
	_grid.add_theme_constant_override("v_separation", Metrics.xs())
	add_child(_grid)


func _cell(key: String, emoji: String, art: Texture2D = null) -> void:
	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", Metrics.xs() + 1)
	box.tooltip_text = _tip(key)
	# The whole cell answers the tooltip, not just the glyph — a 18 px icon is
	# a small target to have to find with the pointer.
	box.mouse_filter = Control.MOUSE_FILTER_STOP

	if art != null:
		var tr := TextureRect.new()
		tr.texture = art
		var d := float(Metrics.icon())
		tr.custom_minimum_size = Vector2(d, d)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		box.add_child(tr)
		_icons[key] = tr
	else:
		var lbl := Label.new()
		lbl.text = emoji
		lbl.add_theme_font_size_override("font_size", UiScale.hud())
		lbl.add_theme_color_override("font_color", Palette.ink_soft())
		lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		box.add_child(lbl)
		_icons[key] = lbl

	var val := Label.new()
	val.add_theme_font_size_override("font_size", UiScale.hud())
	val.add_theme_color_override("font_color", Palette.ink())
	val.mouse_filter = Control.MOUSE_FILTER_IGNORE
	box.add_child(val)
	_rows[key] = val

	# The delta rider sits beside the value and is empty almost always.
	var delta := Label.new()
	delta.add_theme_font_size_override("font_size", maxi(UiScale.hud() - 3, 10))
	delta.modulate.a = 0.0
	delta.mouse_filter = Control.MOUSE_FILTER_IGNORE
	box.add_child(delta)
	_deltas[key] = delta

	_grid.add_child(box)


func build() -> void:
	for c in _grid.get_children():
		c.queue_free()
	_rows.clear()
	_icons.clear()
	_deltas.clear()
	# The tips cache is built lazily against the current locale; a language
	# switch must forget it or every cell would keep its old-language tooltip.
	_tips.clear()
	_cell("place", "◈", MapArt.ui("orn-seal"))
	_cell("date", "☉")
	_cell("coins", "◎", MapArt.ui("icon-coin"))
	_cell("days", "⏳")
	_cell("cargo", "▤", MapArt.ui("cargo-tag"))
	_cell("fate", "☯", MapArt.fate_wheel())
	_cell("life", "♡")

	_fate_bars = HBoxContainer.new()
	_fate_bars.add_theme_constant_override("separation", Metrics.xs())
	for axis in ["travel", "rapport", "wealth"]:
		var bar := MapArt.fate_bar(axis)
		if bar == null:
			continue
		var tr := TextureRect.new()
		tr.texture = bar
		var d := float(Metrics.icon_lg())
		tr.custom_minimum_size = Vector2(d, d)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.tooltip_text = _tip("fate", axis)
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
	_put("date", I18n.t("ui.hud.date") % [g["year"], g["month"], g["day"], clock.date.ganzhi_day()])
	# Money is kept in fen internally; show it the way a traveller would count.
	var silver := state.coins / 100
	_put("coins", I18n.t("ui.hud.coins") % silver)
	_put("days", I18n.t("ui.hud.days") % state.days_elapsed)
	_put("cargo", "%d/%d" % [cargo_used, state.cargo_slots])
	_put("fate", I18n.t("ui.hud.fate") % [
		int(state.fate.get("travel", 0)),
		int(state.fate.get("rapport", 0)),
		int(state.fate.get("wealth", 0))])
	_put("life", I18n.t("ui.hud.life") % [
		int(state.life.get("vitality", 100)),
		I18n.t("life.stage.%s" % String(state.life.get("stage", "stable")))])

	# Deltas worth announcing. Cargo is not one: it changes on every trade and
	# the market screen already shows the movement in place.
	_track("coins", silver, I18n.t("ui.silver"))
	_track("days", state.days_elapsed, I18n.t("ui.days"))
	_track("fate", int(state.fate.get("travel", 0))
		+ int(state.fate.get("rapport", 0))
		+ int(state.fate.get("wealth", 0)), "")
	_track("life", int(state.life.get("vitality", 100)), "")
	_quiet = false

	# Swap the coin cell's art for the local currency emblem when one exists.
	if currency != "" and _icons.has("coins") and _icons["coins"] is TextureRect:
		var cur := MapArt.currency_icon(currency)
		if cur != null:
			(_icons["coins"] as TextureRect).texture = cur


## Records a value and, when it moved, flashes the cell and rides a signed
## delta beside it for a beat.
func _track(key: String, value: int, unit: String) -> void:
	var had: bool = _last.has(key)
	var before: int = int(_last.get(key, value))
	_last[key] = value
	if _quiet or not had or value == before:
		return
	var diff := value - before
	var up := diff > 0
	# Days going up is a cost, not a gain — time is the resource this game
	# actually spends. Everything else reads the ordinary way.
	var good := up if key != "days" else false
	_flash(key, "%s%d%s" % ["+" if up else "−", absi(diff), unit], good)


func _flash(key: String, text: String, good: bool) -> void:
	if not _deltas.has(key) or not _rows.has(key):
		return
	var rider: Label = _deltas[key]
	var val: Label = _rows[key]
	if not is_instance_valid(rider) or not is_instance_valid(val):
		return
	var col := Palette.gain() if good else Palette.loss()
	rider.text = text
	rider.add_theme_color_override("font_color", col)
	val.add_theme_color_override("font_color", col)

	# Reduce-motion readers still get the delta text and the colour; only the
	# fade is dropped, because the information is in the number, not the fade.
	if Motion.reduce_motion:
		rider.modulate.a = 1.0
	else:
		rider.modulate.a = 0.0
		var t := rider.create_tween()
		t.tween_property(rider, "modulate:a", 1.0, Motion.dur(0.12, Motion.Kind.FADE))

	var tree := get_tree()
	if tree == null:
		return
	tree.create_timer(FLASH_HOLD).timeout.connect(func() -> void:
		if not is_instance_valid(rider) or not is_instance_valid(val):
			return
		if rider.text != text:
			return  # a newer flash already claimed this cell
		val.add_theme_color_override("font_color", Palette.ink())
		if Motion.reduce_motion:
			rider.text = ""
			rider.modulate.a = 0.0
		else:
			var out := rider.create_tween()
			out.tween_property(rider, "modulate:a", 0.0,
				Motion.dur(0.25, Motion.Kind.FADE))
			out.finished.connect(func() -> void:
				if is_instance_valid(rider):
					rider.text = ""))


## Call after loading a save, so the restored numbers are not announced as
## though the player had just won them.
func silence_next() -> void:
	_quiet = true
	_last.clear()


func _put(key: String, text: String) -> void:
	if _rows.has(key):
		_rows[key].text = text


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style(true))
	if _grid != null:
		_grid.add_theme_constant_override("h_separation", Metrics.lg())
		_grid.add_theme_constant_override("v_separation", Metrics.xs())
	for k in _rows.keys():
		var v: Label = _rows[k]
		v.add_theme_font_size_override("font_size", UiScale.hud())
		v.add_theme_color_override("font_color", Palette.ink())
	for k in _deltas.keys():
		(_deltas[k] as Label).add_theme_font_size_override(
			"font_size", maxi(UiScale.hud() - 3, 10))
	# Icons scale with the type too, or a 18 px seal beside 26 pt text looks
	# like a speck the player is meant to squint at.
	for k in _icons.keys():
		var ic = _icons[k]
		if ic is TextureRect:
			var d := float(Metrics.icon())
			(ic as TextureRect).custom_minimum_size = Vector2(d, d)
		elif ic is Label:
			(ic as Label).add_theme_font_size_override("font_size", UiScale.hud())
			(ic as Label).add_theme_color_override("font_color", Palette.ink_soft())
	if _fate_bars != null and is_instance_valid(_fate_bars):
		for c in _fate_bars.get_children():
			if c is TextureRect:
				var d2 := float(Metrics.icon_lg())
				(c as TextureRect).custom_minimum_size = Vector2(d2, d2)
