class_name TravelConfirm
extends PanelContainer

## City introduction -> explicit confirmation -> transit animation. Selecting
## a mode is planning; pressing confirm is the state-changing departure.

signal confirmed(route: Dictionary, mode: String)
signal cancelled()

var db: ContentDb
var travel: Travel
var _title: Label
var _intro: RichTextLabel
var _facts: Label
var _confirm: Button
var _route: Dictionary = {}
var _mode := ""
var _scroll: ScrollContainer


func _ready() -> void:
	custom_minimum_size = Vector2(640, 430)
	clip_contents = true
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)
	_title = Panels.heading("")
	root.add_child(_title)
	_facts = Panels.label("", UiScale.ui(), Palette.ink_soft())
	root.add_child(_facts)
	root.add_child(Panels.rule())
	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	root.add_child(_scroll)
	_intro = RichTextLabel.new()
	_intro.bbcode_enabled = true
	_intro.fit_content = true
	_intro.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_intro.add_theme_font_size_override("normal_font_size", UiScale.body())
	_intro.add_theme_color_override("default_color", Palette.ink())
	_scroll.add_child(_intro)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", Metrics.sm())
	root.add_child(row)
	row.add_child(Panels.styled_button(I18n.t("ui.think_again"), func(): cancelled.emit()))
	_confirm = Panels.primary_button(I18n.t("ui.depart_confirm"), _emit_confirmed)
	_confirm.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_confirm)


func setup(p_db: ContentDb, p_travel: Travel) -> void:
	db = p_db
	travel = p_travel


func open(route: Dictionary, mode: String, origin: String, state: WorldState) -> void:
	_route = route
	_mode = mode
	_confirm.disabled = false
	var dest := travel.other_end(route, origin)
	var city := db.get_record(dest)
	var transport := I18n.t("transport.%s.name" % mode)
	_title.text = "前往 %s" % I18n.t(city.get("name", dest))
	_facts.text = "%s · %d 日 · %d 银 · 风险 %d/5" % [
		transport,
		travel.total_days(route, mode),
		travel.total_cost(route, mode) / Market.FEN,
		travel.total_risk(route, mode),
	]
	var entry := db.get_record(String(city.get("entryEvent", "")))
	var key := String(entry.get("body", ""))
	var intro := I18n.t(key) if not key.is_empty() else ""
	if intro == key:
		intro = ""
	_intro.text = intro if not intro.is_empty() else "关于这座城市，你目前只知道一个名字与方向。"
	_confirm.text = "确定出发 · %s →" % transport
	_fit_scroll()


## The prose window has a floor but the panel has a ceiling: at a large type
## step the fixed head + button row can already fill the panel, and a long
## entry chapter would push the confirm buttons out of reach. Measure what the
## fixed parts actually need and compress the scroll to fit, keeping at least
## two readable lines.
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


func _emit_confirmed() -> void:
	if not _confirm.disabled and not _route.is_empty() and not _mode.is_empty():
		# Disable before emitting: the receiver mutates world state
		# synchronously, and a double click must never buy the same leg twice.
		_confirm.disabled = true
		confirmed.emit(_route, _mode)
