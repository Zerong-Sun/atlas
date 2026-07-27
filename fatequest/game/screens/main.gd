extends Control

## P1 shell: desk -> map -> travel + events. Deliberately plain; art lands in
## P2 (docs/ART_REQUIREMENTS.md). What matters here is that the kernel loop is
## reachable by a human: arrive, read an event, choose, hire a road, depart.

const MARGIN := 48.0
const START_JDN_Y := 1292
const START_COINS := 500000     # fen — the kernel keeps money in integers

## Resolved at runtime rather than referenced as a global identifier.
##
## `godot --script tests/foo.gd` does NOT register autoload globals, so a hard
## `AudioDirector.x()` makes main.gd fail to COMPILE under headless test — which
## is how a 6-hour CI hang happened: the scene failed to load, the test script
## carried on against a bare Control, and the SceneTree never reached quit().
##
## A scene should not be untestable because one optional subsystem is absent.
var _audio: Node = null

func _audio_ready() -> bool:
	return _audio != null and is_instance_valid(_audio)

func _resolve_audio() -> void:
	if _audio_ready():
		return
	var tree := get_tree()
	if tree and tree.root:
		_audio = tree.root.get_node_or_null("AudioDirector")

var db := ContentDb.new()
var projection: MapProjection

var state: WorldState
var clock: WorldClock
var rng: Rng
var executor: EffectExecutor
var conditions: ConditionEvaluator
var events: EventMachine
var travel: Travel

var _map: Node2D
var _desk: Control
var _hud: Hud
var _log: RichTextLabel
var _panel: VBoxContainer
var _city_view: Control
var _dialog: PanelContainer
var _dialog_layer: Control
var _current_event: Dictionary = {}
var _controls: HBoxContainer
var _market: Market
var _market_view: PanelContainer
var _market_layer: Control
var _bag: Dictionary = {}
var _settings: Dictionary = {}
var _codex_layer: Control
var _codex_view: PanelContainer
var _archetype_id: String = ""
var _roster: Roster
var _party: Dictionary = {}
var _ending: Ending
var _ending_ui: Dictionary = {}
var _transit_layer: Control
var _transit_tex: TextureRect
var _transit_label: Label


func _ready() -> void:
	_resolve_audio()
	UiScale.load_prefs()
	I18n.load_lang("zh")
	var n := db.load_all()
	DivinationData.bind(db)
	DivinationBootstrap.register_all()

	projection = MapProjection.from_config()

	print("[boot] records: %d | cities: %d | routes: %d | methods: %s"
		% [n, db.cities().size(), db.get_table("routes").size(), str(DivinationRegistry.ids())])
	print("[boot] missing i18n keys: %d" % I18n.missing_keys().size())

	# Control.size is still (0,0) during _ready(); absolute positions based on it
	# shove the desk off-screen. Defer until after the full-rect layout pass.
	call_deferred("_finish_boot")


func _finish_boot() -> void:
	_apply_projection()
	_build_desk()


func _apply_projection() -> void:
	# Inset the drawable area. Zayton and Kinsay sit at ~120E, within a degree
	# of the bbox edge, so a flush-to-edge projection clips the corridor's
	# terminus and its labels straight off the screen.
	var w := maxf(size.x, 1280.0)
	var h := maxf(size.y, 720.0)
	projection.set_viewport(w - MARGIN * 2.0, h - 150.0 - MARGIN)
	projection.origin = Vector2(MARGIN, MARGIN)


func _build_desk() -> void:
	# Parchment plate so a blank dark window cannot be mistaken for a hang.
	var bg := TextureRect.new()
	bg.name = "BootBg"
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var parchment := MapArt.desk_parchment()
	if parchment != null:
		bg.texture = parchment
	else:
		# ColorRect fallback if desk art is missing.
		var solid := ColorRect.new()
		solid.name = "BootBg"
		solid.color = Color("2a241c")
		solid.set_anchors_preset(Control.PRESET_FULL_RECT)
		solid.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(solid)
		bg = null
	if bg != null:
		add_child(bg)

	var center := CenterContainer.new()
	center.name = "BootCenter"
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)

	_desk = VBoxContainer.new()
	_desk.alignment = BoxContainer.ALIGNMENT_CENTER
	_desk.custom_minimum_size = Vector2(420, 0)
	_desk.add_theme_constant_override("separation", 8)
	center.add_child(_desk)

	var wheel := MapArt.fate_wheel()
	if wheel != null:
		var wr := TextureRect.new()
		wr.texture = wheel
		wr.custom_minimum_size = Vector2(96, 96)
		wr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		wr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		wr.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		_desk.add_child(wr)

	var title := Label.new()
	title.text = "远行之书\nThe Book of Far Roads"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color("e8c46a"))
	_desk.add_child(title)

	# Seven travellers' books on the desk.
	var books := HBoxContainer.new()
	books.alignment = BoxContainer.ALIGNMENT_CENTER
	books.add_theme_constant_override("separation", 6)
	_desk.add_child(books)
	for bid in MapArt.BOOKS:
		var cover := MapArt.book_cover(bid)
		if cover == null:
			continue
		var tr := TextureRect.new()
		tr.texture = cover
		tr.custom_minimum_size = Vector2(48, 64)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.tooltip_text = bid
		books.add_child(tr)

	var sub := Label.new()
	sub.text = "\n%d 座城 · %d 条路线 · %d 条事件\n%d 种商品 · %d 位随从 · %d 种占法\n" % [
		db.cities().size(), db.get_table("routes").size(), db.get_table("events").size(),
		db.get_table("goods").size(), db.get_table("retainers").size(),
		DivinationRegistry.ids().size()]
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.add_theme_color_override("font_color", Color("cbb896"))
	_desk.add_child(sub)

	if SaveGame.exists("auto") or SaveGame.exists("manual"):
		var slot := "manual" if SaveGame.exists("manual") else "auto"
		var head: Dictionary = SaveGame.read(slot).get("header", {})
		var cont := Panels.styled_button("继续上次的旅程（%s · 第 %d 日）" % [
			_city_name(String(head.get("city", ""))), int(head.get("days", 0))], Callable())
		cont.pressed.connect(func():
			_desk.queue_free()
			_begin_loaded(slot))
		_desk.add_child(cont)

	for a in db.get_table("archetypes"):
		_desk.add_child(_archetype_button(a))


