extends Control

## City exploration keeps every place and the road out within reach. Cards
## wrap with the window; only the places scroll, while navigation stays put.
signal site_chosen(event_id: String)
signal leave_requested()
signal market_requested()
signal bag_requested()
signal party_requested()
signal settings_requested()

const PORTRAIT_H := 190.0
var db: ContentDb
var _city: Dictionary = {}
var _state: WorldState
var _cond: ConditionEvaluator
var _ctx: Dictionary = {}
var _status_values: Array = []
var _bg: TextureRect
var _figures: GridContainer
var _figure_scroll: ScrollContainer
var _title: Label
var _hint: Label
var _market_btn: Button
var _settings_btn: Button
var _status: Label
var _head: PanelContainer
var _foot: PanelContainer
var _foot_row: HFlowContainer
var _scrim: ColorRect
var _choice_pending := false


func setup(p_db: ContentDb) -> void:
	db = p_db
	_build()


func _build() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_bg = TextureRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_bg)
	_scrim = ColorRect.new()
	_scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	_scrim.color = _scrim_color()
	_scrim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_scrim)
	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.offset_left = 24
	col.offset_right = -24
	col.offset_top = 18
	col.offset_bottom = -18
	col.add_theme_constant_override("separation", 12)
	add_child(col)
	_head = PanelContainer.new()
	_head.add_theme_stylebox_override("panel", Palette.panel_style())
	col.add_child(_head)
	var head_row := VBoxContainer.new()
	head_row.add_theme_constant_override("separation", 4)
	_head.add_child(head_row)
	_title = Panels.label("", UiScale.title(), Palette.ink())
	_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	head_row.add_child(_title)
	_status = Panels.label("", UiScale.ui(), Palette.ink_soft())
	_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	head_row.add_child(_status)
	_figure_scroll = ScrollContainer.new()
	_figure_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_figure_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_figure_scroll.follow_focus = true
	col.add_child(_figure_scroll)
	_figures = GridContainer.new()
	_figures.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_figures.add_theme_constant_override("h_separation", 16)
	_figures.add_theme_constant_override("v_separation", 16)
	_figure_scroll.add_child(_figures)
	_foot = PanelContainer.new()
	_foot.add_theme_stylebox_override("panel", Palette.panel_style())
	col.add_child(_foot)
	var foot_col := VBoxContainer.new()
	foot_col.add_theme_constant_override("separation", 8)
	_foot.add_child(foot_col)
	_hint = Panels.label("", UiScale.ui(), Palette.ink_soft())
	_hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	foot_col.add_child(_hint)
	_foot_row = HFlowContainer.new()
	_foot_row.add_theme_constant_override("h_separation", 10)
	_foot_row.add_theme_constant_override("v_separation", 8)
	foot_col.add_child(_foot_row)
	_market_btn = _nav_button("ui.market", func(): market_requested.emit())
	_foot_row.add_child(_market_btn)
	_foot_row.add_child(_nav_button("ui.bag", func(): bag_requested.emit()))
	_foot_row.add_child(_nav_button("ui.party", func(): party_requested.emit()))
	_settings_btn = _nav_button("ui.settings", func(): settings_requested.emit())
	_foot_row.add_child(_settings_btn)
	_foot_row.add_child(_nav_button("ui.set_out", func(): leave_requested.emit(), true))
	resized.connect(_layout_cards)
	_figure_scroll.resized.connect(_layout_cards)


func _nav_button(key: String, callback: Callable, primary := false) -> Button:
	var b := Panels.primary_button(I18n.t(key), callback) if primary else Panels.styled_button(I18n.t(key), callback)
	b.set_meta("i18n_key", key)
	b.set_meta("primary", primary)
	return b


func _portrait_for(ev: Dictionary, culture: String, slot: int = -1) -> Texture2D:
	return MapArt.event_portrait(ev, culture, slot)


func show_city(city: Dictionary, state: WorldState, cond: ConditionEvaluator, ctx: Dictionary) -> void:
	_city = city
	_state = state
	_cond = cond
	_ctx = ctx
	_choice_pending = false
	_title.text = I18n.t(city.get("name", ""))
	for c in _figures.get_children():
		_figures.remove_child(c)
		c.queue_free()
	var ids: Array = (city.get("sites", []) as Array).duplicate()
	if city.has("mentorEvent"):
		ids.append(city["mentorEvent"])
	var offered := 0
	for sid in ids:
		var ev := db.get_record(String(sid))
		if ev.is_empty():
			continue
		var done: bool = ev.get("once", false) and state.once_fired.get(ev["id"], false)
		if not cond.evaluate(ev.get("when", {}), state, ctx):
			continue
		_figures.add_child(_make_figure(ev, String(city.get("culture", "")), done, _figures.get_child_count()))
		if not done:
			offered += 1
	_bg.texture = MapArt.city_explore_bg(city, 0)
	_hint.text = (I18n.t("ui.city.tap_hint") % offered) if offered > 0 else I18n.t("ui.seen_everything")
	_market_btn.visible = city.has("market")
	_layout_cards.call_deferred()


