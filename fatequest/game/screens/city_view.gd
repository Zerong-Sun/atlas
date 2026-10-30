extends Control

## Spatial city exploration: isolated landmarks occupy the left side of the city.
## Only the scene scrolls on short windows; navigation remains reachable.
signal site_chosen(event_id: String)
signal leave_requested()
signal market_requested()
signal bag_requested()
signal party_requested()
signal settings_requested()
signal books_requested()
signal saves_requested()
signal livelihood_requested()

const PORTRAIT_H := 144.0
var db: ContentDb
var _city: Dictionary = {}
var _state: WorldState
var _cond: ConditionEvaluator
var _ctx: Dictionary = {}
var _status_values: Array = []
var _bg: TextureRect
var _figures: Control
var _figure_scroll: ScrollContainer
var _title: Label
var _hint: Label
var _market_btn: Button
var _settings_btn: Button
var _status: Label
var _guide: Label
var _head: PanelContainer
var _foot: PanelContainer
var _foot_row: HFlowContainer
var _scrim: ColorRect
var _choice_pending := false
var _scene_slots := 0


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
	Panels.apply_card(_head, "atlas")
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
	_guide = Panels.label("", UiScale.ui(), Palette.ink())
	_guide.name = "JourneyGuide"
	_guide.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	head_row.add_child(_guide)
	_figure_scroll = ScrollContainer.new()
	_figure_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_figure_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_figure_scroll.follow_focus = true
	col.add_child(_figure_scroll)
	_figures = Control.new()
	_figures.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_figures.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_figure_scroll.add_child(_figures)
	_foot = PanelContainer.new()
	Panels.apply_card(_foot, "notice")
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
	_foot_row.add_child(_nav_button("ui.stay.entry", func(): livelihood_requested.emit(), true))
	_market_btn = _nav_button("ui.market", func(): market_requested.emit())
	_foot_row.add_child(_market_btn)
	_foot_row.add_child(_nav_button("ui.bag", func(): bag_requested.emit()))
	_foot_row.add_child(_nav_button("ui.party", func(): party_requested.emit()))
	_settings_btn = _nav_button("ui.settings", func(): settings_requested.emit())
	_foot_row.add_child(_settings_btn)
	_foot_row.add_child(_nav_button("ui.books_desk", func(): books_requested.emit()))
	_foot_row.add_child(_nav_button("ui.save_heading", func(): saves_requested.emit()))
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
	var ids: Array = []
	for site_id in city.get("sites", []):
		if site_id not in ids:
			ids.append(site_id)
	if city.has("mentorEvent") and city["mentorEvent"] not in ids:
		ids.append(city["mentorEvent"])
	_scene_slots = ids.size()
	var offered := 0
	for slot in ids.size():
		var sid = ids[slot]
		var ev := db.get_record(String(sid))
		if ev.is_empty():
			continue
		var done: bool = ev.get("once", false) and state.once_fired.get(ev["id"], false)
		if not cond.evaluate(ev.get("when", {}), state, ctx):
			continue
		var place := _make_figure(ev, String(city.get("culture", "")), done, slot)
		place.set_meta("scene_slot", slot)
		_figures.add_child(place)
		if not done:
			offered += 1
	_bg.texture = MapArt.city_explore_bg(city, 0)
	if _figures.get_child_count() == 0:
		_hint.text = I18n.t("ui.city.no_sites_market" if city.has("market") else "ui.city.no_sites")
	else:
		_hint.text = (I18n.t("ui.city.tap_hint") % offered) if offered > 0 else I18n.t("ui.seen_everything")
	_market_btn.visible = city.has("market")
	_layout_cards.call_deferred()


func set_status(coins: int, cargo_used: int, cargo_max: int, day: int, date: String) -> void:
	_status_values = [coins, cargo_used, cargo_max, day, date]
	_status.text = I18n.t("ui.city.status") % _status_values


func set_journey_guide(text: String) -> void:
	_guide.text = text


func _make_figure(ev: Dictionary, culture: String, done: bool, slot: int) -> Control:
	var btn := Button.new()
	btn.set_meta("event_id", String(ev.get("id", "")))
	btn.set_meta("once", bool(ev.get("once", false)))
	btn.set_meta("done", done)
	Panels.style_button(btn)
	btn.custom_minimum_size = Vector2(220, 190)
	for state_name in ["normal", "hover", "pressed", "disabled"]:
		btn.add_theme_stylebox_override(state_name, StyleBoxEmpty.new())
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	var content := VBoxContainer.new()
	content.set_anchors_preset(Control.PRESET_FULL_RECT)
	content.offset_left = 6
	content.offset_right = -6
	content.offset_top = 0
	content.offset_bottom = 0
	content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_theme_constant_override("separation", 8)
	btn.add_child(content)
	var art := _place_art(ev, culture)
	btn.set_meta("art_path", art.resource_path if art != null else "")
	if art != null:
		var tr := TextureRect.new()
		tr.texture = art
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.custom_minimum_size = Vector2(0, PORTRAIT_H if Metrics.factor() <= 1.0 else 116.0)
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tr.modulate = Color(0.82, 0.80, 0.76, 1) if done else Color.WHITE
		content.add_child(tr)
		btn.mouse_entered.connect(func(): tr.modulate = Color(1.12, 1.1, 1.05) if not done else Color(0.82, 0.80, 0.76))
		btn.mouse_exited.connect(func(): tr.modulate = Color(0.82, 0.80, 0.76) if done else Color.WHITE)
	var caption := PanelContainer.new()
	caption.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var caption_style := Panels.card_style("notice")
	caption_style.content_margin_top = 4
	caption_style.content_margin_bottom = 4
	caption_style.content_margin_left = 8
	caption_style.content_margin_right = 8
	caption.add_theme_stylebox_override("panel", caption_style)
	content.add_child(caption)
	var labels := VBoxContainer.new()
	labels.mouse_filter = Control.MOUSE_FILTER_IGNORE
	labels.add_theme_constant_override("separation", 2)
	caption.add_child(labels)
	var title := Panels.label(("✓ " if done else "") + I18n.t(ev.get("title", "")), UiScale.ui(), Palette.ink())
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.mouse_filter = Control.MOUSE_FILTER_IGNORE
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	labels.add_child(title)
	var status_key := "ui.city.card_done" if done else ("ui.city.card_repeat" if not bool(ev.get("once", false)) else "ui.city.card_ready")
	var status := Panels.label(I18n.t(status_key), maxi(UiScale.ui() - 2, 12), Palette.ink_soft())
	status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status.mouse_filter = Control.MOUSE_FILTER_IGNORE
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	labels.add_child(status)
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
			btn.custom_minimum_size.y = maxf(190, content.get_combined_minimum_size().y)
			_layout_cards.call_deferred())
	return btn