func _archetype_button(a: Dictionary) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	row.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var culture := String(a.get("culture", "latin"))
	var faith := String(a.get("faith", "latin"))
	var c_icon := MapArt.culture_icon(culture)
	if c_icon != null:
		var tr := TextureRect.new()
		tr.texture = c_icon
		tr.custom_minimum_size = Vector2(36, 36)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)
	var f_icon := MapArt.faith_icon(faith)
	if f_icon != null:
		var tr2 := TextureRect.new()
		tr2.texture = f_icon
		tr2.custom_minimum_size = Vector2(28, 28)
		tr2.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr2.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr2)

	var btn := Button.new()
	btn.text = "%s  →  %s" % [I18n.t(a.get("name", "")), _city_name(a.get("start", ""))]
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.pressed.connect(_begin.bind(a))
	row.add_child(btn)
	return row


func _begin(archetype: Dictionary) -> void:
	# Tear down the desk immediately. Animation must NOT await before WorldState
	# exists — smoke tests call _begin and read state on the next frame.
	var center := get_node_or_null("BootCenter")
	var bg := get_node_or_null("BootBg")
	if center:
		# N3 — brief parchment fade while freeing; do not block state init.
		Motion.fade(center, 0.0, 0.25)
		center.queue_free()
	elif _desk != null:
		_desk.queue_free()
	if bg:
		bg.queue_free()
	_desk = null

	clock = WorldClock.new(GameDate.from_gregorian(START_JDN_Y, 4, 11).jdn)
	rng = Rng.new("run:%s:%d" % [archetype.get("id", "x"), clock.date.jdn])
	executor = EffectExecutor.new()
	conditions = ConditionEvaluator.new()
	events = EventMachine.new(db, conditions, executor)
	travel = Travel.new(db, executor)
	_market = Market.new(db)
	_roster = Roster.new(db)
	_ending = Ending.new(db)

	state = WorldState.new()
	_archetype_id = String(archetype.get("id", ""))
	state.seed = rng_seed(archetype)
	state.city = archetype.get("start", "tauris")
	state.jdn = clock.date.jdn
	state.coins = int(archetype.get("startKit", {}).get("coins", START_COINS))
	state.faith = archetype.get("faith", "latin")
	for l in archetype.get("startKit", {}).get("languages", []):
		if String(l) not in state.languages:
			state.languages.append(String(l))
	for it in archetype.get("startKit", {}).get("items", []):
		if String(it) not in state.items:
			state.items.append(String(it))

	_build_map()
	_build_audio_controls()
	if _audio_ready(): _audio.set_jdn(state.jdn)
	if _audio_ready(): _audio.sfx("page")
	# N3 — map plate expands in after the desk clears (non-blocking).
	if _map != null:
		Motion.parchment_expand(_map, 0.40)
	_arrive()


## Resume: build the same machinery a new run does, then restore the world into
## it rather than starting one.
func _begin_loaded(slot: String) -> void:
	clock = WorldClock.new(GameDate.from_gregorian(START_JDN_Y, 4, 11).jdn)
	executor = EffectExecutor.new()
	conditions = ConditionEvaluator.new()
	events = EventMachine.new(db, conditions, executor)
	travel = Travel.new(db, executor)
	_market = Market.new(db)
	_roster = Roster.new(db)
	_ending = Ending.new(db)
	state = WorldState.new()
	rng = Rng.new("resume")
	_build_map()
	if not _load(slot):
		_say("[color=#8a4a3a]读档失败[/color]")


func rng_seed(a: Dictionary) -> String:
	return "fatequest:%s" % a.get("id", "run")


## Mountain spines for the side-elevation relief (GDD §5.3). Read from
## content/world/ rather than worldmap/data/ because the latter is .gdignore'd
## and therefore absent from an exported build.
func _load_ranges() -> Array:
	var f := FileAccess.open("res://content/world/mountains.json", FileAccess.READ)
	if f == null:
		return []
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) != TYPE_DICTIONARY:
		return []
	return ContentDb._normalize(doc).get("ranges", [])


