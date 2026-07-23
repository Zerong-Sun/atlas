extends Control

## The inside of a city: a place you look at, not a menu you read.
##
## Until now "exploring" a city meant a list of buttons. GDD §6 gives every city
## six things — entry, three sites, a mentor, a market, a shrine, a road out —
## and §5.2 makes doing at least one of them the precondition for learning where
## the next road goes. That reads much better as a scene you can point at than
## as a list, so the sites become figures standing in the place itself.
##
## Art is optional throughout: a missing portrait falls back to a labelled
## plaque, so a city is always explorable even before its art exists.

signal site_chosen(event_id: String)
signal leave_requested()
signal market_requested()
signal bag_requested()

const PORTRAIT_H := 300.0

var db: ContentDb
var _city: Dictionary = {}
var _bg: TextureRect
var _figures: HBoxContainer
var _title: Label
var _hint: Label
var _market_btn: Button
var _status: Label


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

	# The scene photograph is busy; text needs its own ground to sit on.
	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Color(0.09, 0.07, 0.04, 0.42)
	scrim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(scrim)

	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.offset_left = 28
	col.offset_right = -28
	col.offset_top = 20
	col.offset_bottom = -20
	col.add_theme_constant_override("separation", 10)
	add_child(col)

	var head := PanelContainer.new()
	head.add_theme_stylebox_override("panel", Palette.panel_style())
	head.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	col.add_child(head)
	var head_row := VBoxContainer.new()
	head_row.alignment = BoxContainer.ALIGNMENT_CENTER
	head.add_child(head_row)
	_title = Label.new()
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	head_row.add_child(_title)

	# This screen hides the HUD behind it, so it repeats the numbers a player
	# needs in order to decide anything here.
	_status = Label.new()
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.add_theme_font_size_override("font_size", UiScale.ui())
	_status.add_theme_color_override("font_color", Palette.ink_soft())
	head_row.add_child(_status)

	col.add_child(_spacer())

	_figures = HBoxContainer.new()
	_figures.alignment = BoxContainer.ALIGNMENT_CENTER
	_figures.add_theme_constant_override("separation", 26)
	_figures.size_flags_vertical = Control.SIZE_SHRINK_END
	col.add_child(_figures)

	# --- foot: hint + the ways out --------------------------------------
	var foot := PanelContainer.new()
	foot.add_theme_stylebox_override("panel", Palette.panel_style())
	foot.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	col.add_child(foot)

	var foot_row := HBoxContainer.new()
	foot_row.add_theme_constant_override("separation", 14)
	foot.add_child(foot_row)

	_hint = Label.new()
	_hint.add_theme_font_size_override("font_size", UiScale.ui())
	_hint.add_theme_color_override("font_color", Palette.ink_soft())
	foot_row.add_child(_hint)

	_market_btn = Panels.styled_button("市集", func(): market_requested.emit())
	foot_row.add_child(_market_btn)
	foot_row.add_child(Panels.styled_button("行囊", func(): bag_requested.emit()))
	# Without this the city is a dead end. It is the single most important
	# control on the screen.
	foot_row.add_child(Panels.styled_button("上路 →", func(): leave_requested.emit()))


func _spacer() -> Control:
	var s := Control.new()
	s.size_flags_vertical = Control.SIZE_EXPAND_FILL
	return s


## Which portrait stands in for a site. Art is organised by venue and culture
## (npc-<venue>-<set>), so a market site gets the market trader of its own
## civilisation rather than a generic figure.
func _portrait_for(ev: Dictionary, culture: String, slot: int = -1) -> Texture2D:
	var set_name: String = MapArt.CULTURE_SET.get(culture, "con")
	var id := String(ev.get("id", ""))
	var venue := "market"
	if id.contains("shrine") or id.contains("temple") or id.contains("mazu") or id.contains("mosque"):
		venue = "temple"
	elif id.contains("serai") or id.contains("inn") or id.contains("caravan"):
		venue = "inn"
	elif id.contains("mentor") or id.contains("tea") or id.contains("school"):
		venue = "tea"
	elif slot >= 0:
		venue = ["market", "inn", "tea", "temple"][slot % 4]
	return MapArt.tex("npc-%s-%s" % [venue, set_name])


func show_city(city: Dictionary, state: WorldState, cond: ConditionEvaluator,
		ctx: Dictionary) -> void:
	_city = city
	_title.text = I18n.t(city.get("name", ""))

	_bg.texture = MapArt.city_scene(city)

	for c in _figures.get_children():
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
		_figures.add_child(_make_figure(ev, String(city.get("culture", "")), done, offered))
		offered += 1

	_hint.text = ("点击一处走近看看 · 共 %d 处" % offered) if offered > 0 \
		else "此地已看遍"
	_market_btn.visible = city.has("market")


## Money, hold and day, repeated here because the HUD is behind this screen.
func set_status(coins: int, cargo_used: int, cargo_max: int, day: int, date: String) -> void:
	_status.text = "%d 银 · 货格 %d/%d · 第 %d 日 · %s" % [coins, cargo_used, cargo_max, day, date]


func _make_figure(ev: Dictionary, culture: String, done: bool, slot: int) -> Control:
	var box := VBoxContainer.new()
	box.alignment = BoxContainer.ALIGNMENT_END
	box.add_theme_constant_override("separation", 6)

	var btn := Button.new()
	btn.flat = true
	btn.focus_mode = Control.FOCUS_NONE
	var art := _portrait_for(ev, culture, slot)
	if art != null:
		var tr := TextureRect.new()
		tr.texture = art
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT
		var h := PORTRAIT_H * (0.78 if done else 1.0)
		tr.custom_minimum_size = Vector2(h * 0.72, h)
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		# A place already explored stays visible but recedes, so the player can
		# see what they have done without it competing for attention.
		tr.modulate = Color(0.72, 0.68, 0.62, 0.62) if done else Color(1, 1, 1, 1)
		btn.custom_minimum_size = tr.custom_minimum_size
		btn.add_child(tr)
	else:
		btn.text = I18n.t(ev.get("title", ""))
		btn.custom_minimum_size = Vector2(180, 90)
	if done:
		# Still readable — you can look at a place you have been — but it no
		# longer offers choices, so it must not look like an open action.
		btn.disabled = true
		btn.tooltip_text = "已看过"
	else:
		btn.pressed.connect(func(): site_chosen.emit(String(ev.get("id", ""))))
	box.add_child(btn)

	var plate := PanelContainer.new()
	plate.add_theme_stylebox_override("panel", Palette.panel_style())
	plate.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var lbl := Label.new()
	lbl.text = ("✓ " if done else "") + I18n.t(ev.get("title", ""))
	lbl.add_theme_font_size_override("font_size", UiScale.ui())
	lbl.add_theme_color_override("font_color", Palette.ink_soft() if done else Palette.ink())
	plate.add_child(lbl)
	box.add_child(plate)
	return box


func restyle() -> void:
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	_hint.add_theme_font_size_override("font_size", UiScale.ui())
