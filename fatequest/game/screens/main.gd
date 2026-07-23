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
	var bg := ColorRect.new()
	bg.name = "BootBg"
	bg.color = Color("2a241c")
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var center := CenterContainer.new()
	center.name = "BootCenter"
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)

	_desk = VBoxContainer.new()
	_desk.alignment = BoxContainer.ALIGNMENT_CENTER
	_desk.custom_minimum_size = Vector2(360, 0)
	center.add_child(_desk)

	var title := Label.new()
	title.text = "远行之书\nThe Book of Far Roads"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color("e8c46a"))
	_desk.add_child(title)

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
		var btn := Button.new()
		btn.text = "%s  →  %s" % [I18n.t(a.get("name", "")), _city_name(a.get("start", ""))]
		btn.pressed.connect(_begin.bind(a))
		_desk.add_child(btn)


func _begin(archetype: Dictionary) -> void:
	var center := get_node_or_null("BootCenter")
	if center:
		center.queue_free()
	var bg := get_node_or_null("BootBg")
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

	_build_bag()
	_build_settings()
	_build_controls()
	_restyle_all()


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
	bar.add_child(_ctl("设置", func(): _settings["layer"].visible = true))
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
	_hud.refresh(state, clock, _city_name(state.city), used)
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


func _open_codex() -> void:
	_codex_layer.visible = true
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
		list.add_child(Panels.label(line, UiScale.ui(), Palette.ink()))
		rows += 1

	for it in state.items:
		list.add_child(Panels.label("· " + I18n.fmt("item.%s" % it), UiScale.ui(), Palette.ink()))
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
	return SaveGame.write(slot, state, clock, {"archetype": _archetype_id})


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
	var g := clock.date.to_gregorian()
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
	if not c.is_empty():
		art = _city_view._portrait_for(ev, String(c.get("culture", "")))
	_dialog_layer.visible = true
	_dialog.show_event(ev, states, art)
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
	var trip := travel.depart(route, mode, state, rng)
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