## Layout is entirely anchor- and container-driven. The previous版 positioned
## every widget at a hard pixel offset computed from a 1280x720 assumption, so
## text ran off the edge the moment the window differed or the font grew — that
## was the cause of the overflow, and no amount of nudging numbers fixes it.
func _build_map() -> void:
	_apply_projection()
	_map = preload("res://game/map/world_map.gd").new()
	add_child(_map)
	_map.setup(projection, db.cities(), db.get_table("routes"), _load_ranges())
	_map.city_clicked.connect(_on_city_clicked)

	# --- HUD: the four numbers every decision is made against ---------------
	_hud = preload("res://game/ui/hud.gd").new()
	_hud.set_anchors_preset(Control.PRESET_TOP_WIDE)
	_hud.offset_left = 12
	_hud.offset_right = -12
	_hud.offset_top = 10
	add_child(_hud)
	_hud.build()

	# --- journal: bottom-left, scrolls, never overlaps the panel ------------
	var log_wrap := PanelContainer.new()
	log_wrap.add_theme_stylebox_override("panel", Palette.panel_style())
	log_wrap.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	log_wrap.anchor_right = 0.46
	log_wrap.offset_left = 12
	log_wrap.offset_right = -6
	log_wrap.offset_top = -150
	log_wrap.offset_bottom = -12
	add_child(log_wrap)

	var log_scroll := ScrollContainer.new()
	log_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	log_wrap.add_child(log_scroll)

	_log = RichTextLabel.new()
	_log.bbcode_enabled = true
	_log.fit_content = true
	_log.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_log.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	log_scroll.add_child(_log)

	# --- action panel: bottom-right, scrolls -------------------------------
	var panel_wrap := PanelContainer.new()
	panel_wrap.add_theme_stylebox_override("panel", Palette.panel_style())
	panel_wrap.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	panel_wrap.anchor_left = 0.48
	panel_wrap.offset_left = 6
	panel_wrap.offset_right = -12
	panel_wrap.offset_top = -150
	panel_wrap.offset_bottom = -12
	add_child(panel_wrap)

	var panel_scroll := ScrollContainer.new()
	panel_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel_wrap.add_child(panel_scroll)

	_panel = VBoxContainer.new()
	_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_panel.add_theme_constant_override("separation", 5)
	panel_scroll.add_child(_panel)

	# --- city interior ------------------------------------------------------
	_city_view = preload("res://game/screens/city_view.gd").new()
	_city_view.visible = false
	_city_view.setup(db)
	add_child(_city_view)
	_city_view.site_chosen.connect(_on_site_chosen)
	_city_view.leave_requested.connect(_close_city)
	_city_view.market_requested.connect(_open_market)
	_city_view.bag_requested.connect(_open_bag)
	_city_view.party_requested.connect(_open_party)

	# --- event dialogue -----------------------------------------------------
	# A full-rect CenterContainer keeps the dialog centred at any window size and
	# any font size, and its scrim stops clicks reaching the map underneath.
	_dialog_layer = Control.new()
	_dialog_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_dialog_layer.visible = false
	add_child(_dialog_layer)

	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Color(0.06, 0.05, 0.03, 0.45)
	_dialog_layer.add_child(scrim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_dialog_layer.add_child(centre)

	_dialog = preload("res://game/ui/event_dialog.gd").new()
	centre.add_child(_dialog)
	_dialog.choice_taken.connect(_on_dialog_choice)
	_dialog.dismissed.connect(func():
		_dialog_layer.visible = false
		if _city_view.visible:
			_sync_city_status()
		else:
			_open_city())

	# --- market -------------------------------------------------------------
	_market_layer = Control.new()
	_market_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_market_layer.visible = false
	add_child(_market_layer)

	var mscrim := ColorRect.new()
	mscrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	mscrim.color = Color(0.06, 0.05, 0.03, 0.5)
	_market_layer.add_child(mscrim)

	var mcentre := CenterContainer.new()
	mcentre.set_anchors_preset(Control.PRESET_FULL_RECT)
	mcentre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_market_layer.add_child(mcentre)

	_market_view = preload("res://game/screens/market_view.gd").new()
	_market_view.setup(db, _market)
	mcentre.add_child(_market_view)
	_market_view.closed.connect(func():
		_market_layer.visible = false
		_open_city())
	_market_view.traded.connect(_on_traded)

	# --- codex ---------------------------------------------------------------
	_codex_layer = Control.new()
	_codex_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_codex_layer.visible = false
	add_child(_codex_layer)
	var cscrim := ColorRect.new()
	cscrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	cscrim.color = Color(0.06, 0.05, 0.03, 0.5)
	_codex_layer.add_child(cscrim)
	var ccentre := CenterContainer.new()
	ccentre.set_anchors_preset(Control.PRESET_FULL_RECT)
	ccentre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_codex_layer.add_child(ccentre)
	_codex_view = preload("res://game/screens/codex_view.gd").new()
	_codex_view.setup(db)
	ccentre.add_child(_codex_view)
	_codex_view.closed.connect(func(): _codex_layer.visible = false)

	_build_party()
	_build_ending()
	_build_bag()
	_build_settings()
	_build_controls()
	_build_transit()
	_restyle_all()


## Brief transit plate shown while the caravan / ship moves between cities.
func _build_transit() -> void:
	_transit_layer = Control.new()
	_transit_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_transit_layer.visible = false
	_transit_layer.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_transit_layer)

	_transit_tex = TextureRect.new()
	_transit_tex.set_anchors_preset(Control.PRESET_FULL_RECT)
	_transit_tex.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_transit_tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_transit_tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_transit_layer.add_child(_transit_tex)

	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Color(0.06, 0.05, 0.03, 0.35)
	scrim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_transit_layer.add_child(scrim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_transit_layer.add_child(centre)

	var plate := PanelContainer.new()
	plate.add_theme_stylebox_override("panel", Palette.panel_style())
	centre.add_child(plate)
	_transit_label = Label.new()
	_transit_label.add_theme_font_size_override("font_size", UiScale.title())
	_transit_label.add_theme_color_override("font_color", Palette.ink())
	_transit_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	plate.add_child(_transit_label)


func _show_transit(route: Dictionary, mode: String, dest: String, days: int) -> void:
	if _transit_layer == null:
		return
	var here := db.get_record(state.city)
	var t_rec := db.get_record(mode)
	var kinds: Array = t_rec.get("kinds", ["land"])
	var mode_kind := String(kinds[0]) if not kinds.is_empty() else "land"
	var art := MapArt.transit_scene({
		"kind": String(route.get("kind", mode_kind)),
		"mode_kind": mode_kind,
		"mode": mode,
		"band": String(here.get("band", "")),
		"culture": String(here.get("culture", "")),
	})
	_transit_tex.texture = art
	_transit_label.text = "启程 → %s\n%d 日 · %s" % [
		_city_name(dest), days, I18n.t("transport.%s.name" % mode)]
	_transit_layer.visible = true
	# Brief beat so the plate is seen; the next event / arrival clears it.
	get_tree().create_timer(0.85).timeout.connect(func():
		if is_instance_valid(_transit_layer):
			_transit_layer.visible = false)


## Reader controls. Text size and contrast are not preferences to bury in a
## menu on a game made of prose — they decide whether it can be read at all.
func _build_controls() -> void:
	var bar := HBoxContainer.new()
	bar.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	bar.offset_left = -430
	bar.offset_right = -12
	bar.offset_top = 58
	bar.alignment = BoxContainer.ALIGNMENT_END
	bar.add_theme_constant_override("separation", 6)
	add_child(bar)

	bar.add_child(_ctl("行囊", _open_bag))
	bar.add_child(_ctl("图鉴", _open_codex))
	bar.add_child(_ctl("同行", _open_party))
	bar.add_child(_ctl("停笔", _open_ending))
	bar.add_child(_ctl("设置", func(): Motion.crossfade_in(_settings["layer"], 0.18)))
	bar.add_child(_ctl("归位", func(): _map.center_on(state.city)))
	bar.add_child(_ctl("放大", func(): _map.set_zoom(_map.zoom * 1.35, _map_centre())))
	bar.add_child(_ctl("缩小", func(): _map.set_zoom(_map.zoom / 1.35, _map_centre())))
	_controls = bar


func _map_centre() -> Vector2:
	return projection.origin + Vector2(projection.width, projection.height) * 0.5


func _ctl(text: String, cb: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", UiScale.ui())
	b.add_theme_stylebox_override("normal", Palette.button_style())
	b.add_theme_stylebox_override("hover", Palette.button_style(true))
	b.add_theme_color_override("font_color", Palette.ink())
	b.pressed.connect(cb)
	return b


func _refresh_controls() -> void:
	if _controls == null:
		return
	var kids := _controls.get_children()
	for k in kids:
		k.add_theme_font_size_override("font_size", UiScale.ui())
		k.add_theme_stylebox_override("normal", Palette.button_style())
		k.add_theme_color_override("font_color", Palette.ink())


func _refresh_hud() -> void:
	var used := 0
	for n in state.goods.values():
		used += int(n)
	var here := db.get_record(state.city)
	var currency := String(here.get("market", {}).get("currency", "")) if here.has("market") else ""
	_hud.refresh(state, clock, _city_name(state.city), used,
		String(here.get("culture", "latin")), currency)
	_map.set_current(state.city, state.revealed)


func _say(line: String) -> void:
	_log.text += line + "\n"
	_log.scroll_to_line(_log.get_line_count())


## Arrival: fire the entry event if there is one, else offer the roads.
func _arrive() -> void:
	_refresh_hud()
	if _audio_ready(): _audio.set_jdn(state.jdn)
	var city := db.get_record(state.city)
	var ctx := _ctx()
	# Prefer a dedicated entry plate when one exists.
	var entry_art := MapArt.city_entry(String(city.get("id", "")))
	if entry_art != null and _transit_layer != null and not _transit_layer.visible:
		_transit_tex.texture = entry_art
		_transit_label.text = I18n.t(city.get("name", ""))
		_transit_layer.visible = true
		get_tree().create_timer(0.7).timeout.connect(func():
			if is_instance_valid(_transit_layer):
				_transit_layer.visible = false)
	var ev := events.pick("entry", state, rng, ctx)
	if _audio_ready(): _audio.set_place(city, ev if not ev.is_empty() else {})
	if ev.is_empty():
		_show_roads()
	else:
		_show_event(ev)


func _ctx() -> Dictionary:
	var c := db.get_record(state.city)
	return {
		"jdn": state.jdn, "month": clock.month(), "year": clock.year(),
		"band": c.get("band", ""),
	}


func _clear_panel() -> void:
	for ch in _panel.get_children():
		ch.queue_free()


func _on_site_chosen(event_id: String) -> void:
	var ev := db.get_record(event_id)
	if not ev.is_empty():
		_show_event(ev)


func _on_dialog_choice(index: int) -> void:
	_dialog_layer.visible = false
	if not _current_event.is_empty():
		_on_choice(_current_event, index)


## Applies a market order. The screen produces effects; the executor applies
## them; the HUD reflects them. No shortcut, or the audit trail breaks.
## What you are carrying, and what it is worth here. The player had no way to
## see the hold at all outside the market screen.
func _build_bag() -> void:
	_bag = Panels.overlay(self, Vector2(560, 420))
	var box: VBoxContainer = _bag["box"]
	var title := Panels.label("行囊", UiScale.title(), Palette.ink())
	box.add_child(title)
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	box.add_child(scroll)
	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 4)
	scroll.add_child(list)
	_bag["list"] = list
	var bag_row := HBoxContainer.new()
	bag_row.add_theme_constant_override("separation", 8)
	bag_row.add_child(Panels.styled_button("图鉴", func():
		_bag["layer"].visible = false
		_open_codex()))
	var close_btn := Panels.styled_button("合上", func(): _bag["layer"].visible = false)
	close_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bag_row.add_child(close_btn)
	box.add_child(bag_row)


## Closing the book (GDD §14). Two screens in one overlay: first what stopping
## here would mean, then — only after the player says so — the epilogue itself.
##
## The confirmation is not ceremony. Ending is the one irreversible thing a
## player can do from the map, and the panel that offers it also states which
## ending they would get, so the choice is made with the outcome visible rather
## than as a gamble on a button labelled "停笔".
func _build_ending() -> void:
	_ending_ui = Panels.overlay(self, Vector2(660, 480))
	var box: VBoxContainer = _ending_ui["box"]
	var title := Panels.label("停笔", UiScale.title(), Palette.ink())
	box.add_child(title)
	_ending_ui["title"] = title

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	box.add_child(scroll)
	var body := RichTextLabel.new()
	body.bbcode_enabled = true
	body.fit_content = true
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_font_size_override("normal_font_size", UiScale.body())
	scroll.add_child(body)
	_ending_ui["body"] = body

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	box.add_child(row)
	var confirm := Panels.styled_button("就此停笔", _confirm_ending)
	row.add_child(confirm)
	_ending_ui["confirm"] = confirm
	row.add_child(Panels.styled_button("再走一程", func(): _ending_ui["layer"].visible = false))


func _open_ending() -> void:
	var e := _ending.best(state)
	var body: RichTextLabel = _ending_ui["body"]
	_ending_ui["title"].text = "停笔"
	_ending_ui["confirm"].visible = true

	var years := maxi(1, int(state.days_elapsed / 365.0))
	var lines := "[color=#6a5a48]若在此地合上这本书：[/color]\n\n"
	lines += "　行过 %d 座城，历 %d 年，日 %d\n" % [state.visited.size(), years, state.days_elapsed]
	lines += "　起于 %s，止于 %s\n" % [
		_city_name(state.start_city) if not state.start_city.is_empty() else "尚未启程",
		_city_name(state.city)]
	lines += "　囊中 %d 钱，同行 %d 人，图鉴 %d 条\n" % [
		state.coins / Market.FEN, state.retainers.size(), state.codex.size()]
	lines += "\n[color=#6a5a48]这本书会被称作：[/color]\n\n"
	lines += "　[b]%s[/b]\n" % I18n.t(String(e.get("name", "")))

	# Endings the run does not yet reach, so the player can see what stopping
	# now would cost them. Naming the unreached ones is the whole reason a
	# player would choose to keep going.
	var have := {}
	for q in _ending.qualifying(state):
		have[String(q.get("id", ""))] = true
	var missed: Array = []
	for cand in db.get_table("endings"):
		if not have.has(String(cand.get("id", ""))):
			missed.append(I18n.t(String(cand.get("name", ""))))
	if not missed.is_empty():
		lines += "\n[color=#8a7a68]走下去还可能成为：%s[/color]\n" % ", ".join(missed)

	body.text = lines
	# Preview the sticker art the ending would award.
	var preview := MapArt.sticker_icon(String(e.get("sticker", "")))
	if _ending_ui.has("sticker_preview"):
		var old: Node = _ending_ui["sticker_preview"]
		if is_instance_valid(old):
			old.queue_free()
	if preview != null:
		var tr := TextureRect.new()
		tr.texture = preview
		tr.custom_minimum_size = Vector2(64, 64)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		(_ending_ui["box"] as VBoxContainer).add_child(tr)
		_ending_ui["sticker_preview"] = tr
	_ending_ui["layer"].visible = true


func _confirm_ending() -> void:
	var e := _ending.best(state)
	_ending_ui["title"].text = I18n.t(String(e.get("name", "")))
	_ending_ui["confirm"].visible = false
	var text := _ending.epilogue(state, e, clock)
	_ending_ui["body"].text = "%s\n\n[color=#6a5a48]——%s[/color]" % [
		text, I18n.t(String(e.get("name", "")))]

	# The sticker is earned by reaching the ending, so it is recorded like any
	# other change to the world: through the executor, with a reason.
	var sid := String(e.get("sticker", ""))
	if not sid.is_empty():
		executor.execute(state, [{"op": "sticker", "value": sid,
			"reason": "ending-%s" % e.get("id", "")}], {"rng": rng, "event_id": "ending"})
		var sticker_art := MapArt.sticker_icon(sid)
		if sticker_art != null:
			var tr := TextureRect.new()
			tr.texture = sticker_art
			tr.custom_minimum_size = Vector2(72, 72)
			tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tr.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
			(_ending_ui["box"] as VBoxContainer).add_child(tr)
	_say("[color=#4a6a4a]· 停笔：%s[/color]" % I18n.t(String(e.get("name", ""))))
	_refresh_hud()


## The party: who travels with you, what they carry, and what leaving costs.
func _build_party() -> void:
	_party = Panels.overlay(self, Vector2(640, 460))
	var box: VBoxContainer = _party["box"]
	box.add_child(Panels.label("同行", UiScale.title(), Palette.ink()))
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	box.add_child(scroll)
	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 5)
	scroll.add_child(list)
	_party["list"] = list
	box.add_child(Panels.styled_button("合上", func(): _party["layer"].visible = false))


