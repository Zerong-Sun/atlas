class_name HireContract
extends RefCounted

## Parchment hire ritual — open / divined → seal → confirmed.
## Parent owns WorldState mutation after `confirmed`.

signal confirmed(rec: Dictionary)
signal cancelled()

var _layer: Control
var _panel: PanelContainer
var _box: VBoxContainer
var _bg: TextureRect
var _portrait: TextureRect
var _name_l: Label
var _origin_l: Label
var _detail_l: Label
var _verdict_l: Label
var _seal: TextureRect
var _btn_ok: Button
var _btn_cancel: Button
var _rec: Dictionary = {}
var _mode: String = "open"
var _busy := false


func build(parent: Node) -> void:
	var ui := Panels.overlay(parent, Vector2(640, 480))
	_layer = ui["layer"]
	_panel = ui["panel"]
	_box = ui["box"]

	_bg = TextureRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_bg.modulate = Color(1, 1, 1, 0.92)
	_panel.add_child(_bg)
	_panel.move_child(_bg, 0)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	_box.add_child(head)

	_portrait = TextureRect.new()
	_portrait.custom_minimum_size = Vector2(140, 180)
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	head.add_child(_portrait)

	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(col)
	_name_l = Panels.label("", UiScale.title(), Palette.ink())
	col.add_child(_name_l)
	_origin_l = Panels.label("", UiScale.ui() - 2, Palette.ink_soft())
	_origin_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_origin_l)
	_detail_l = Panels.label("", UiScale.ui(), Palette.ink())
	col.add_child(_detail_l)
	_verdict_l = Panels.label("", UiScale.body(), Palette.ink())
	_verdict_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_verdict_l)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_box.add_child(spacer)

	_seal = TextureRect.new()
	_seal.visible = false
	_seal.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_seal.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_seal.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_seal.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_seal.offset_left = -100.0
	_seal.offset_top = -100.0
	_seal.offset_right = -20.0
	_seal.offset_bottom = -20.0
	_panel.add_child(_seal)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	_box.add_child(row)
	_btn_ok = Panels.styled_button(I18n.t("ui.forge_contract"), _run_confirm)
	_btn_cancel = Panels.styled_button(I18n.t("ui.pass"), _on_cancel)
	row.add_child(_btn_ok)
	row.add_child(_btn_cancel)


func open(rec: Dictionary, culture: String, mode: String, verdict_key: String = "") -> void:
	_rec = rec
	_mode = mode
	_busy = false
	_btn_ok.disabled = false
	_btn_cancel.disabled = false
	_seal.visible = false
	_seal.modulate.a = 1.0
	_seal.scale = Vector2.ONE

	var parchment := MapArt.contract_art(mode)
	_bg.texture = parchment
	_bg.visible = parchment != null

	var portrait := MapArt.retainer_portrait(String(rec.get("id", "")), culture)
	_portrait.texture = portrait
	_portrait.visible = portrait != null

	_name_l.text = I18n.t(rec.get("name", String(rec.get("id", ""))))
	var origin_line := ""
	var origin_v: Variant = rec.get("origin", "")
	if typeof(origin_v) == TYPE_DICTIONARY:
		var city_id := String(origin_v.get("city", ""))
		var culture_id := String(origin_v.get("culture", ""))
		if city_id != "":
			origin_line = city_id
		if culture_id != "":
			origin_line = (origin_line + " · " if origin_line != "" else "") + culture_id
	elif String(origin_v) != "":
		origin_line = I18n.t(origin_v)
	_origin_l.text = origin_line
	var months := int(rec.get("contract", {}).get("months", 12))
	var wage := int(rec.get("wage", {}).get("amount", 0)) / Market.FEN
	_detail_l.text = I18n.t("ui.hire_wage_fmt") % [wage, months]
	if mode == "divined" and verdict_key != "":
		_verdict_l.text = I18n.fmt(verdict_key)
		_verdict_l.visible = true
	else:
		_verdict_l.text = ""
		_verdict_l.visible = false

	_layer.visible = true
	_panel.scale = Vector2.ONE
	Motion.parchment_expand(_panel, 0.40)


func _on_cancel() -> void:
	if _busy:
		return
	_layer.visible = false
	cancelled.emit()


func _run_confirm() -> void:
	if _busy:
		return
	_busy = true
	_btn_ok.disabled = true
	_btn_cancel.disabled = true
	await _play_seal()
	_layer.visible = false
	confirmed.emit(_rec)


func _play_seal() -> void:
	var seal_tex := MapArt.seal_wax()
	var sealed := MapArt.contract_art("sealed")
	if seal_tex != null:
		_seal.texture = seal_tex
		_seal.visible = true
		if Motion.allows(Motion.Kind.SCALE):
			_seal.scale = Vector2(0.01, 0.01)
			_seal.modulate.a = 0.0
			var t := _panel.create_tween()
			t.set_parallel(true)
			t.tween_property(_seal, "scale", Vector2.ONE, Motion.dur(0.35, Motion.Kind.SCALE)) \
				.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
			t.tween_property(_seal, "modulate:a", 1.0, Motion.dur(0.35, Motion.Kind.FADE))
			await t.finished
		else:
			_seal.modulate.a = 0.0
			await Motion.fade(_seal, 1.0, 0.25).finished
	if sealed != null:
		_bg.texture = sealed
		_bg.visible = true
	await _panel.get_tree().create_timer(Motion.dur(0.25, Motion.Kind.FADE)).timeout


## Re-dresses the contract panel for the current type size and contrast mode.
## Without this, opening a hire after switching to high contrast handed the
## player a parchment panel in the middle of an otherwise black-and-white game.
func restyle() -> void:
	if _layer == null or not is_instance_valid(_layer):
		return
	Panels.restyle_tree(_layer)
	if _name_l != null and is_instance_valid(_name_l):
		_name_l.add_theme_font_size_override("font_size", UiScale.title())
		_name_l.add_theme_color_override("font_color", Palette.ink())
	if _origin_l != null and is_instance_valid(_origin_l):
		_origin_l.add_theme_font_size_override("font_size", maxi(UiScale.ui() - 2, 10))
		_origin_l.add_theme_color_override("font_color", Palette.ink_faint())
	for l in [_detail_l, _verdict_l]:
		if l != null and is_instance_valid(l):
			l.add_theme_font_size_override("font_size", UiScale.ui())
			l.add_theme_color_override("font_color", Palette.ink())
	if _portrait != null and is_instance_valid(_portrait):
		var w := 140.0 * Metrics.factor()
		_portrait.custom_minimum_size = Vector2(w, w * 1.29)
