class_name CityDetailCard
extends PanelContainer

## The map card describes a known place and offers a safe way back into the
## city where the traveller has actually arrived. Main validates every entry.
signal closed()
signal enter_requested(city_id: String)

var db: ContentDb
var travel: Travel
var _city: Dictionary = {}
var _state: WorldState
var _title: Label
var _intel: Label
var _body: RichTextLabel
var _routes: VBoxContainer
var _routes_heading: Label
var _scroll: ScrollContainer
var _entry_hint: Label
var _enter_btn: Button
var _close_btn: Button


func _ready() -> void:
	clip_contents = true
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)
	_title = Panels.label("", UiScale.title(), Palette.ink())
	_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(_title)
	_intel = Panels.label("", UiScale.ui(), Palette.ink_soft())
	_intel.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(_intel)
	root.add_child(Panels.rule())
	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_scroll.follow_focus = true
	root.add_child(_scroll)
	var content := VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", Metrics.sm())
	_scroll.add_child(content)
	_body = RichTextLabel.new()
	_body.bbcode_enabled = true
	_body.fit_content = true
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(_body)
	_routes_heading = Panels.heading(I18n.t("ui.known_routes"))
	content.add_child(_routes_heading)
	_routes = VBoxContainer.new()
	_routes.add_theme_constant_override("separation", Metrics.xs())
	content.add_child(_routes)
	_entry_hint = Panels.label("", UiScale.ui(), Palette.ink_soft())
	_entry_hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(_entry_hint)
	var actions := HFlowContainer.new()
	actions.add_theme_constant_override("h_separation", Metrics.md())
	actions.add_theme_constant_override("v_separation", Metrics.sm())
	root.add_child(actions)
	_enter_btn = Panels.primary_button(I18n.t("ui.city.enter"), func():
		if not _enter_btn.disabled:
			enter_requested.emit(String(_city.get("id", ""))))
	actions.add_child(_enter_btn)
	_close_btn = Panels.styled_button(I18n.t("ui.close_map_card"), func(): closed.emit())
	actions.add_child(_close_btn)
	get_viewport().size_changed.connect(_fit_scroll)
	restyle()


func setup(p_db: ContentDb, p_travel: Travel) -> void:
	db = p_db
	travel = p_travel


func show_city(city: Dictionary, state: WorldState) -> void:
	if db == null or travel == null:
		return
	_city = city
	_state = state
	var cid := String(city.get("id", ""))
	var here := cid == state.city
	var level := 3 if here else int(state.revealed.get(cid, 0))
	_title.text = I18n.t(city.get("name", cid))
	_intel.text = I18n.t("ui.city.intel") % [
		level, I18n.t("tier.%s" % city.get("tier", "station")),
		I18n.t("ui.culture.%s" % city.get("culture", "latin"))]
	var entry := db.get_record(String(city.get("entryEvent", "")))
	var intro_key := String(entry.get("body", ""))
	var intro := I18n.t(intro_key) if not intro_key.is_empty() else ""
	if intro == intro_key:
		intro = ""
	_body.text = intro if not intro.is_empty() else I18n.t("ui.city.intro_unknown")
	for child in _routes.get_children():
		_routes.remove_child(child)
		child.queue_free()
	var known_routes: Array = []
	for route in travel.routes_from(cid):
		if travel.is_route_known(route, state):
			known_routes.append(route)
	known_routes.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		var a_dest := travel.other_end(a, cid)
		var b_dest := travel.other_end(b, cid)
		var a_unvisited := a_dest not in state.visited and a_dest != state.start_city
		var b_unvisited := b_dest not in state.visited and b_dest != state.start_city
		if a_unvisited != b_unvisited:
			return a_unvisited
		return I18n.t(db.get_record(a_dest).get("name", a_dest)).naturalcasecmp_to(
			I18n.t(db.get_record(b_dest).get("name", b_dest))) < 0
	)
	for route in known_routes:
		var other := travel.other_end(route, cid)
		var other_city := db.get_record(other)
		var mode_names: Array[String] = []
		for mode in route.get("modes", []):
			mode_names.append(I18n.t("transport.%s.name" % String(mode)))
		var other_name := I18n.t(other_city.get("name", other))
		var line := I18n.t("ui.city.route_line") % [
			other_name, "／".join(PackedStringArray(mode_names))]
		_add_route_label(line, Palette.ink(), other not in state.visited and other != state.start_city)
	if _routes.get_child_count() == 0:
		_add_route_label(I18n.t("ui.city.road_unknown"), Palette.ink_soft())
	var travelling := not state.active_journey.is_empty()
	var pending := not state.active_event.is_empty() or not state.pending_events.is_empty()
	_enter_btn.text = I18n.t("ui.continue_pending") if here and pending and not travelling else I18n.t("ui.city.enter")
	_enter_btn.disabled = not here or travelling or bool(state.life.get("deceased", false))
	_enter_btn.focus_mode = Control.FOCUS_NONE if _enter_btn.disabled else Control.FOCUS_ALL
	var hint_key := "ui.city.enter_here"
	if not here:
		hint_key = "ui.city.enter_remote"
	elif travelling:
		hint_key = "ui.city.enter_travelling"
	elif bool(state.life.get("deceased", false)):
		hint_key = "ui.city.enter_ended"
	elif pending:
		hint_key = "ui.city.enter_pending"
	_entry_hint.text = I18n.t(hint_key)
	_enter_btn.tooltip_text = _entry_hint.text
	_scroll.scroll_vertical = 0
	_fit_scroll()


func _add_route_label(text: String, color: Color, is_new := false) -> void:
	var label := Panels.label(text, UiScale.ui(), color)
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", Metrics.sm())
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(label)
	if is_new: row.add_child(Panels.badge(I18n.t("ui.route.new_badge")))
	_routes.add_child(row)


## Keep the action row fixed while the authored intro and routes scroll.
func _fit_scroll() -> void:
	if _scroll == null or not is_inside_tree():
		return
	var vp := get_viewport_rect().size
	custom_minimum_size = Vector2(minf(760, maxf(280, vp.x - 32)), minf(620, maxf(260, vp.y - 32)))
	size = custom_minimum_size
	_title.add_theme_font_size_override("font_size", mini(UiScale.title(), UiScale.ui() + 6) if vp.x < 760 else UiScale.title())


func restyle() -> void:
	if _scroll == null:
		return
	Panels.apply_card(self, "atlas")
	_title.add_theme_color_override("font_color", Palette.ink())
	for label in [_intel, _entry_hint, _routes_heading]:
		label.add_theme_font_size_override("font_size", UiScale.ui())
		label.add_theme_color_override("font_color", Palette.ink_soft())
	_body.add_theme_font_size_override("normal_font_size", UiScale.body())
	_body.add_theme_color_override("default_color", Palette.ink())
	_routes_heading.text = I18n.t("ui.known_routes")
	_close_btn.text = I18n.t("ui.close_map_card")
	Panels.style_button(_enter_btn)
	_enter_btn.add_theme_stylebox_override("normal", Palette.button_style(Palette.State.HOVER))
	Panels.style_button(_close_btn)
	if _state != null:
		show_city(_city, _state)
	_fit_scroll()