func _open_party() -> void:
	var list: VBoxContainer = _party["list"]
	for c in list.get_children():
		c.queue_free()

	# What the hold is on each kind of road, so the player can see the shape of
	# the party rather than one number.
	list.add_child(Panels.label("货格　陆路 %d　海路 %d" % [
		_roster.effective_slots(state, "land"), _roster.effective_slots(state, "sea")],
		UiScale.ui(), Palette.ink_soft()))

	if state.retainers.is_empty():
		list.add_child(Panels.label("你独自上路。", UiScale.body(), Palette.ink_soft()))
	for m in state.retainers:
		list.add_child(_party_row(m))

	# Hiring pool, if this place has one.
	var pool := _roster.candidates(state, state.city, "open")
	if not pool.is_empty():
		list.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
		list.add_child(Panels.label("此地可雇：", UiScale.ui(), Palette.ink()))
		for r in pool:
			list.add_child(_hire_row(r))
	_party["layer"].visible = true
	Motion.crossfade_in(_party["layer"], 0.18)


func _party_row(m: Dictionary) -> Control:
	var rid := String(m.get("id", ""))
	var rec := db.get_record(rid)
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", Palette.panel_style(true))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)

	var here := db.get_record(state.city)
	var culture := String(here.get("culture", "latin"))
	var portrait := MapArt.retainer_portrait(rid, culture)
	if portrait != null:
		var tr := TextureRect.new()
		tr.texture = portrait
		tr.custom_minimum_size = Vector2(48, 60)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)

	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(col)
	col.add_child(Panels.label(I18n.t(rec.get("name", rid)), UiScale.ui(), Palette.ink()))

	var cargo: Dictionary = rec.get("cargo", {})
	var carries := "—"
	if not cargo.is_empty():
		carries = "%s +%d 格" % [
			I18n.fmt("cargo.%s" % cargo.get("condition", "always")), int(cargo.get("slots", 0))]
	col.add_child(Panels.label("月俸 %d 银　%s　情谊 %d/31　%s" % [
		int(rec.get("wage", {}).get("amount", 0)) / Market.FEN,
		carries, int(m.get("mood", 16)), I18n.fmt(_roster.birth_known(state, rid))],
		UiScale.ui() - 3, Palette.ink_soft()))

	# Dismissal must state the cost before it happens (GDD §11.7).
	var of := _roster.overflow_if_leaving(state, _market, rid, "land")
	var btn := Panels.styled_button("辞退", Callable())
	btn.pressed.connect(func():
		var over := int(of["over"])
		if over > 0:
			_say("[color=#8a4a3a]· 辞退 %s：%d 件货物无处可放，须先处置[/color]"
				% [I18n.t(rec.get("name", rid)), over])
			return
		var res := executor.execute(state, _roster.dismiss_effects(rid),
			{"rng": rng, "event_id": "dismiss"})
		for line in res.log_lines:
			_say("  · %s" % line)
		_refresh_hud()
		_open_party())
	if int(of["over"]) > 0:
		btn.tooltip_text = "会有 %d 件货物无处可放" % int(of["over"])
	row.add_child(btn)
	return panel


