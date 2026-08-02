class_name CityDetailCard
extends PanelContainer

## Reader-facing map card for a known city. City knowledge and road knowledge
## are intentionally shown separately: hearing that Kinsay exists must not
## invent a route to it.

signal closed()

var db: ContentDb
var travel: Travel
var _title: Label
var _intel: Label
var _body: RichTextLabel
var _routes: VBoxContainer
var _scroll: ScrollContainer


func _ready() -> void:
	custom_minimum_size = Vector2(640, 460)
	clip_contents = true
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)

	_title = Panels.heading("")
	root.add_child(_title)
	_intel = Panels.label("", UiScale.ui(), Palette.ink_soft())
	root.add_child(_intel)
	root.add_child(Panels.rule())

	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	root.add_child(_scroll)
	var content := VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", Metrics.sm())
	_scroll.add_child(content)

	_body = RichTextLabel.new()
	_body.bbcode_enabled = true
	_body.fit_content = true
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_body.add_theme_font_size_override("normal_font_size", UiScale.body())
	_body.add_theme_color_override("default_color", Palette.ink())
	content.add_child(_body)
	content.add_child(Panels.heading(I18n.t("ui.known_routes")))
	_routes = VBoxContainer.new()
	_routes.add_theme_constant_override("separation", Metrics.xs())
	content.add_child(_routes)

	root.add_child(Panels.styled_button(I18n.t("ui.close_map_card"), func(): closed.emit()))


func setup(p_db: ContentDb, p_travel: Travel) -> void:
	db = p_db
	travel = p_travel


func show_city(city: Dictionary, state: WorldState) -> void:
	if db == null or travel == null:
		return
	var cid := String(city.get("id", ""))
	var level := 3 if cid == state.city else int(state.revealed.get(cid, 0))
	_title.text = I18n.t(city.get("name", cid))
	_intel.text = "城市情报 %d/3 · %s · %s" % [
		level, String(city.get("tier", "station")), String(city.get("culture", ""))]

	var entry := db.get_record(String(city.get("entryEvent", "")))
	var intro_key := String(entry.get("body", ""))
	var intro := I18n.t(intro_key) if not intro_key.is_empty() else ""
	if intro == intro_key:
		intro = ""
	_body.text = intro if not intro.is_empty() else "你只知道这座城的名字与大致方位，尚未听到可靠的城中描述。"

	for child in _routes.get_children():
		child.queue_free()
	var route_count := 0
	for route in travel.routes_from(cid):
		if not travel.is_route_known(route, state):
			continue
		var other := travel.other_end(route, cid)
		var other_city := db.get_record(other)
		var mode_names: Array[String] = []
		for mode in route.get("modes", []):
			mode_names.append(I18n.t("transport.%s.name" % String(mode)))
		var line := "→ %s　%s" % [
			I18n.t(other_city.get("name", other)),
			"／".join(PackedStringArray(mode_names)),
		]
		_routes.add_child(Panels.label(line, UiScale.ui(), Palette.ink()))
		route_count += 1
	if route_count == 0:
		_routes.add_child(Panels.label(
			"知道这座城市，但尚未获知任何可靠的通行道路。",
			UiScale.ui(), Palette.ink_soft()))
	_fit_scroll()


## Compress the scroll so the close button always stays on screen at any type
## step, the same ceiling the event dialog applies to its prose.
func _fit_scroll() -> void:
	if _scroll == null:
		return
	var vp := get_viewport_rect().size
	var cap := minf(vp.y - float(Metrics.xl()) * 3.0, 520.0)
	var scroll_min := float(_scroll.custom_minimum_size.y)
	var fixed := get_minimum_size().y - scroll_min
	var floor_h := float(UiScale.body()) * 2.0
	var want := clampf(scroll_min, floor_h, maxf(floor_h, cap - fixed))
	if absf(want - scroll_min) > 0.5:
		_scroll.custom_minimum_size = Vector2(0, want)
