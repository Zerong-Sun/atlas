class_name HireContract
extends RefCounted

## A readable contract: choosing confirms immediately and exactly once.
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
var _scroll: ScrollContainer
var _head: BoxContainer
var _actions: BoxContainer
var _btn_ok: Button
var _btn_cancel: Button
var _rec: Dictionary = {}
var _mode: String = "open"
var _busy := false


func build(parent: Node) -> void:
	var ui := Panels.overlay(parent, Vector2.ZERO)
	_layer = ui["layer"]
	_panel = ui["panel"]
	_box = ui["box"]

	_bg = TextureRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_bg.modulate = Color(1, 1, 1, 0.92)
	_bg.set_meta("decorative_panel_art", true)
	_panel.add_child(_bg)
	_panel.move_child(_bg, 0)

	_scroll = ScrollContainer.new()
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_scroll.follow_focus = true
	_box.add_child(_scroll)
	_head = BoxContainer.new()
	_head.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_head.add_theme_constant_override("separation", 12)
	_scroll.add_child(_head)

	_portrait = TextureRect.new()
	_portrait.custom_minimum_size = Vector2(140, 180)
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_head.add_child(_portrait)

	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_head.add_child(col)
	_name_l = Panels.label("", UiScale.title(), Palette.ink())
	_name_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_name_l)
	_origin_l = Panels.label("", UiScale.ui() - 2, Palette.ink_soft())
	_origin_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_origin_l)
	_detail_l = Panels.label("", UiScale.ui(), Palette.ink())
	_detail_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_detail_l)
	_verdict_l = Panels.label("", UiScale.body(), Palette.ink())
	_verdict_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_verdict_l)

	_actions = BoxContainer.new()
	_actions.add_theme_constant_override("separation", 10)
	_box.add_child(_actions)
	_btn_ok = Panels.primary_button(I18n.t("ui.forge_contract"), _run_confirm)
	_btn_cancel = Panels.styled_button(I18n.t("ui.pass"), _on_cancel)
	for button in [_btn_ok, _btn_cancel]:
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		_actions.add_child(button)
	Panels.make_dismissable(_layer, _panel, _on_cancel)
	_layer.resized.connect(_fit_window)
	_fit_window()


func open(rec: Dictionary, culture: String, mode: String, verdict_key: String = "") -> void:
	_rec = rec.duplicate(true)
	_mode = mode
	_busy = false
	_refresh_action_labels()
	_btn_ok.disabled = false
	_btn_cancel.disabled = false
	_scroll.scroll_vertical = 0

	var parchment := MapArt.contract_art(mode)
	_bg.texture = parchment
	_bg.visible = parchment != null and not UiScale.high_contrast

	var portrait := MapArt.retainer_portrait(String(rec.get("id", "")), culture, String(rec.get("gender", "")))
	_portrait.texture = portrait
	_portrait.visible = portrait != null

	_name_l.text = I18n.t(rec.get("name", String(rec.get("id", ""))))
	var origin_line := ""
	var origin_v: Variant = rec.get("origin", "")
	if typeof(origin_v) == TYPE_DICTIONARY:
		var city_id := String(origin_v.get("city", ""))
		var culture_id := String(origin_v.get("culture", ""))
		if city_id != "":
			origin_line = I18n.t("city.%s.name" % city_id)
		if culture_id != "":
			origin_line = (origin_line + " · " if origin_line != "" else "") \
				+ I18n.t("ui.culture.%s" % culture_id)
	elif String(origin_v) != "":
		origin_line = I18n.t(origin_v)
	_origin_l.text = origin_line
	var months := int(rec.get("contract", {}).get("months", 12))
	var wage := Panels.money(int(rec.get("wage", {}).get("amount", 0)))
	_detail_l.text = I18n.t("ui.hire_wage_exact_fmt") % [wage, months]
	if mode == "divined" and verdict_key != "":
		_verdict_l.text = I18n.fmt(verdict_key)
		_verdict_l.visible = true
	else:
		_verdict_l.text = ""
		_verdict_l.visible = false

	_layer.visible = true
	_fit_window()
	Motion.parchment_expand(_panel, 0.20)
	_btn_ok.grab_focus()


func _refresh_action_labels() -> void:
	_btn_ok.text = I18n.t("ui.forge_contract")
	_btn_cancel.text = I18n.t("ui.pass")


func _on_cancel() -> void:
	if _busy or not is_instance_valid(_layer) or not _layer.visible:
		return
	Motion.cancel(_panel)
	_layer.hide()
	cancelled.emit()


func _run_confirm() -> void:
	if _busy or not is_instance_valid(_layer) or not _layer.visible:
		return
	_busy = true
	_btn_ok.disabled = true
	_btn_cancel.disabled = true
	Motion.cancel(_panel)
	_layer.hide()
	# All local UI cleanup happens before the signal. The receiver can free
	# this screen or open another contract synchronously without stale work
	# resuming after an animation and mutating the new interaction.
	confirmed.emit(_rec.duplicate(true))


func _fit_window() -> void:
	if not is_instance_valid(_layer) or not _layer.is_inside_tree():
		return
	var viewport_size := _layer.get_viewport_rect().size
	var available := viewport_size - Vector2(32, 32)
	_panel.custom_minimum_size = Vector2(minf(640.0, available.x), minf(480.0, available.y))
	var compact := available.x < 560.0 or UiScale.step == UiScale.Size.LARGE
	_head.vertical = compact
	_actions.vertical = compact
	_portrait.custom_minimum_size = Vector2(100, 125) if compact else Vector2(140, 180)
	_portrait.size_flags_horizontal = Control.SIZE_SHRINK_CENTER if compact else Control.SIZE_FILL
	_panel.reset_size()


## Re-dresses the contract panel for the current type size and contrast mode.
## Without this, opening a hire after switching to high contrast handed the
## player a parchment panel in the middle of an otherwise black-and-white game.
func restyle() -> void:
	if _layer == null or not is_instance_valid(_layer):
		return
	_refresh_action_labels()
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
		_fit_window()