func _hire_row(rec: Dictionary) -> Control:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", Palette.panel_style(true))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)

	var here := db.get_record(state.city)
	var culture := String(here.get("culture", "latin"))
	var portrait := MapArt.retainer_portrait(String(rec.get("id", "")), culture)
	if portrait != null:
		var tr := TextureRect.new()
		tr.texture = portrait
		tr.custom_minimum_size = Vector2(48, 60)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)

	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(col)
	col.add_child(Panels.label(I18n.t(rec.get("name", "")), UiScale.ui(), Palette.ink()))
	var cargo: Dictionary = rec.get("cargo", {})
	var note := "月俸 %d 银" % (int(rec.get("wage", {}).get("amount", 0)) / Market.FEN)
	if not cargo.is_empty():
		note += "　%s +%d 格" % [
			I18n.fmt("cargo.%s" % cargo.get("condition", "always")), int(cargo.get("slots", 0))]
	col.add_child(Panels.label(note, UiScale.ui() - 3, Palette.ink_soft()))

	var btn := Panels.styled_button("雇", Callable())
	btn.pressed.connect(func():
		var res := executor.execute(state, _roster.hire_effects(rec),
			{"rng": rng, "event_id": "hire"})
		for line in res.log_lines:
			_say("  · %s" % line)
		_refresh_hud()
		_open_party())
	row.add_child(btn)
	return panel