func set_status(coins: int, cargo_used: int, cargo_max: int, day: int, date: String) -> void:
	_status_values = [coins, cargo_used, cargo_max, day, date]
	_status.text = I18n.t("ui.city.status") % _status_values


func _make_figure(ev: Dictionary, culture: String, done: bool, slot: int) -> Control:
	var btn := Button.new()
	btn.set_meta("event_id", String(ev.get("id", "")))
	btn.set_meta("once", bool(ev.get("once", false)))
	btn.set_meta("done", done)
	Panels.style_button(btn)
	btn.custom_minimum_size = Vector2(220, 300)
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	var content := VBoxContainer.new()
	content.set_anchors_preset(Control.PRESET_FULL_RECT)
	content.offset_left = 12
	content.offset_right = -12
	content.offset_top = 12
	content.offset_bottom = -12
	content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_theme_constant_override("separation", 8)
	btn.add_child(content)
	var art := _portrait_for(ev, culture, slot)
	var is_portrait := art != null
	if art == null:
		art = MapArt.event_scene(ev, _city)
	if art != null:
		var tr := TextureRect.new()
		tr.texture = art
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT if is_portrait else TextureRect.STRETCH_KEEP_ASPECT_COVERED
		tr.custom_minimum_size = Vector2(0, PORTRAIT_H)
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tr.modulate = Color(0.82, 0.80, 0.76, 1) if done else Color.WHITE
		content.add_child(tr)
	var title := Panels.label(("✓ " if done else "") + I18n.t(ev.get("title", "")), UiScale.ui(), Palette.ink())
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(title)
	var status_key := "ui.city.card_done" if done else ("ui.city.card_repeat" if not bool(ev.get("once", false)) else "ui.city.card_ready")
	var status := Panels.label(I18n.t(status_key), maxi(UiScale.ui() - 2, 12), Palette.ink_soft())
	status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(status)
	btn.tooltip_text = I18n.t(ev.get("title", "")) + "\n" + I18n.t(status_key)
	btn.disabled = done
	if done:
		btn.focus_mode = Control.FOCUS_NONE
		btn.mouse_default_cursor_shape = Control.CURSOR_ARROW
	else:
		btn.pressed.connect(func():
			if _choice_pending:
				return
			_choice_pending = true
			site_chosen.emit(String(ev.get("id", ""))))
	content.minimum_size_changed.connect(func():
		if is_instance_valid(btn):
			btn.custom_minimum_size.y = maxf(300, content.get_combined_minimum_size().y + 24))
	return btn


func _layout_cards() -> void:
	if _figures == null or _figure_scroll.size.x < 1:
		return
	var available := maxf(180, _figure_scroll.size.x - 16)
	var desired_width := 240.0 * Metrics.factor()
	_figures.columns = maxi(1, mini(_figures.get_child_count(), int(available / desired_width)))
	var card_width := floorf((available - 16 * (_figures.columns - 1)) / _figures.columns)
	for c in _figures.get_children():
		c.custom_minimum_size.x = card_width


func restyle() -> void:
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	for label in [_status, _hint]:
		label.add_theme_font_size_override("font_size", UiScale.ui())
		label.add_theme_color_override("font_color", Palette.ink_soft())
	for p in [_head, _foot]:
		p.add_theme_stylebox_override("panel", Palette.panel_style())
	for b in _foot_row.get_children():
		if b is Button:
			b.text = I18n.t(b.get_meta("i18n_key", ""))
			Panels.style_button(b)
			if b.get_meta("primary", false):
				b.add_theme_stylebox_override("normal", Palette.button_style(Palette.State.HOVER))
	_scrim.color = _scrim_color()
	if not _status_values.is_empty():
		_status.text = I18n.t("ui.city.status") % _status_values
	if _state != null and _cond != null:
		show_city(_city, _state, _cond, _ctx)


func _scrim_color() -> Color:
	return Color(0, 0, 0, 0.62) if UiScale.high_contrast else Color(0.09, 0.07, 0.04, 0.42)