func _place_art(ev: Dictionary, culture: String) -> Texture2D:
	# Explicit bindings, never a randomly indexed full-city scene.
	var id := String(ev.get("id", ""))
	var places := {
		"ev-zayton-harbour": "res://assets/art/city-cutouts/zayton-harbor.png",
		"ev-zayton-fanfang": "res://assets/art/city-cutouts/zayton-quarter.png",
		"ev-zayton-mazu": "res://assets/art/city-cutouts/zayton-temple.png",
		"ev-zayton-jiaobei-ask": "res://assets/art/city-cutouts/zayton-temple.png",
		"ev-zayton-battuta-a": "res://assets/art/explore-market-zayton.webp",
		"ev-zayton-mentor": "res://assets/art/city-cutouts/zayton-reader.png",
		"ev-tauris-a": "res://assets/art/city-cutouts/west-gate.png",
		"ev-tauris-b": "res://assets/art/explore-market-tauris.webp",
		"ev-tauris-c": "res://assets/art/city-cutouts/west-garden.png",
		"ev-baldacum-a": "res://assets/art/city-cutouts/west-palace.png",
		"ev-baldacum-b": "res://assets/art/explore-market-baldacum.webp",
		"ev-baldacum-c": "res://assets/art/city-cutouts/west-gate.png",
		"ev-alexandria-welcome-gate": "res://assets/art/city-cutouts/west-gate.png",
		"ev-alexandria-battuta-a": "res://assets/art/city-cutouts/west-palace.png",
		"ev-alexandria-battuta-b": "res://assets/art/ic-place-mosque.webp",
	}
	if places.has(id):
		return load(places[id]) as Texture2D
	var portrait := _portrait_for(ev, culture)
	if portrait != null:
		return portrait
	# Authored POI assets carry place silhouettes, not the city's backdrop.
	var venue := "market"
	if id.contains("temple") or id.contains("shrine") or id.contains("mentor") or id.contains("mosque"):
		venue = "temple"
	elif id.contains("inn") or id.contains("caravan") or id.contains("gate"):
		venue = "inn"
	var art := MapArt.tex("explore-%s-%s" % [venue, MapArt.art_city_id(String(_city.get("id", "")))])
	return art if art != null else MapArt.city_icon(culture, "town")


func _layout_cards() -> void:
	if _figures == null or _figure_scroll.size.x < 1:
		return
	var width := maxf(240, _figure_scroll.size.x - 16)
	var count := _figures.get_child_count()
	# Keep the right-hand architecture visible; destinations occupy the left stage.
	var landmark_width := maxf(240, width * 0.68)
	var columns := 3 if landmark_width >= 744 else 2
	var slots := maxi(count, _scene_slots)
	var rows := maxi(1, ceili(float(slots) / columns))
	var card_width := minf(280, landmark_width / columns - 24)
	var height := 190.0
	for child in _figures.get_children():
		child.custom_minimum_size.x = card_width
		height = maxf(height, child.get_combined_minimum_size().y)
	var scene_h := maxf(_figure_scroll.size.y - 2, rows * (height + 12) + 12)
	_figures.custom_minimum_size = Vector2(0, scene_h)
	for i in count:
		var child: Control = _figures.get_child(i)
		var slot := int(child.get_meta("scene_slot", i))
		var row := slot / columns
		var row_count := mini(columns, slots - row * columns)
		var x := landmark_width * (float(slot % columns) + 0.5) / float(row_count)
		child.size = Vector2(card_width, height)
		child.position = Vector2(x - card_width * 0.5, 4 + row * (height + 12) + (6 if slot % 2 == 0 else 0))
	_figures.queue_redraw()


func restyle() -> void:
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	for label in [_status, _hint, _guide]:
		label.add_theme_font_size_override("font_size", UiScale.ui())
		label.add_theme_color_override("font_color", Palette.ink_soft())
	for p in [_head, _foot]:
		Panels.apply_card(p, "atlas" if p == _head else "notice")
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
	return Color(0, 0, 0, 0.62) if UiScale.high_contrast else Color(0.16, 0.12, 0.07, 0.16)