func _open_codex() -> void:
	Motion.crossfade_in(_codex_layer, 0.18)
	_codex_view.open(state)


func _open_bag() -> void:
	var list: VBoxContainer = _bag["list"]
	for c in list.get_children():
		c.queue_free()

	var here := db.get_record(state.city)
	var rows := 0
	for gid in state.goods:
		var g := db.get_record(String(gid))
		if g.is_empty():
			continue
		var n := int(state.goods[gid])
		var worth := _market.sell_price(g, here, state.jdn, state.seed) if here.has("market") else 0
		var line := "%s ×%d　占 %d 格" % [I18n.t(g.get("name", "")), n, int(g.get("bulk", 1)) * n]
		if worth > 0:
			line += "　此地可售 %d 银" % (worth / Market.FEN)
		list.add_child(_icon_line(MapArt.goods_icon(String(gid)), line))
		rows += 1

	for it in state.items:
		list.add_child(_icon_line(MapArt.item_icon(String(it)),
			"· " + I18n.fmt("item.%s" % it)))
		rows += 1

	if rows == 0:
		list.add_child(Panels.label("（空手上路）", UiScale.ui(), Palette.ink_soft()))

	list.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
	list.add_child(Panels.label("货格 %d/%d　囊中 %d 银" % [
		_market.cargo_used(state), state.cargo_slots, state.coins / Market.FEN],
		UiScale.ui(), Palette.ink_soft()))
	# Learned arts and the codex belong here too — they are what the journey
	# actually accumulates.
	if not state.learned_divinations.is_empty():
		var arts: Array[String] = []
		for d in state.learned_divinations:
			arts.append(I18n.t("div.%s.name" % d))
		list.add_child(Panels.label("所习占法：" + "、".join(PackedStringArray(arts)),
			UiScale.ui(), Palette.ink_soft()))
	list.add_child(Panels.label("图鉴 %d 条　贴纸 %d 枚" % [state.codex.size(), state.stickers.size()],
		UiScale.ui(), Palette.ink_soft()))
	_bag["layer"].visible = true
	Motion.crossfade_in(_bag["layer"], 0.18)


func _icon_line(icon: Texture2D, text: String) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	if icon != null:
		var tr := TextureRect.new()
		tr.texture = icon
		tr.custom_minimum_size = Vector2(28, 28)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)
	row.add_child(Panels.label(text, UiScale.ui(), Palette.ink()))
	return row


## Reader settings, reachable from anywhere including the city interior.
func _build_settings() -> void:
	_settings = Panels.overlay(self, Vector2(440, 360))
	var box: VBoxContainer = _settings["box"]
	box.add_child(Panels.label("设置", UiScale.title(), Palette.ink()))

	var size_btn := Panels.styled_button("字号：" + UiScale.label(), Callable())
	size_btn.pressed.connect(func():
		UiScale.cycle()
		size_btn.text = "字号：" + UiScale.label()
		_restyle_all())
	box.add_child(size_btn)

	var hc := Panels.styled_button("高对比：" + ("开" if UiScale.high_contrast else "关"), Callable())
	hc.pressed.connect(func():
		UiScale.high_contrast = not UiScale.high_contrast
		UiScale.save()
		hc.text = "高对比：" + ("开" if UiScale.high_contrast else "关")
		_restyle_all())
	box.add_child(hc)

	var mute := Panels.styled_button("声音", Callable())
	mute.pressed.connect(func():
		if _audio_ready():
			_audio.toggle_mute()
			mute.text = "声音：" + ("静" if _audio.muted else "开"))
	box.add_child(mute)

	var motion := Panels.styled_button("减少动效：" + ("开" if Motion.reduce_motion else "关"), Callable())
	motion.pressed.connect(func():
		Motion.reduce_motion = not Motion.reduce_motion
		motion.text = "减少动效：" + ("开" if Motion.reduce_motion else "关"))
	box.add_child(motion)

	box.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
	box.add_child(Panels.label("", UiScale.ui(), Palette.ink()))

	var save_btn := Panels.styled_button("存档", Callable())
	save_btn.pressed.connect(func():
		var okd := _save("manual")
		save_btn.text = "存档 ✓" if okd else "存档失败")
	box.add_child(save_btn)

	var load_btn := Panels.styled_button("读档", Callable())
	load_btn.pressed.connect(func():
		if _load("manual"):
			_settings["layer"].visible = false
		else:
			load_btn.text = "无存档")
	box.add_child(load_btn)

	box.add_child(Panels.styled_button("合上", func(): _settings["layer"].visible = false))


func _on_traded() -> void:
	var effects: Array = _market_view.take_pending()
	if effects.is_empty():
		return
	var res := executor.execute(state, effects, {"rng": rng, "event_id": "market:" + state.city})
	for line in res.log_lines:
		_say("  · %s" % line)
	if _audio_ready(): _audio.sfx("coin")
	_refresh_hud()
	_sync_city_status()
	_market_view.refresh()


func _open_market() -> void:
	var c := db.get_record(state.city)
	if c.is_empty() or not c.has("market"):
		return
	_market_layer.visible = true
	Motion.crossfade_in(_market_layer, 0.18)
	_market_view.open(c, state, state.jdn)


func _open_city() -> void:
	var c := db.get_record(state.city)
	if c.is_empty() or (c.get("sites", []) as Array).is_empty():
		_show_roads()
		return
	_city_view.visible = true
	_city_view.show_city(c, state, conditions, _ctx())
	_sync_city_status()


## Autosave on arrival. GDD's journeys run to four hundred days; losing one to
## a crash is the kind of thing a player does not come back from.
func _autosave() -> void:
	_save("auto")


func _save(slot: String) -> bool:
	# Wall-clock time comes from the presentation layer; the kernel never reads it.
	return SaveGame.write(slot, state, clock, {"archetype": _archetype_id},
		Time.get_datetime_string_from_system(true))


func _load(slot: String) -> bool:
	var doc := SaveGame.read(slot)
	if doc.is_empty():
		return false
	var back := SaveGame.deserialize(doc)
	state = back["state"]
	clock = back["clock"]
	_archetype_id = String((back["extra"] as Dictionary).get("archetype", _archetype_id))
	# The RNG is reseeded from the saved seed, so a loaded world continues
	# deterministically rather than diverging from the run that produced it.
	rng = Rng.new(state.seed)
	_say("[color=#4a6a4a]—— 读档：%s，第 %d 日 ——[/color]" % [_city_name(state.city), state.days_elapsed])
	_refresh_hud()
	_map.center_on(state.city)
	_dialog_layer.visible = false
	_market_layer.visible = false
	_codex_layer.visible = false
	_bag["layer"].visible = false
	_open_city()
	return true


func _sync_city_status() -> void:
	if _city_view == null or not _city_view.has_method("set_status"):
		return
	var c := db.get_record(state.city)
	var g := clock.date.civil(String(c.get("culture", "latin")))
	_city_view.set_status(state.coins / Market.FEN, _market.cargo_used(state),
		state.cargo_slots, state.days_elapsed,
		"%d年%d月%d日" % [g["year"], g["month"], g["day"]])


func _close_city() -> void:
	_city_view.visible = false
	_show_roads()


func _restyle_all() -> void:
	if _log:
		_log.add_theme_font_size_override("normal_font_size", UiScale.body())
		_log.add_theme_color_override("default_color", Palette.ink())
	if _hud and _hud.has_method("restyle"):
		_hud.restyle()
	if _dialog and _dialog.has_method("restyle"):
		_dialog.restyle()
	if _city_view and _city_view.has_method("restyle"):
		_city_view.restyle()
	if _market_view and _market_view.has_method("restyle"):
		_market_view.restyle()
	if _codex_view and _codex_view.has_method("restyle"):
		_codex_view.restyle()
	if _map:
		_map.queue_redraw()
	_refresh_controls()


func _show_event(ev: Dictionary) -> void:
	_current_event = ev
	var states := events.choice_states(ev, state, _ctx())
	var art: Texture2D = null
	var c := db.get_record(state.city)
	var culture := String(c.get("culture", "latin")) if not c.is_empty() else "latin"
	# Mentor / method portraits take priority over generic venue plates.
	var eid := String(ev.get("id", "")).to_lower()
	for method in MapArt.MENTOR_METHOD:
		if eid.contains("mentor") and eid.contains(method):
			art = MapArt.mentor_portrait(method)
			break
	if art == null and not c.is_empty():
		art = _city_view._portrait_for(ev, culture)
	_dialog_layer.visible = true
	_dialog.show_event(ev, states, art)
	# N3 — panel expands in place (rise fights CenterContainer layout).
	Motion.parchment_expand(_dialog, 0.25)
	if _dialog.has_method("animate_choices"):
		_dialog.animate_choices()
	if _audio_ready(): _audio.sfx("page")


## GDD §19: the player must always be able to tell source from invention.
func _origin_tag(rec: Dictionary) -> String:
	match rec.get("lore", {}).get("origin", ""):
		"source":  return "[color=#7a6a4a](据《马可·波罗游记》)[/color]"
		"hybrid":  return "[color=#7a6a4a](据原文演绎)[/color]"
		"authored": return "[color=#7a6a4a](据原文语体新撰)[/color]"
	return ""


func _on_choice(ev: Dictionary, index: int) -> void:
	var coins_before := state.coins
	var res := events.choose(ev, index, state, rng, _ctx())
	if _audio_ready(): _audio.on_effect_result(res, {}, db.get_record(state.city), coins_before)
	for line in res.log_lines:
		_say("  · %s" % line)
	if not res.reading.is_empty():
		_say("")
		var sym := DivinationResultView.symbol_texture(res.reading)
		if sym != null and _dialog != null:
			# Surface the cast symbol briefly in the journal header line.
			_say("[color=#6a5a48]〔%s〕[/color]" % String(res.reading.get("method", "")))
		_say(DivinationResultView.as_richtext(res.reading))
	if not res.rejected.is_empty():
		_say("  [color=#8a4a3a]· %d 项未能达成[/color]" % res.rejected.size())
	_refresh_hud()
	if _city_view.visible:
		_city_view.show_city(db.get_record(state.city), state, conditions, _ctx())
		_sync_city_status()
	else:
		_open_city()


func _show_roads() -> void:
	_clear_panel()
	var here := db.get_record(state.city)

	# A city's own contents come first. GDD §5.2: you must do at least one thing
	# in a place before you know how to leave it — so the sites cannot be buried
	# under the road list.
	var here_sites: Array = here.get("sites", []).duplicate()
	if here.has("mentorEvent"):
		here_sites.append(here["mentorEvent"])
	for sid in here_sites:
		var sev := db.get_record(String(sid))
		if sev.is_empty():
			continue
		if sev.get("once", false) and state.once_fired.get(sev["id"], false):
			continue
		if not conditions.evaluate(sev.get("when", {}), state, _ctx()):
			continue
		var sbtn := Button.new()
		sbtn.text = "◆ %s" % I18n.t(sev.get("title", ""))
		sbtn.pressed.connect(_show_event.bind(sev))
		_panel.add_child(sbtn)

	var here_rec := db.get_record(state.city)
	if here_rec.has("market"):
		var mbtn := Button.new()
		mbtn.text = "◈ 市集"
		mbtn.add_theme_font_size_override("font_size", UiScale.ui())
		mbtn.add_theme_stylebox_override("normal", Palette.button_style())
		mbtn.add_theme_stylebox_override("hover", Palette.button_style(true))
		mbtn.add_theme_color_override("font_color", Palette.ink())
		mbtn.pressed.connect(_open_market)
		_panel.add_child(mbtn)

	var lbl := Label.new()
	lbl.text = "%s 的去路：" % _city_name(state.city)
	_panel.add_child(lbl)

	var any := false
	for r in travel.routes_from(state.city):
		var dest := travel.other_end(r, state.city)
		for mode in r.get("modes", []):
			var av := travel.availability(r, state, clock.month(), String(mode))
			var btn := Button.new()
			btn.text = "%s ← %s · %d日 · %d钱" % [
				_city_name(dest), I18n.t("transport.%s.name" % mode),
				travel.total_days(r, String(mode)), travel.total_cost(r, String(mode)) / 100]
			btn.disabled = not av["ok"]
			if not av["ok"]:
				var rr: Array[String] = []
				for reason in av["reasons"]:
					rr.append(I18n.fmt(String(reason)))
				btn.tooltip_text = ", ".join(PackedStringArray(rr))
			btn.pressed.connect(_on_depart.bind(r, String(mode)))
			_panel.add_child(btn)
			any = true
			break   # one mode per destination keeps the P1 panel readable
	if not any:
		var none := Label.new()
		none.text = "（无路可走）"
		_panel.add_child(none)


func _on_depart(route: Dictionary, mode: String) -> void:
	if _audio_ready(): _audio.on_depart(route)
	# The hold on THIS road decides whether the cargo travels. A porter's mules
	# do not help at sea, so the party's contribution is computed per leg.
	var t_rec := db.get_record(mode)
	var kinds: Array = t_rec.get("kinds", ["land"])
	var mode_kind := String(kinds[0]) if not kinds.is_empty() else "land"

	# Capture origin before depart moves WorldState (goto + reveal_map).
	var origin_id := String(state.city)
	var trip := travel.depart(route, mode, state, rng)
	_show_transit(route, mode, String(trip["destination"]), int(trip["days"]))

	# N2 M2 — stroke the road as a fire-and-forget visual. Must not await:
	# ANIMATION_PLAN §4 — animation must not gate game logic (or smoke tests).
	_map.animate_route(origin_id, String(trip["destination"]), int(trip["days"]),
		String(route.get("kind", mode_kind)), bool(route.get("trunk", false)))

	# Wages fall due on the road (GDD §11). Unpaid means goodwill, not debt.
	var wage_fx := _roster.pay_effects(state, int(trip["days"]))
	if not wage_fx.is_empty():
		var wr := executor.execute(state, wage_fx, {"rng": rng, "event_id": "wages"})
		for line in wr.log_lines:
			_say("  · %s" % line)

	# Spoilage and theft resolve per leg — GDD §9.2's brake is fares AND losses.
	var losses := _market.travel_losses(state, route, int(trip["days"]), rng.fork("cargo"))
	if not losses.is_empty():
		var lr := executor.execute(state, losses, {"rng": rng, "event_id": "cargo-loss"})
		for line in lr.log_lines:
			_say("  [color=#8a4a3a]· %s[/color]" % line)
	clock = WorldClock.new(state.jdn)
	if _audio_ready(): _audio.set_jdn(state.jdn)
	_say("[color=#4a6a4a]启程 → %s（%d 日，%d 钱）[/color]" % [
		_city_name(trip["destination"]), trip["days"], trip["cost"] / 100])

	# Road encounters fire on arrival, before the destination's entry event.
	var enc := events.pick("road", state, rng, _ctx())
	if not enc.is_empty():
		_show_event(enc)
		_refresh_hud()
		return
	_arrive()


## Cargo that no longer fits has to go somewhere. It is sold at a loss rather
## than vanishing — the player should feel the cost, not merely be told of it.
func _shed_overflow(units: int) -> void:
	var here := db.get_record(state.city)
	var left := units
	for gid in state.goods.keys():
		if left <= 0:
			break
		var g := db.get_record(String(gid))
		if g.is_empty():
			continue
		var bulk := maxi(1, int(g.get("bulk", 1)))
		while left > 0 and int(state.goods.get(gid, 0)) > 0:
			var price := 0
			if here.has("market"):
				price = int(_market.sell_price(g, here, state.jdn, state.seed) * 0.5)
			executor.execute(state, [
				{"op": "goods", "id": String(gid), "value": -1, "reason": "shed-no-room"},
				{"op": "coins", "value": price, "reason": "shed-no-room"},
			], {"rng": rng, "event_id": "shed"})
			left -= bulk
	_refresh_hud()


func _on_city_clicked(c: Dictionary) -> void:
	if state == null:
		return
	var known: int = state.revealed.get(c.get("id", ""), 0)
	if c.get("id") == state.city:
		_say("你在 %s。" % _city_name(c.get("id", "")))
	elif known > 0:
		_say("%s — 你听说过（情报 %d/3）" % [_city_name(c.get("id", "")), known])
	else:
		_say("[color=#6a6a6a]那里你还一无所知。[/color]")


func _city_name(cid: String) -> String:
	var c := db.get_record(cid)
	return I18n.t(c.get("name", cid)) if not c.is_empty() else cid


func _build_audio_controls() -> void:
	# A1: mute must be reachable before any sustained drone settles in.
	var btn := Button.new()
	btn.name = "MuteBtn"
	btn.text = "静音"
	btn.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	btn.offset_left = -96
	btn.offset_right = -12
	btn.offset_top = 10
	btn.pressed.connect(_on_mute_pressed)
	add_child(btn)
	if _audio_ready():
		_audio.mute_changed.connect(_on_mute_changed)
		_on_mute_changed(_audio.muted)


func _on_mute_pressed() -> void:
	if _audio_ready(): _audio.toggle_mute()


func _on_mute_changed(is_muted: bool) -> void:
	var btn := get_node_or_null("MuteBtn") as Button
	if btn:
		btn.text = "取消静音" if is_muted else "静音"
