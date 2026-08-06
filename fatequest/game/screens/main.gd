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
var _controls: HFlowContainer
## The right spine: the bag and party buttons, kept apart from the top bar so
## the map art and the top-right city labels stay visible.
var _right_spine: VBoxContainer
## The bottom docks, kept so a font change can re-measure their height instead
## of leaving them at the 150 px that only ever suited the NORMAL step.
var _log_wrap: PanelContainer
var _panel_wrap: PanelContainer

## Drag-to-resize for the bottom docks (OPTIMIZATION_PLAN §5): a grab rail on
## each panel's top edge. Per-key heights in px persist to user://ui.cfg under
## [dock]; a missing entry means "use Metrics.dock_height()".
const DOCK_HANDLE_H := 10.0
const DOCK_MAX_FRAC := 0.80
var _dock_h: Dictionary = {}
var _dock_handles: Dictionary = {}
var _dragging_dock := ""
var _market: Market
var _market_view: PanelContainer
var _market_layer: Control
var _bag: Dictionary = {}
var _settings: Dictionary = {}
var _codex_layer: Control
var _codex_view: PanelContainer
var _book_layer: Control
var _book_view: PanelContainer
var _archetype_id: String = ""
var _roster: Roster
var _party: Dictionary = {}
var _hire_ui: HireContract
var _ending: Ending
var _ending_ui: Dictionary = {}
var _transit_layer: Control
var _transit_tex: TextureRect
var _transit_label: Label
var _transit_day: Label
var _transit_progress: ProgressBar
var _transit_hint: Label
var _transit_tween: Tween
var _transit_days := 0
var _transit_hold := false
var _transit_skip := false
var _last_transit_day := -1
var _transit_on_done: Callable = Callable()
var _draw_rng: Rng
var _drawn_archetype: Dictionary = {}
var _draw_count := 0
var _character_confirmed := false
var _draw_card: VBoxContainer
var _city_detail_layer: Control
var _city_detail_card: PanelContainer
var _travel_confirm_layer: Control
var _travel_confirm: PanelContainer
var _save_layer: Control
var _save_manager: PanelContainer
var _lesson_layer: Control
var _lesson_ui: PanelContainer
var _lesson_event: Dictionary = {}
var _lesson_choice_index := -1
var _lesson_method := ""
var _pending_pages_in_sequence := 0


func _ready() -> void:
	_resolve_audio()
	UiScale.load_prefs()
	_load_dock_heights()
	# Default to Chinese when the config holds no saved language; load_prefs()
	# has already switched I18n to the persisted language if one exists.
	if I18n.lang() != "zh" and I18n.lang() != "en":
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
	# Reserve exactly as much as the bottom docks actually occupy. This was
	# hard-coded to 150, the same guess the docks themselves used to make, so
	# raising the type size buried the southern cities under the journal.
	# A player who drags the docks taller gets the same map courtesy.
	projection.set_viewport(w - MARGIN * 2.0, h - _dock_floor() - MARGIN)
	projection.origin = Vector2(MARGIN, MARGIN)


func _build_desk() -> void:
	# A fixed seed makes the opening draw reproducible for playtests: run with
	# `-- --seed=polo-2026-08-07` and every player is offered the same set.
	# Without --seed the draw stays non-deterministic as before.
	var draw_seed := _fixed_draw_seed()
	_draw_rng = Rng.new(draw_seed if draw_seed != "" \
		else "opening-draw:%d" % Time.get_ticks_usec())
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
	title.text = I18n.t("ui.boot.title_a") + "\n" + I18n.t("ui.boot.title_b")
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color("e8c46a"))
	_desk.add_child(title)

	# Seven travellers' books on the desk — each opens the reader.
	var books := HBoxContainer.new()
	books.alignment = BoxContainer.ALIGNMENT_CENTER
	books.add_theme_constant_override("separation", 6)
	_desk.add_child(books)
	for bid in MapArt.BOOKS:
		var cover := MapArt.book_cover(bid)
		if cover == null:
			continue
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(48, 64)
		btn.flat = true
		btn.tooltip_text = I18n.t("book.%s.title" % bid)
		btn.focus_mode = Control.FOCUS_ALL
		var tr := TextureRect.new()
		tr.texture = cover
		tr.set_anchors_preset(Control.PRESET_FULL_RECT)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		btn.add_child(tr)
		var open_id := String(bid)
		btn.pressed.connect(func(): _open_book(open_id))
		books.add_child(btn)

	var sub := Label.new()
	sub.text = I18n.t("ui.boot.sub") % [
		db.cities().size(), db.get_table("routes").size(), db.get_table("events").size(),
		db.get_table("goods").size(), db.get_table("retainers").size(),
		DivinationRegistry.ids().size()]
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.add_theme_color_override("font_color", Color("cbb896"))
	_desk.add_child(sub)

	var existing_slots := SaveGame.list_slots().filter(
		func(head): return String(head.get("status", "ok")) == "ok")
	if not existing_slots.is_empty():
		var slot := String(existing_slots[0].get("slot", "auto"))
		var head: Dictionary = existing_slots[0]
		var cont := Panels.styled_button(I18n.t("ui.continue_journey_fmt") % [
			_city_name(String(head.get("city", ""))), int(head.get("days", 0))], Callable())
		cont.pressed.connect(func():
			if _begin_loaded(slot):
				_desk.queue_free()
			else:
				_show_desk_load_error(slot))
		_desk.add_child(cont)

	var draw_btn := Panels.primary_button(I18n.t("ui.draw_character"), _draw_character)
	draw_btn.name = "CharacterDrawButton"
	_desk.add_child(draw_btn)

	_draw_card = VBoxContainer.new()
	_draw_card.name = "CharacterDrawCard"
	_draw_card.add_theme_constant_override("separation", Metrics.xs())
	_desk.add_child(_draw_card)


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


func _draw_character() -> void:
	var pool := db.get_table("archetypes")
	if pool.is_empty() or _draw_count >= 3:
		return
	_drawn_archetype = pool[_draw_rng.fork("draw:%d" % _draw_count).next_int(pool.size())]
	_draw_count += 1
	for child in _draw_card.get_children():
		child.queue_free()

	var culture := String(_drawn_archetype.get("culture", "latin"))
	var faith := String(_drawn_archetype.get("faith", "latin"))
	var title := Panels.heading(I18n.t("ui.you_drew") % I18n.t(_drawn_archetype.get("name", "")))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_draw_card.add_child(title)
	_draw_card.add_child(Panels.label(I18n.t("ui.boot.identity") % [
		I18n.t("ui.culture.%s" % culture), I18n.t("faith.%s" % faith)],
		UiScale.ui(), Palette.ink_soft()))
	_draw_card.add_child(Panels.label(I18n.t("ui.boot.start_city") % _city_name(
		String(_drawn_archetype.get("start", ""))), UiScale.body(), Palette.ink()))

	var known_names: Array[String] = []
	for cid in _drawn_archetype.get("knownCities", []):
		known_names.append(_city_name(String(cid)))
	_draw_card.add_child(Panels.label(I18n.t("ui.boot.heard_of") % I18n.list(
		PackedStringArray(known_names)), UiScale.ui(), Palette.ink_soft()))
	var known_routes: Array = _drawn_archetype.get("knownRoutes", [])
	_draw_card.add_child(Panels.label(
		I18n.t("ui.boot.roads_known") % known_routes.size(),
		UiScale.ui(), Palette.ink_soft()))

	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", Metrics.sm())
	var reroll := Panels.styled_button(I18n.t("ui.reroll_fmt") % (3 - _draw_count), _draw_character)
	reroll.disabled = _draw_count >= 3
	row.add_child(reroll)
	row.add_child(Panels.primary_button(I18n.t("ui.accept_destiny") % _city_name(
		String(_drawn_archetype.get("start", ""))), _confirm_character_draw))
	_draw_card.add_child(row)


func _confirm_character_draw() -> void:
	if _character_confirmed or _drawn_archetype.is_empty():
		return
	_character_confirmed = true
	_begin(_drawn_archetype)


func _begin(archetype: Dictionary) -> void:
	if state != null:
		return
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
	conditions = ConditionEvaluator.new(db)
	events = EventMachine.new(db, conditions, executor)
	travel = Travel.new(db, executor, conditions)
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
	var birth_year := 1253 + rng.fork("birth-year").next_int(22)
	var birth_month := 1 + rng.fork("birth-month").next_int(12)
	var birth_day := 1 + rng.fork("birth-day").next_int(28)
	state.birthdate_jdn = GameDate.from_gregorian(
		birth_year, birth_month, birth_day).jdn
	state.character = {
		"archetype_id": _archetype_id,
		"background": String(archetype.get("culture", "latin")),
		"faith": String(archetype.get("faith", "latin")),
		"start_city": String(state.city),
		"birth_year": birth_year,
		"birth_month": birth_month,
		"birth_day": birth_day,
	}
	for l in archetype.get("startKit", {}).get("languages", []):
		if String(l) not in state.languages:
			state.languages.append(String(l))
	for it in archetype.get("startKit", {}).get("items", []):
		if String(it) not in state.items:
			state.items.append(String(it))
	for key in archetype.get("bonus", {}):
		state.fate[String(key)] = clampi(int(state.fate.get(String(key), 15))
			+ int(archetype["bonus"][key]), 0, 31)
	for key in archetype.get("malus", {}):
		state.fate[String(key)] = clampi(int(state.fate.get(String(key), 15))
			+ int(archetype["malus"][key]), 0, 31)

	var opening_effects: Array = [{
		"op": "reveal_city", "value": String(state.city), "level": 3,
		"reason": "character-start-city",
	}]
	for known_city in archetype.get("knownCities", []):
		opening_effects.append({
			"op": "reveal_city", "value": String(known_city), "level": 1,
			"reason": "character-background-knowledge",
		})
	for known_route in archetype.get("knownRoutes", []):
		opening_effects.append({
			"op": "reveal_route", "value": String(known_route), "level": 1,
			"reason": "character-background-road-knowledge",
		})
	executor.execute(state, opening_effects, {
		"rng": rng, "event_id": "character-opening-knowledge"})

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
func _begin_loaded(slot: String) -> bool:
	# Preflight before replacing the desk. A valid-looking sidecar can outlive a
	# same-size damaged snapshot; failure must leave New Game reachable.
	var preflight := SaveGame.read(slot)
	if preflight.is_empty():
		return false
	clock = WorldClock.new(GameDate.from_gregorian(START_JDN_Y, 4, 11).jdn)
	executor = EffectExecutor.new()
	conditions = ConditionEvaluator.new(db)
	events = EventMachine.new(db, conditions, executor)
	travel = Travel.new(db, executor, conditions)
	_market = Market.new(db)
	_roster = Roster.new(db)
	_ending = Ending.new(db)
	state = WorldState.new()
	rng = Rng.new("resume")
	_build_map()
	# Restore the exact document that passed preflight. Reading the file again
	# here created a small race where a changed snapshot could replace the desk
	# after validation and then fail against an already-built world.
	if not _restore_document(preflight):
		_say("[color=#8a4a3a]%s[/color]" % I18n.t("log.load_failed"))
		return false
	return true


func _show_desk_load_error(slot: String) -> void:
	var old := _desk.get_node_or_null("LoadError")
	var text := I18n.t("ui.save.read_failed") % slot
	if old is Label:
		(old as Label).text = text
		return
	var message := Panels.label(text, UiScale.ui(), Palette.loss())
	message.name = "LoadError"
	message.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_desk.add_child(message)


func rng_seed(a: Dictionary) -> String:
	return "fatequest:%s" % a.get("id", "run")


## Read `--seed=<value>` from the engine command line (after `--`), so a
## playtest recorder can pin the opening draw. Empty when absent.
func _fixed_draw_seed() -> String:
	for a in OS.get_cmdline_user_args():
		if String(a).begins_with("--seed="):
			return String(a).trim_prefix("--seed=")
	return ""


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


func _load_world_vectors() -> Dictionary:
	var f := FileAccess.open("res://content/world/vector_map.json", FileAccess.READ)
	if f == null:
		return {}
	var doc = JSON.parse_string(f.get_as_text())
	return doc if typeof(doc) == TYPE_DICTIONARY else {}


## Layout is entirely anchor- and container-driven. The previous版 positioned
## every widget at a hard pixel offset computed from a 1280x720 assumption, so
## text ran off the edge the moment the window differed or the font grew — that
## was the cause of the overflow, and no amount of nudging numbers fixes it.
func _build_map() -> void:
	_apply_projection()
	_map = preload("res://game/map/world_map.gd").new()
	add_child(_map)
	_map.setup(projection, db.cities(), db.get_table("routes"), _load_ranges(),
		_load_world_vectors())
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
	# Height is measured from the current body size rather than fixed at 150 px.
	# 150 px is six lines at the SMALL step and barely two at HUGE, so turning
	# the type up used to shrink the journal to a slot — the readers who most
	# needed the words larger got the fewest of them on screen.
	_log_wrap = PanelContainer.new()
	_log_wrap.add_theme_stylebox_override("panel", Palette.panel_style())
	_log_wrap.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	_log_wrap.anchor_right = 0.46
	_log_wrap.offset_left = 12
	_log_wrap.offset_right = -6
	_log_wrap.offset_bottom = -12
	add_child(_log_wrap)
	_build_dock_handle("log", 0.0, 0.46, 12.0, -6.0)

	var log_scroll := ScrollContainer.new()
	log_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_log_wrap.add_child(log_scroll)

	_log = RichTextLabel.new()
	_log.bbcode_enabled = true
	_log.fit_content = true
	_log.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_log.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	log_scroll.add_child(_log)

	# --- action panel: bottom-right, scrolls -------------------------------
	_panel_wrap = PanelContainer.new()
	_panel_wrap.add_theme_stylebox_override("panel", Palette.panel_style())
	_panel_wrap.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_panel_wrap.anchor_left = 0.48
	_panel_wrap.offset_left = 6
	_panel_wrap.offset_right = -12
	_panel_wrap.offset_bottom = -12
	add_child(_panel_wrap)
	_build_dock_handle("panel", 0.48, 1.0, 6.0, -12.0)

	var panel_scroll := ScrollContainer.new()
	panel_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_panel_wrap.add_child(panel_scroll)

	_panel = VBoxContainer.new()
	_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_panel.add_theme_constant_override("separation", Metrics.xs())
	panel_scroll.add_child(_panel)

	_resize_docks()

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
	scrim.color = Palette.scrim_color()
	_dialog_layer.add_child(scrim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_dialog_layer.add_child(centre)

	_dialog = preload("res://game/ui/event_dialog.gd").new()
	centre.add_child(_dialog)
	_dialog.choice_taken.connect(_on_dialog_choice)
	_dialog.dismissed.connect(_on_event_dismissed)

	# --- market -------------------------------------------------------------
	_market_layer = Control.new()
	_market_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_market_layer.visible = false
	add_child(_market_layer)

	var mscrim := ColorRect.new()
	mscrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	mscrim.color = Palette.scrim_color()
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
	cscrim.color = Palette.scrim_color()
	# PASS so a click on the dim reaches the layer, which closes the codex.
	cscrim.mouse_filter = Control.MOUSE_FILTER_PASS
	_codex_layer.add_child(cscrim)
	var ccentre := CenterContainer.new()
	ccentre.set_anchors_preset(Control.PRESET_FULL_RECT)
	ccentre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_codex_layer.add_child(ccentre)
	_codex_view = preload("res://game/screens/codex_view.gd").new()
	_codex_view.setup(db)
	ccentre.add_child(_codex_view)
	_codex_view.closed.connect(func(): _codex_layer.visible = false)

	# Book reader may already exist from a desk click before `_begin`.
	_ensure_book_reader()

	_build_party()
	_hire_ui = preload("res://game/ui/hire_contract.gd").new()
	_hire_ui.build(self)
	_hire_ui.confirmed.connect(_on_hire_confirmed)
	_build_ending()
	_build_bag()
	_build_settings()
	_build_controls()
	_build_transit()
	_build_city_detail()
	_build_travel_confirm()
	_build_save_manager()
	_build_divination_lesson()
	_wire_dismissal()
	_restyle_all()


## Every overlay can now be left with Escape or a click on the surrounding
## dim. Before this the only way out of a panel was to find its own 合上
## button — and the event dialog's scrim swallowed clicks without offering
## anything in return, so a mis-click felt like the game had frozen.
##
## The ending confirmation is deliberately excluded from click-outside: it is
## the one irreversible decision on the screen and should not be dismissed by
## a stray click, though Escape still backs out of it.
func _wire_dismissal() -> void:
	for ui in [_bag, _party, _settings]:
		if ui is Dictionary and ui.has("layer"):
			var layer: Control = ui["layer"]
			Panels.make_dismissable(layer, ui["panel"],
				func() -> void: layer.visible = false)
	if _codex_layer != null:
		Panels.make_dismissable(_codex_layer, _codex_view,
			func() -> void: _codex_layer.visible = false)
	if _book_layer != null and _book_view != null:
		Panels.make_dismissable(_book_layer, _book_view,
			func() -> void: _book_layer.visible = false)
	if _city_detail_layer != null:
		Panels.make_dismissable(_city_detail_layer, _city_detail_card,
			func() -> void: _city_detail_layer.visible = false)
	if _travel_confirm_layer != null:
		Panels.make_dismissable(_travel_confirm_layer, _travel_confirm,
			func() -> void: _travel_confirm_layer.visible = false)
	if _save_layer != null:
		Panels.make_dismissable(_save_layer, _save_manager,
			func() -> void: _save_layer.visible = false)
	if _lesson_layer != null:
		Panels.make_dismissable(_lesson_layer, _lesson_ui, _cancel_lesson)


## Escape closes the topmost overlay. Ordered innermost-last, so a bag opened
## over the city closes the bag and leaves the city standing.
func _unhandled_key_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return
	var k := event as InputEventKey
	if not k.pressed or k.echo or k.keycode != KEY_ESCAPE:
		return
	var layers: Array = []
	var closers: Array = []
	for ui in [_settings, _ending_ui, _party, _bag]:
		if ui is Dictionary and ui.has("layer") and is_instance_valid(ui["layer"]):
			var l: Control = ui["layer"]
			layers.append(l)
			closers.append(func() -> void: l.visible = false)
	if _codex_layer != null and is_instance_valid(_codex_layer):
		layers.append(_codex_layer)
		closers.append(func() -> void: _codex_layer.visible = false)
	if _book_layer != null and is_instance_valid(_book_layer):
		layers.append(_book_layer)
		closers.append(func() -> void: _book_layer.visible = false)
	if _market_layer != null and is_instance_valid(_market_layer):
		layers.append(_market_layer)
		closers.append(func() -> void:
			_market_layer.visible = false
			_open_city())
	for pair in [
		[_lesson_layer, _cancel_lesson],
		[_save_layer, func() -> void: _save_layer.visible = false],
		[_travel_confirm_layer, func() -> void: _travel_confirm_layer.visible = false],
		[_city_detail_layer, func() -> void: _city_detail_layer.visible = false],
	]:
		if pair[0] != null and is_instance_valid(pair[0]):
			layers.append(pair[0])
			closers.append(pair[1])
	if Panels.close_topmost(layers, closers):
		get_viewport().set_input_as_handled()


## Brief transit plate shown while the caravan / ship moves between cities.
## The day counter ticks down over a few seconds of road-music while the route
## is drawn on the map; clicking the plate skips the rest of the passage.
func _build_transit() -> void:
	_transit_layer = Control.new()
	_transit_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_transit_layer.visible = false
	_transit_layer.mouse_filter = Control.MOUSE_FILTER_STOP
	_transit_layer.gui_input.connect(_on_transit_input)
	add_child(_transit_layer)
	# The plate is a travel backdrop, not a modal: when a road event holds it
	# on screen, the event dialog and every overlay must stay above and
	# clickable. It is built after them, so pin it just above the map rather
	# than letting it cover the whole UI stack.
	move_child(_transit_layer, _map.get_index() + 1)

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

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", Metrics.sm())
	plate.add_child(col)

	_transit_label = Label.new()
	_transit_label.add_theme_font_size_override("font_size", UiScale.title())
	_transit_label.add_theme_color_override("font_color", Palette.ink())
	_transit_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_transit_label)

	_transit_day = Label.new()
	_transit_day.add_theme_font_size_override("font_size", int(UiScale.title() * 1.8))
	_transit_day.add_theme_color_override("font_color", Palette.accent())
	_transit_day.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_transit_day)

	_transit_progress = ProgressBar.new()
	_transit_progress.custom_minimum_size = Vector2(320, Metrics.tap_target() * 0.6)
	_transit_progress.show_percentage = false
	col.add_child(_transit_progress)

	_transit_hint = Panels.label("", UiScale.ui(), Palette.ink_faint())
	_transit_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_transit_hint)


func _build_city_detail() -> void:
	_city_detail_layer = Control.new()
	_city_detail_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_city_detail_layer.visible = false
	add_child(_city_detail_layer)
	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Palette.scrim_color()
	scrim.mouse_filter = Control.MOUSE_FILTER_PASS
	_city_detail_layer.add_child(scrim)
	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_city_detail_layer.add_child(centre)
	_city_detail_card = preload("res://game/ui/city_detail_card.gd").new()
	centre.add_child(_city_detail_card)
	_city_detail_card.setup(db, travel)
	_city_detail_card.closed.connect(func(): _city_detail_layer.visible = false)


func _build_travel_confirm() -> void:
	_travel_confirm_layer = Control.new()
	_travel_confirm_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_travel_confirm_layer.visible = false
	add_child(_travel_confirm_layer)
	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Palette.scrim_color()
	scrim.mouse_filter = Control.MOUSE_FILTER_PASS
	_travel_confirm_layer.add_child(scrim)
	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_travel_confirm_layer.add_child(centre)
	_travel_confirm = preload("res://game/ui/travel_confirm.gd").new()
	centre.add_child(_travel_confirm)
	_travel_confirm.setup(db, travel)
	_travel_confirm.cancelled.connect(func(): _travel_confirm_layer.visible = false)
	_travel_confirm.confirmed.connect(_perform_depart)


func _build_save_manager() -> void:
	_save_layer = Control.new()
	_save_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_save_layer.visible = false
	add_child(_save_layer)
	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Palette.scrim_color()
	scrim.mouse_filter = Control.MOUSE_FILTER_PASS
	_save_layer.add_child(scrim)
	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_save_layer.add_child(centre)
	_save_manager = preload("res://game/ui/save_manager.gd").new()
	centre.add_child(_save_manager)
	_save_manager.setup(db)
	_save_manager.closed.connect(func(): _save_layer.visible = false)
	_save_manager.save_requested.connect(_on_manual_save)
	_save_manager.load_requested.connect(_on_manual_load)
	_save_manager.backup_requested.connect(_on_backup_load)


func _build_divination_lesson() -> void:
	_lesson_layer = Control.new()
	_lesson_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_lesson_layer.visible = false
	add_child(_lesson_layer)
	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Palette.scrim_color()
	scrim.mouse_filter = Control.MOUSE_FILTER_PASS
	_lesson_layer.add_child(scrim)
	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_lesson_layer.add_child(centre)
	_lesson_ui = preload("res://game/ui/divination_lesson.gd").new()
	centre.add_child(_lesson_ui)
	_lesson_ui.passed.connect(_on_lesson_passed)
	_lesson_ui.failed.connect(_on_lesson_failed)
	_lesson_ui.skipped.connect(_on_lesson_skipped)


func _show_transit(route: Dictionary, mode: String, dest: String, days: int,
		hold: bool = false, on_done: Callable = Callable()) -> void:
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
	_transit_label.text = I18n.t("ui.transit_label_fmt") % [
		_city_name(dest), days, I18n.t("transport.%s.name" % mode)]
	_transit_day.visible = true
	_transit_progress.visible = true
	_transit_hint.visible = true
	_transit_layer.visible = true
	# A road event may open instantly over the plate; the countdown still runs
	# behind the dialog so the passage is not read as a teleport. Skipping is
	# allowed either way — a tap on the plate jumps to the end of the trip.
	_transit_days = maxi(days, 1)
	_transit_hold = hold
	_transit_skip = false
	_transit_on_done = on_done
	_transit_progress.max_value = float(_transit_days)
	_start_transit_countdown()


## Drives the day counter across the journey. Total length is capped so a
## ninety-day trek to the far west does not hold the screen for a minute:
## ANIMATION_PLAN — animation serves the reading, it does not own the clock.
func _start_transit_countdown() -> void:
	if _transit_tween != null and _transit_tween.is_valid():
		_transit_tween.kill()
	_transit_hint.text = I18n.t("ui.transit_skip")
	_transit_progress.value = 0.0
	var total := clampf(float(_transit_days) * 0.09, 1.8, 3.6)
	var seconds := Motion.dur(total, Motion.Kind.MOVE)
	if not Motion.allows(Motion.Kind.MOVE) or seconds <= 0.02:
		_transit_day.text = _day_string(0)
		_transit_progress.value = _transit_progress.max_value
		_finish_transit_countdown()
		return
	_transit_tween = create_tween()
	_transit_tween.tween_method(_set_transit_day, 0.0, 1.0, seconds)
	_transit_tween.finished.connect(_finish_transit_countdown)


## Day counter down to zero; the audio ticks each time the number drops.
func _set_transit_day(t: float) -> void:
	var remaining := ceili(float(_transit_days) * (1.0 - t))
	remaining = maxi(remaining, 0)
	_transit_day.text = _day_string(remaining)
	_transit_progress.value = float(_transit_days - remaining)
	if remaining != _last_transit_day and _audio_ready():
		_audio.sfx("tick")
	_last_transit_day = remaining


func _day_string(remaining: int) -> String:
	if remaining <= 0:
		return I18n.t("ui.transit_arrived")
	return I18n.t("ui.transit_day_fmt") % remaining


func _finish_transit_countdown() -> void:
	_last_transit_day = -1
	if _transit_hold:
		# The plate stays up for the whole passage; arrival clears it.
		return
	var done := _transit_on_done
	_transit_on_done = Callable()
	if _transit_skip:
		_transit_layer.visible = false
		if done.is_valid():
			done.call()
		return
	get_tree().create_timer(0.35).timeout.connect(func():
		if is_instance_valid(_transit_layer):
			_transit_layer.visible = false
		if done.is_valid():
			done.call())


func _on_transit_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton):
		return
	var mb := event as InputEventMouseButton
	if not mb.pressed or mb.button_index != MOUSE_BUTTON_LEFT:
		return
	if _transit_tween != null and _transit_tween.is_valid():
		_transit_tween.kill()
	_transit_skip = true
	_set_transit_day(1.0)
	_finish_transit_countdown()


## Reader controls. Text size and contrast are not preferences to bury in a
## menu on a game made of prose — they decide whether it can be read at all.
func _build_controls() -> void:
	# The top bar used to carry eight buttons crammed into a hard slot; at the
	# LARGE step it overflowed, and at HUGE it covered the map art and pushed
	# the 缩小 button unreachable. All those commands live in the settings panel
	# now. The top-right corner keeps only 设置 — the one thing a player may
	# need with the map still open — and the two panels you open while on the
	# road (行囊, 同行) sit on a slim right spine instead, so neither the bar
	# nor the spine hides the map.
	var bar := HFlowContainer.new()
	bar.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	bar.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	bar.offset_right = -12
	bar.offset_top = 58
	bar.alignment = FlowContainer.ALIGNMENT_END
	bar.add_theme_constant_override("h_separation", Metrics.sm())
	bar.add_theme_constant_override("v_separation", Metrics.xs())
	add_child(bar)

	bar.add_child(_ctl_key("ui.settings", func(): Motion.crossfade_in(_settings["layer"], 0.18)))
	_controls = bar

	var spine := VBoxContainer.new()
	spine.set_anchors_preset(Control.PRESET_CENTER_RIGHT)
	spine.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	spine.offset_right = -12
	spine.alignment = BoxContainer.ALIGNMENT_CENTER
	spine.add_theme_constant_override("separation", Metrics.xs())
	add_child(spine)
	spine.add_child(_ctl_key("ui.bag", _open_bag))
	spine.add_child(_ctl_key("ui.party", _open_party))
	_right_spine = spine
	_resize_controls()


## Width the control bar needs at the current type size, so the flow container
## has something to wrap inside. Measured from the buttons themselves rather
## than guessed, and never wider than half the window.
func _resize_controls() -> void:
	if _controls == null or not is_instance_valid(_controls):
		return
	var w := 0.0
	for k in _controls.get_children():
		if k is Control:
			w += (k as Control).get_combined_minimum_size().x + float(Metrics.sm())
	var avail := maxf(size.x, 1280.0) * 0.55
	_controls.custom_minimum_size.x = minf(w, avail)
	_controls.offset_left = -minf(w, avail) - 12.0


## Bottom docks are as tall as six lines of the current body type.
func _resize_docks() -> void:
	if _log_wrap != null and is_instance_valid(_log_wrap):
		_log_wrap.offset_top = -_dock_height("log")
	if _panel_wrap != null and is_instance_valid(_panel_wrap):
		_panel_wrap.offset_top = -_dock_height("panel")
	_sync_dock_handles()


## Saved height in px for a dock key, falling back to the metrics default and
## clamped to the window so a stored value from a smaller screen still fits.
func _dock_height(key: String) -> float:
	var min_h := _min_dock_height()
	var max_h := maxf(size.y * DOCK_MAX_FRAC, min_h + 1.0)
	var h := float(_dock_h.get(key, -1.0))
	if h < 0.0:
		h = Metrics.dock_height()
	return clampf(h, min_h, max_h)


## Shortest dock that stays readable: three lines of body type plus padding.
func _min_dock_height() -> float:
	return maxf(56.0, float(UiScale.body()) * 3.0 + float(Metrics.md()) * 2.0 + 8.0)


## The tallest panel decides how much of the window the map must give up.
func _dock_floor() -> float:
	return maxf(_dock_height("log"), _dock_height("panel"))


## A grab rail along the top edge of a bottom dock. A sibling of the panel so
## the Container cannot re-lay it out; _sync_dock_handles keeps it pinned to
## the panel's current top edge.
func _build_dock_handle(key: String, anchor_left: float, anchor_right: float,
		offset_left: float, offset_right: float) -> void:
	var handle := Control.new()
	handle.name = "DockHandle_%s" % key
	handle.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	handle.anchor_top = 1.0
	handle.anchor_bottom = 1.0
	handle.anchor_left = anchor_left
	handle.anchor_right = anchor_right
	handle.offset_left = offset_left
	handle.offset_right = offset_right
	handle.mouse_filter = Control.MOUSE_FILTER_STOP
	handle.mouse_default_cursor_shape = Control.CURSOR_VSIZE
	handle.gui_input.connect(_on_dock_handle_input.bind(key))
	add_child(handle)
	var rail := ColorRect.new()
	rail.color = Color(Palette.ink_soft(), 0.55)
	rail.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rail.set_anchors_preset(Control.PRESET_FULL_RECT)
	rail.offset_top = (DOCK_HANDLE_H - 3.0) * 0.5
	rail.offset_bottom = -(DOCK_HANDLE_H - 3.0) * 0.5
	handle.add_child(rail)
	_dock_handles[key] = handle
	_sync_dock_handles()


## Keeps each handle hugging its panel's top edge after any resize.
func _sync_dock_handles() -> void:
	for key in ["log", "panel"]:
		if not _dock_handles.has(key) or not is_instance_valid(_dock_handles[key]):
			continue
		var wrap: Control = _log_wrap if key == "log" else _panel_wrap
		if wrap == null or not is_instance_valid(wrap):
			continue
		var handle: Control = _dock_handles[key]
		handle.offset_top = wrap.offset_top - DOCK_HANDLE_H
		handle.offset_bottom = wrap.offset_top


## Pressing the rail starts a drag; motion and release are followed in _input
## so they are seen even when the pointer runs over the panel's own buttons.
func _on_dock_handle_input(event: InputEvent, key: String) -> void:
	if not (event is InputEventMouseButton):
		return
	var mb := event as InputEventMouseButton
	if mb.button_index != MOUSE_BUTTON_LEFT or not mb.pressed:
		return
	_dragging_dock = key
	get_viewport().set_input_as_handled()


func _input(event: InputEvent) -> void:
	if _dragging_dock == "":
		return
	if event is InputEventMouseMotion:
		_drag_dock_to(_dragging_dock, (event as InputEventMouseMotion).position.y)
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if not mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_dragging_dock = ""
			_save_dock_heights()
			get_viewport().set_input_as_handled()


## Live resize: the pointer fixes the top edge, so taller windows or a dragged
## panel leave more map visible through _apply_projection.
func _drag_dock_to(key: String, global_y: float) -> void:
	var min_h := _min_dock_height()
	var max_h := maxf(size.y * DOCK_MAX_FRAC, min_h + 1.0)
	# The wrap's bottom edge sits 12 px above the window floor (offset_bottom).
	var h := clampf(size.y - 12.0 - global_y, min_h, max_h)
	_dock_h[key] = h
	_resize_docks()
	_apply_projection()
	if _map:
		_map.queue_redraw()


## Dock heights survive a restart via the same ui.cfg UiScale owns. Both sides
## re-read the file before writing so each only touches its own sections.
func _load_dock_heights() -> void:
	var f := ConfigFile.new()
	if f.load(UiScale.CFG) != OK:
		return
	for key in ["log", "panel"]:
		var v := float(f.get_value("dock", key, -1.0))
		if v >= 0.0:
			_dock_h[key] = v


func _save_dock_heights() -> void:
	var f := ConfigFile.new()
	f.load(UiScale.CFG)
	for key in ["log", "panel"]:
		f.set_value("dock", key, float(_dock_h.get(key, -1.0)))
	f.save(UiScale.CFG)


func _map_centre() -> Vector2:
	return projection.origin + Vector2(projection.width, projection.height) * 0.5


## A control-bar button that remembers its i18n key, so the language toggle can
## re-label it without rebuilding the whole bar.
func _ctl_key(key: String, cb: Callable) -> Button:
	var b := Panels.styled_button(I18n.t(key), cb)
	b.set_meta("i18n_key", key)
	return b


## Re-labels control-bar buttons after a language switch.
func _relang_controls() -> void:
	for bar in [_controls, _right_spine]:
		if bar == null or not is_instance_valid(bar):
			continue
		for k in bar.get_children():
			if k is Button and (k as Button).has_meta("i18n_key"):
				(k as Button).text = I18n.t(String((k as Button).get_meta("i18n_key")))
	_resize_controls()


## Re-dresses the control bar after a font or contrast change.
##
## This used to set only `normal`, leaving `hover` holding a stylebox built
## against the *previous* palette — so after switching to high contrast the
## buttons went white until the pointer touched them, then flashed back to
## parchment. Routing through the one button factory makes that class of
## mismatch impossible.
func _refresh_controls() -> void:
	for bar in [_controls, _right_spine]:
		if bar == null or not is_instance_valid(bar):
			continue
		for k in bar.get_children():
			if k is Button:
				Panels.style_button(k as Button)
	_resize_controls()


func _refresh_hud() -> void:
	var used := 0
	for n in state.goods.values():
		used += int(n)
	var here := db.get_record(state.city)
	var currency := String(here.get("market", {}).get("currency", "")) if here.has("market") else ""
	_hud.refresh(state, clock, _city_name(state.city), used,
		String(here.get("culture", "latin")), currency)
	_map.set_current(state.city, state.revealed)


func _open_save_manager() -> void:
	_save_manager.refresh()
	_save_layer.visible = true
	Motion.parchment_expand(_save_manager, 0.20)


func _on_manual_save(slot: String) -> void:
	if _save(slot):
		_say("[color=#4a6a4a]%s[/color]" % I18n.t("ui.save.saved") % slot)
		_save_manager.trust_slot_header(slot)
	else:
		_say("[color=#8a4a3a]%s[/color]" % I18n.t("ui.save.save_failed") % slot)
		_save_manager.mark_slot_for_deep_check(slot)


func _on_manual_load(slot: String) -> void:
	if _load(slot):
		_save_layer.visible = false
	else:
		_say("[color=#8a4a3a]%s[/color]" % I18n.t("ui.save.load_failed") % slot)
		_save_manager.mark_slot_for_deep_check(slot)


func _on_backup_load(slot: String) -> void:
	if SaveGame.restore_backup(slot) and _load(slot):
		_say("[color=#4a6a4a]%s[/color]" % I18n.t("ui.save.restored") % slot)
		_save_layer.visible = false
	else:
		_say("[color=#8a4a3a]%s[/color]" % I18n.t("ui.save.restore_failed") % slot)
	_save_manager.refresh()


func _say(line: String) -> void:
	_log.text += line + "\n"
	_log.scroll_to_line(_log.get_line_count())


## Journals an effect result for the player, dropping the raw audit trail.
##
## EffectExecutor's log_lines are `op:reason` slugs authored for debugging and
## save-replay ("coins:fare-camel", "days:travel-rt-…"). Printed verbatim they
## leak English onto the journal — the reader asked "why is there English on
## my screen". The player-facing story is already carried by resultText and the
## HUD; the audit trail belongs in a log file, not the journal. A line that is
## not an `op:reason` slug (already-translated prose) is kept.
func _log_effects(res) -> void:
	if res == null or not (res as Object).has_method("get"):
		return
	for line in res.log_lines:
		if _is_audit_slug(line):
			continue
		_say("  · %s" % line)


## True for the `op:reason` audit format the executor emits — a bare slug with
## a colon, no spaces. Translated prose lines never match this shape.
func _is_audit_slug(line: String) -> bool:
	if not line.contains(":") or line.contains(" "):
		return false
	var head := line.substr(0, line.find(":"))
	return head != "" and head == head.to_lower()


## Arrival: fire the entry event if there is one, else offer the roads.
func _arrive() -> void:
	# Stranding guard: however the player got here, a city with not one known
	# road out of it is a dead end — every exit button stays greyed and the
	# run stalls. Arrival usually reveals the outbound roads (travel.depart);
	# this is the safety net for the openings that don't.
	travel.ensure_way_out(state, clock.month())
	_refresh_hud()
	_autosave()
	if _audio_ready(): _audio.set_jdn(state.jdn)
	var city := db.get_record(state.city)
	var ctx := _ctx()
	# End of passage: the transit plate (possibly held through a road event)
	# gives way to the entry art or the city itself. Clear it unconditionally
	# so a held plate can never sit over the arrival screen.
	if _transit_tween != null and _transit_tween.is_valid():
		_transit_tween.kill()
	_last_transit_day = -1
	if _transit_layer != null:
		_transit_layer.visible = false
	# Prefer a dedicated entry plate when one exists.
	var entry_art := MapArt.city_entry(String(city.get("id", "")))
	if entry_art != null and _transit_layer != null:
		_transit_day.visible = false
		_transit_progress.visible = false
		_transit_hint.visible = false
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


func _on_event_dismissed() -> void:
	_dialog_layer.visible = false
	# “先不动手” pauses a committed consequence instead of silently hiding a
	# durable active_event with no way back to it.
	if state != null and state.active_event == String(_current_event.get("id", "")):
		_show_pending_pause()
	elif state != null and not state.active_journey.is_empty():
		_complete_journey()
	elif _city_view.visible:
		_city_view.show_city(db.get_record(state.city), state, conditions, _ctx())
		_sync_city_status()
	else:
		_open_city()


## Applies a market order. The screen produces effects; the executor applies
## them; the HUD reflects them. No shortcut, or the audit trail breaks.
## What you are carrying, and what it is worth here. The player had no way to
## see the hold at all outside the market screen.
func _build_bag() -> void:
	_bag = Panels.overlay(self, Vector2(560, 420))
	var box: VBoxContainer = _bag["box"]
	var title := Panels.label(I18n.t("ui.bag"), UiScale.title(), Palette.ink())
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
	bag_row.add_child(Panels.styled_button(I18n.t("ui.codex"), func():
		_bag["layer"].visible = false
		_open_codex()))
	var close_btn := Panels.styled_button(I18n.t("ui.close"), func(): _bag["layer"].visible = false)
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
	var title := Panels.label(I18n.t("ui.ending"), UiScale.title(), Palette.ink())
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
	var confirm := Panels.styled_button(I18n.t("ui.end_now"), _confirm_ending)
	row.add_child(confirm)
	_ending_ui["confirm"] = confirm
	row.add_child(Panels.styled_button(I18n.t("ui.keep_going"), func(): _ending_ui["layer"].visible = false))


func _open_ending() -> void:
	var e := _ending.best(state)
	var body: RichTextLabel = _ending_ui["body"]
	_ending_ui["title"].text = I18n.t("ui.ending.title")
	_ending_ui["confirm"].visible = true

	var years := maxi(1, int(state.days_elapsed / 365.0))
	var ind := I18n.gap()
	var lines := "[color=#6a5a48]%s[/color]\n\n" % I18n.t("ui.ending.intro")
	lines += ind + I18n.t("ui.ending.journey") % [state.visited.size(), years, state.days_elapsed] + "\n"
	lines += ind + I18n.t("ui.ending.path") % [
		_city_name(state.start_city) if not state.start_city.is_empty() else I18n.t("ui.not_started"),
		_city_name(state.city)] + "\n"
	lines += ind + I18n.t("ui.ending.ledger") % [
		state.coins / Market.FEN, state.retainers.size(), state.codex.size()] + "\n"
	lines += "\n[color=#6a5a48]%s[/color]\n\n" % I18n.t("ui.ending.named")
	lines += ind + "[b]%s[/b]\n" % I18n.t(String(e.get("name", "")))

	# Endings the run does not yet reach, so the player can see what stopping
	# now would cost them. Naming the unreached ones is the whole reason a
	# player would choose to keep going.
	var have := {}
	for q in _ending.qualifying(state):
		have[String(q.get("id", ""))] = true
	var missed: PackedStringArray = []
	for cand in db.get_table("endings"):
		if not have.has(String(cand.get("id", ""))):
			missed.append(I18n.t(String(cand.get("name", ""))))
	if not missed.is_empty():
		lines += "\n[color=#8a7a68]%s[/color]\n" % I18n.t("ui.ending.missed") % I18n.list(missed)

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
	_say("[color=#4a6a4a]· %s[/color]" % (I18n.t("log.journey_ended") % I18n.t(String(e.get("name", "")))))
	_refresh_hud()


## The party: who travels with you, what they carry, and what leaving costs.
func _build_party() -> void:
	_party = Panels.overlay(self, Vector2(640, 460))
	var box: VBoxContainer = _party["box"]
	box.add_child(Panels.label(I18n.t("ui.party"), UiScale.title(), Palette.ink()))
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	box.add_child(scroll)
	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 5)
	scroll.add_child(list)
	_party["list"] = list
	box.add_child(Panels.styled_button(I18n.t("ui.close"), func(): _party["layer"].visible = false))


func _open_party() -> void:
	var list: VBoxContainer = _party["list"]
	for c in list.get_children():
		c.queue_free()

	# What the hold is on each kind of road, so the player can see the shape of
	# the party rather than one number.
	list.add_child(Panels.label(I18n.t("ui.party.cargo_slots") % [
		_roster.effective_slots(state, "land"), _roster.effective_slots(state, "sea")],
		UiScale.ui(), Palette.ink_soft()))

	if state.retainers.is_empty():
		list.add_child(Panels.label(I18n.t("ui.party.alone"), UiScale.body(), Palette.ink_soft()))
	for m in state.retainers:
		list.add_child(_party_row(m))

	# Hiring pool, if this place has one.
	var pool := _roster.candidates(state, state.city, "open")
	if not pool.is_empty():
		list.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
		list.add_child(Panels.label(I18n.t("ui.party.hire_here"), UiScale.ui(), Palette.ink()))
		for r in pool:
			list.add_child(_hire_row(r))

	var short := _roster.divined_shortlist(state, state.city, rng)
	if not short.is_empty():
		list.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
		list.add_child(Panels.label(I18n.t("ui.party.divined_pick"), UiScale.ui(), Palette.ink()))
		for entry in short:
			list.add_child(_divined_hire_row(entry))
	_party["layer"].visible = true
	Motion.crossfade_in(_party["layer"], 0.18)


func _on_hire_confirmed(rec: Dictionary) -> void:
	var res := executor.execute(state, _roster.hire_effects(rec),
		{"rng": rng, "event_id": "hire"})
	_log_effects(res)
	_refresh_hud()
	_open_party()


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

	var seal := MapArt.seal_wax()
	if seal == null:
		seal = MapArt.contract_art("sealed")
	if seal != null:
		var st := TextureRect.new()
		st.texture = seal
		st.custom_minimum_size = Vector2(28, 28)
		st.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		st.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(st)

	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(col)
	col.add_child(Panels.label(I18n.t(rec.get("name", rid)), UiScale.ui(), Palette.ink()))

	var cargo: Dictionary = rec.get("cargo", {})
	var carries := "—"
	if not cargo.is_empty():
		carries = I18n.t("ui.party.carry_fmt") % [
			I18n.fmt("cargo.%s" % cargo.get("condition", "always")), int(cargo.get("slots", 0))]
	col.add_child(Panels.label(I18n.t("ui.party.wage_line") % [
		int(rec.get("wage", {}).get("amount", 0)) / Market.FEN,
		carries, int(m.get("mood", 16)), I18n.fmt(_roster.birth_known(state, rid))],
		UiScale.ui() - 3, Palette.ink_soft()))

	# Dismissal must state the cost before it happens (GDD §11.7).
	var of := _roster.overflow_if_leaving(state, _market, rid, "land")
	var btn := Panels.styled_button(I18n.t("ui.dismiss"), Callable())
	btn.pressed.connect(func():
		var over := int(of["over"])
		if over > 0:
			_say("[color=#8a4a3a]%s[/color]"
				% I18n.t("ui.party.dismiss_overflow") % [I18n.t(rec.get("name", rid)), over])
			return
		var res := executor.execute(state, _roster.dismiss_effects(rid),
			{"rng": rng, "event_id": "dismiss"})
		_log_effects(res)
		_refresh_hud()
		_open_party())
	if int(of["over"]) > 0:
		btn.tooltip_text = I18n.t("ui.party.dismiss_tip") % int(of["over"])
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
	var note := I18n.t("ui.party.wage") % (int(rec.get("wage", {}).get("amount", 0)) / Market.FEN)
	if not cargo.is_empty():
		note += I18n.gap() + I18n.t("ui.party.carry_fmt") % [
			I18n.fmt("cargo.%s" % cargo.get("condition", "always")), int(cargo.get("slots", 0))]
	col.add_child(Panels.label(note, UiScale.ui() - 3, Palette.ink_soft()))

	var btn := Panels.styled_button(I18n.t("ui.hire"), Callable())
	btn.pressed.connect(func():
		_hire_ui.open(rec, culture, "open"))
	row.add_child(btn)
	return panel


func _divined_hire_row(entry: Dictionary) -> Control:
	var rec: Dictionary = entry.get("retainer", {})
	var verdict := String(entry.get("verdict", ""))
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
	col.add_child(Panels.label(I18n.fmt(verdict), UiScale.ui() - 3, Palette.ink_soft()))

	var btn := Panels.styled_button(I18n.t("ui.hire"), Callable())
	btn.pressed.connect(func():
		_hire_ui.open(rec, culture, "divined", verdict))
	row.add_child(btn)
	return panel


func _open_codex() -> void:
	Motion.crossfade_in(_codex_layer, 0.18)
	_codex_view.open(state)


func _open_book(book_id: String = "") -> void:
	_ensure_book_reader()
	if _book_layer == null or _book_view == null:
		return
	Motion.crossfade_in(_book_layer, 0.18)
	_book_view.open(book_id)


func _ensure_book_reader() -> void:
	## Desk opens before `_begin` builds the play overlays — create the reader
	## on demand so the seven covers work on the parchment screen too.
	if _book_layer != null and is_instance_valid(_book_layer):
		return
	_book_layer = Control.new()
	_book_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_book_layer.visible = false
	_book_layer.z_index = 80
	add_child(_book_layer)
	var bscrim := ColorRect.new()
	bscrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	bscrim.color = Palette.scrim_color()
	bscrim.mouse_filter = Control.MOUSE_FILTER_PASS
	_book_layer.add_child(bscrim)
	var bcentre := CenterContainer.new()
	bcentre.set_anchors_preset(Control.PRESET_FULL_RECT)
	bcentre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_book_layer.add_child(bcentre)
	_book_view = preload("res://game/screens/book_reader.gd").new()
	_book_view.setup(db)
	bcentre.add_child(_book_view)
	_book_view.closed.connect(func():
		if _book_layer != null:
			_book_layer.visible = false)
	Panels.make_dismissable(_book_layer, _book_view,
		func() -> void:
			if _book_layer != null:
				_book_layer.visible = false)


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
		var line := I18n.t("ui.cargo.bulk_line") % [I18n.t(g.get("name", "")), n, int(g.get("bulk", 1)) * n]
		if worth > 0:
			line += I18n.gap() + I18n.t("ui.cargo.sell_here") % (worth / Market.FEN)
		list.add_child(_icon_line(MapArt.goods_icon(String(gid)), line))
		rows += 1

	for it in state.items:
		list.add_child(_icon_line(MapArt.item_icon(String(it)),
			"· " + I18n.fmt("item.%s" % it)))
		rows += 1

	if rows == 0:
		list.add_child(Panels.label(I18n.t("ui.cargo.empty_hands"), UiScale.ui(), Palette.ink_soft()))

	list.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
	list.add_child(Panels.label(I18n.t("ui.cargo.purse_line") % [
		_market.cargo_used(state), state.cargo_slots, state.coins / Market.FEN],
		UiScale.ui(), Palette.ink_soft()))
	# Learned arts and the codex belong here too — they are what the journey
	# actually accumulates.
	if not state.learned_divinations.is_empty():
		var arts: Array[String] = []
		for d in state.learned_divinations:
			arts.append(I18n.t("div.%s.name" % d))
		list.add_child(Panels.label(I18n.t("ui.bag.arts_known") % I18n.list(
			PackedStringArray(arts)), UiScale.ui(), Palette.ink_soft()))
	list.add_child(Panels.label(I18n.t("ui.bag.codex_stickers") % [
		state.codex.size(), state.stickers.size()], UiScale.ui(), Palette.ink_soft()))
	_bag["layer"].visible = true
	Motion.crossfade_in(_bag["layer"], 0.18)


func _icon_line(icon: Texture2D, text: String) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	if icon != null:
		var tr := TextureRect.new()
		tr.texture = icon
		# Icons track the type size: a fixed 28 px box is oversized beside 25 px
		# HUGE-step text and undersized beside it at SMALL.
		var isz := float(Metrics.icon_lg())
		tr.custom_minimum_size = Vector2(isz, isz)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)
	var lbl := Panels.label(text, UiScale.ui(), Palette.ink())
	# Without wrapping, a long English goods row sets the list's minimum width,
	# which inflates the bag panel past the window and drags the close button
	# off-screen with it.
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(lbl)
	return row


## Reader settings, reachable from anywhere including the city interior.
## All map-and-journal commands that used to crowd the top-right bar live here
## now, so the top of the screen stays clear of the map art.
func _build_settings() -> void:
	_settings = Panels.overlay(self, Vector2(460, 420), true)
	_fill_settings(_settings["box"])


## Populates the settings box. Extracted so a language switch can rebuild the
## panel text in place: every button label is authored against the current
## I18n, so switching zh/en must re-read them rather than restyle stale ones.
func _fill_settings(box: VBoxContainer) -> void:
	box.add_child(Panels.label(I18n.t("ui.settings"), UiScale.title(), Palette.ink()))

	# --- appearance -------------------------------------------------------
	var size_btn := Panels.styled_button(I18n.t("ui.font_size_fmt") + UiScale.label(), Callable())
	size_btn.pressed.connect(func():
		UiScale.cycle()
		size_btn.text = I18n.t("ui.font_size_fmt") + UiScale.label()
		_restyle_all())
	box.add_child(size_btn)

	var hc := Panels.styled_button(I18n.t("ui.high_contrast") + (I18n.t("ui.high_contrast_on") if UiScale.high_contrast else I18n.t("ui.high_contrast_off")), Callable())
	hc.pressed.connect(func():
		UiScale.high_contrast = not UiScale.high_contrast
		UiScale.save()
		hc.text = I18n.t("ui.high_contrast") + (I18n.t("ui.high_contrast_on") if UiScale.high_contrast else I18n.t("ui.high_contrast_off"))
		_restyle_all())
	box.add_child(hc)

	var lang_btn := Panels.styled_button(I18n.t("ui.language") + I18n.t("ui.lang_%s" % I18n.lang()), Callable())
	lang_btn.pressed.connect(func():
		I18n.load_lang("zh" if I18n.lang() == "en" else "en")
		UiScale.save()
		_restyle_all()
		_rebuild_settings_text()
		_relang_controls()
		if _hud != null and _hud.has_method("build"):
			_hud.build()
		_refresh_hud())
	box.add_child(lang_btn)

	# --- sound & motion ---------------------------------------------------
	var mute := Panels.styled_button(I18n.t("ui.sound"), Callable())
	mute.pressed.connect(func():
		if _audio_ready():
			_audio.toggle_mute()
			mute.text = I18n.t("ui.sound") + "：" + (I18n.t("ui.mute") if _audio.muted else I18n.t("ui.high_contrast_on")))
	box.add_child(mute)

	var motion := Panels.styled_button(I18n.t("ui.reduce_motion") + (I18n.t("ui.high_contrast_on") if Motion.reduce_motion else I18n.t("ui.high_contrast_off")), Callable())
	motion.pressed.connect(func():
		Motion.reduce_motion = not Motion.reduce_motion
		motion.text = I18n.t("ui.reduce_motion") + (I18n.t("ui.high_contrast_on") if Motion.reduce_motion else I18n.t("ui.high_contrast_off"))
	)
	box.add_child(motion)

	# --- map --------------------------------------------------------------
	var map_row := HBoxContainer.new()
	map_row.add_theme_constant_override("separation", Metrics.xs())
	box.add_child(map_row)
	map_row.add_child(Panels.styled_button(I18n.t("ui.reset_view"), func(): _map.center_on(state.city)))
	map_row.add_child(Panels.styled_button(I18n.t("ui.zoom_in"), func(): _map.set_zoom(_map.zoom * 1.35, _map_centre())))
	map_row.add_child(Panels.styled_button(I18n.t("ui.zoom_out"), func(): _map.set_zoom(_map.zoom / 1.35, _map_centre())))

	# --- books & journal --------------------------------------------------
	var open_btn := Panels.styled_button(I18n.t("ui.codex"), func():
		_settings["layer"].visible = false
		_open_codex())
	box.add_child(open_btn)
	box.add_child(Panels.styled_button(I18n.t("ui.ending"), func():
		_settings["layer"].visible = false
		_open_ending()))

	box.add_child(Panels.label("", UiScale.ui(), Palette.ink()))

	box.add_child(Panels.styled_button(I18n.t("ui.manage_saves"), func():
		_settings["layer"].visible = false
		_open_save_manager()))

	box.add_child(Panels.styled_button(I18n.t("ui.close"), func(): _settings["layer"].visible = false))


## Language switch rebuilds the settings column so every label re-reads the
## new locale instead of showing stale text from the previous one.
func _rebuild_settings_text() -> void:
	if not _settings.has("box"):
		return
	var box: VBoxContainer = _settings["box"]
	for c in box.get_children():
		c.queue_free()
	_fill_settings(box)


func _on_traded() -> void:
	var effects: Array = _market_view.take_pending()
	if effects.is_empty():
		return
	var res := executor.execute(state, effects, {"rng": rng, "event_id": "market:" + state.city})
	_log_effects(res)
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
	if not _save("auto"):
		# Save failure must never block arrival, but it must be visible. Silent
		# failure gives the player false confidence until the next launch.
		_say("[color=#8a4a3a]· %s[/color]" % I18n.t("log.autosave_failed"))


func _save(slot: String) -> bool:
	# Wall-clock time comes from the presentation layer; the kernel never reads it.
	return SaveGame.write(slot, state, clock, {"archetype": _archetype_id},
		Time.get_datetime_string_from_system(true))


func _load(slot: String) -> bool:
	var doc := SaveGame.read(slot)
	if doc.is_empty():
		return false
	return _restore_document(doc)


func _restore_document(doc: Dictionary) -> bool:
	var back := SaveGame.deserialize(doc)
	if back.is_empty():
		return false
	state = back["state"]
	clock = back["clock"]
	_archetype_id = String((back["extra"] as Dictionary).get("archetype", _archetype_id))
	# The RNG is reseeded from the saved seed, so a loaded world continues
	# deterministically rather than diverging from the run that produced it.
	rng = Rng.new(state.seed)
	_say("[color=#4a6a4a]%s[/color]" % I18n.t("ui.load.banner") % [_city_name(state.city), state.days_elapsed])
	# Restored numbers are not news. Without this the HUD would light up the
	# whole bar green on load, as though the player had just earned three
	# hundred days and a purse in one step.
	if _hud != null:
		_hud.silence_next()
	# Same stranding guard as arrival: a loaded world must never pin the
	# player inside a city with no known way out.
	travel.ensure_way_out(state, clock.month())
	_refresh_hud()
	_map.center_on(state.city)
	_dialog_layer.visible = false
	_market_layer.visible = false
	_codex_layer.visible = false
	if _book_layer != null:
		_book_layer.visible = false
	_bag["layer"].visible = false
	_pending_pages_in_sequence = 0
	if not state.active_journey.is_empty():
		if not _show_next_pending_event():
			_complete_journey()
	elif not _show_next_pending_event():
		_open_city()
	return true


func _sync_city_status() -> void:
	if _city_view == null or not _city_view.has_method("set_status"):
		return
	var c := db.get_record(state.city)
	var g := clock.date.civil(String(c.get("culture", "latin")))
	_city_view.set_status(state.coins / Market.FEN, _market.cargo_used(state),
		state.cargo_slots, state.days_elapsed,
		I18n.t("ui.date.full") % [g["year"], g["month"], g["day"]])


func _close_city() -> void:
	_city_view.visible = false
	_show_roads(true)


func _restyle_all() -> void:
	if _log:
		_log.add_theme_font_size_override("normal_font_size", UiScale.body())
		_log.add_theme_color_override("default_color", Palette.ink())
	for wrap in [_log_wrap, _panel_wrap]:
		if wrap != null and is_instance_valid(wrap):
			wrap.add_theme_stylebox_override("panel", Palette.panel_style())
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
	if _book_view and _book_view.has_method("restyle"):
		_book_view.restyle()
	# The overlays have no restyle() of their own, and used to be skipped
	# entirely — switching to high contrast left the bag, party, ending,
	# settings and hire panels on the old parchment. Those are exactly the
	# panels a reader who just asked for high contrast is about to open.
	for ui in [_bag, _party, _ending_ui, _settings]:
		if ui is Dictionary and ui.has("layer") and is_instance_valid(ui["layer"]):
			Panels.restyle_tree(ui["layer"])
	if _hire_ui != null and _hire_ui.has_method("restyle"):
		_hire_ui.restyle()
	_refresh_controls()
	# The docks grew or shrank, so the map has more or less room than it did.
	_resize_docks()
	_apply_projection()
	if _map:
		_map.queue_redraw()


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
		"source":  return "[color=#7a6a4a](" + I18n.t("ui.source_polo") + ")[/color]"
		"hybrid":  return "[color=#7a6a4a](" + I18n.t("ui.source_hybrid") + ")[/color]"
		"authored": return "[color=#7a6a4a](" + I18n.t("ui.source_authored") + ")[/color]"
	return ""


func _on_choice(ev: Dictionary, index: int) -> void:
	var choices: Array = ev.get("choices", [])
	if index >= 0 and index < choices.size():
		var choice: Dictionary = choices[index]
		for effect in choice.get("effects", []):
			if String(effect.get("op", "")) == "learn_divination":
				var method := String(effect.get("value", ""))
				if method not in state.learned_divinations:
					_start_lesson(ev, index, method)
					return
	_resolve_choice(ev, index)


func _start_lesson(ev: Dictionary, index: int, method: String) -> void:
	_lesson_event = ev
	_lesson_choice_index = index
	_lesson_method = method
	var lesson := db.get_record("lesson-%s" % method)
	if lesson.is_empty():
		push_error("Missing divination lesson configuration for %s" % method)
		_on_lesson_failed(method)
		return
	_lesson_ui.start(method, lesson, rng.fork(
		"lesson:%s:%s" % [ev.get("id", "?"), method]))
	_lesson_layer.visible = true
	Motion.parchment_expand(_lesson_ui, 0.22)


func _on_lesson_passed(method: String) -> void:
	if method != _lesson_method or _lesson_event.is_empty():
		return
	_lesson_layer.visible = false
	var ev := _lesson_event
	var index := _lesson_choice_index
	_clear_lesson_pending()
	_say("[color=#4a6a4a]· %s[/color]" % I18n.t("log.lesson_passed") % I18n.t(
		db.get_record(method).get("name", method)))
	_resolve_choice(ev, index, method)


func _on_lesson_failed(method: String) -> void:
	_lesson_layer.visible = false
	if not _lesson_event.is_empty() and _lesson_choice_index >= 0:
		var choices: Array = _lesson_event.get("choices", [])
		if _lesson_choice_index < choices.size():
			var choice: Dictionary = choices[_lesson_choice_index]
			var fail_effects: Array = choice.get("lessonFailEffects", [])
			if not fail_effects.is_empty():
				var fail_result := executor.execute(state, fail_effects, {
					"rng": rng,
					"event_id": "%s:lesson-failed" % _lesson_event.get("id", "?"),
				})
				_log_effects(fail_result)
	_say("[color=#8a4a3a]· %s[/color]" % I18n.t("log.lesson_failed") % I18n.t(
		db.get_record(method).get("name", method)))
	_clear_lesson_pending()
	_open_city()


func _on_lesson_skipped(method: String) -> void:
	_lesson_layer.visible = false
	_say(I18n.t("ui.skip_learn_fmt") % I18n.t(db.get_record(method).get("name", method)))
	_clear_lesson_pending()
	_open_city()


func _cancel_lesson() -> void:
	if not _lesson_layer.visible:
		return
	_on_lesson_skipped(_lesson_method)


func _clear_lesson_pending() -> void:
	_lesson_event = {}
	_lesson_choice_index = -1
	_lesson_method = ""


func _resolve_choice(ev: Dictionary, index: int, lesson_passed: String = "") -> void:
	var coins_before := state.coins
	var choose_ctx := _ctx()
	var result_text_key := ""
	if not lesson_passed.is_empty():
		choose_ctx["lesson_passed"] = lesson_passed
	if state.active_event == String(ev.get("id", "")):
		choose_ctx["event_committed"] = true
	var res := events.choose(ev, index, state, rng, choose_ctx)
	if not res.resolved:
		_say("[color=#8a4a3a]%s[/color]" % I18n.t("ui.choice.stale"))
		if state.active_event == String(ev.get("id", "")):
			_show_event(ev)
		elif _city_view.visible:
			_sync_city_status()
		else:
			_open_city()
		return
	var choices: Array = ev.get("choices", [])
	if index >= 0 and index < choices.size():
		result_text_key = String((choices[index] as Dictionary).get("resultText", ""))
		if not result_text_key.is_empty():
			_say("  · %s" % I18n.t(result_text_key))
	if _audio_ready(): _audio.on_effect_result(res, {}, db.get_record(state.city), coins_before)
	_log_effects(res)
	if not res.reading.is_empty():
		_say("")
		var sym := DivinationResultView.symbol_texture(res.reading)
		if sym != null and _dialog != null:
			# Surface the cast symbol briefly in the journal header line.
			_say("[color=#6a5a48]%s[/color]" % I18n.t("ui.method_bracket") % DivinationResultView.method_name(
				String(res.reading.get("method", ""))))
		_say(DivinationResultView.as_richtext(res.reading))
	if not res.rejected.is_empty():
		_say("  [color=#8a4a3a]%s[/color]" % I18n.t("ui.choice.rejected") % res.rejected.size())
	if state.active_event == String(ev.get("id", "")):
		executor.execute(state, [
			{
				"op": "dequeue_event",
				"value": state.active_event,
				"reason": "resolved-queued-event",
			},
			{
				"op": "active_event",
				"value": "",
				"reason": "closed-queued-event",
			},
		], {"rng": rng, "event_id": "queued-event-resolved"})
	_refresh_hud()
	# A choice may enqueue one or more authored consequences. Resolve the FIFO
	# before returning to city exploration so a branch can never silently end
	# between “what I chose” and “what happened because of it”.
	if _show_next_pending_event():
		return
	if not state.pending_events.is_empty():
		_show_pending_pause()
		return
	if not state.active_journey.is_empty():
		if result_text_key.is_empty():
			_complete_journey()
			return
		# The result page must be dismissed before arrival; otherwise the player
		# sees the city transition before they can read what the choice caused.
		_dialog_layer.visible = true
		_dialog.show_result(result_text_key)
		return
	if not result_text_key.is_empty():
		_dialog_layer.visible = true
		_dialog.show_result(result_text_key)
		return
	if _city_view.visible:
		_city_view.show_city(db.get_record(state.city), state, conditions, _ctx())
		_sync_city_status()
	else:
		_open_city()


func _show_next_pending_event() -> bool:
	if _pending_pages_in_sequence >= 3 and not state.pending_events.is_empty():
		return false
	if state != null and not state.active_event.is_empty():
		var resumed := db.get_record(state.active_event)
		if not resumed.is_empty():
			_city_view.visible = false
			_pending_pages_in_sequence += 1
			_show_event(resumed)
			return true
		executor.execute(state, [
			{
				"op": "dequeue_event",
				"value": state.active_event,
				"reason": "discarded-missing-active-event",
			},
			{
				"op": "recovery",
				"id": "skipped_events",
				"value": state.active_event,
				"reason": "missing-active-event",
			},
			{
				"op": "active_event",
				"value": "",
				"reason": "cleared-missing-active-event",
			},
		], {"rng": rng, "event_id": "active-event-recovery"})
	while state != null and not state.pending_events.is_empty():
		var event_id := String(state.pending_events[0])
		var next := db.get_record(event_id)
		if next.is_empty():
			push_error("Missing queued consequence event: %s" % event_id)
			executor.execute(state, [
				{
					"op": "dequeue_event",
					"value": event_id,
					"reason": "discarded-missing-queued-event",
				},
				{
					"op": "recovery",
					"id": "skipped_events",
					"value": event_id,
					"reason": "missing-queued-event",
				},
			], {"rng": rng, "event_id": "consequence-recovery"})
			continue
		executor.execute(state, [{
			"op": "active_event",
			"value": event_id,
			"reason": "opened-queued-event",
		}], {"rng": rng, "event_id": "consequence-queue"})
		_city_view.visible = false
		_pending_pages_in_sequence += 1
		_show_event(next)
		return true
	_pending_pages_in_sequence = 0
	return false


func _show_pending_pause() -> void:
	_dialog_layer.visible = false
	_city_view.visible = false
	_clear_panel()
	_panel.add_child(Panels.heading(I18n.t("ui.pending_consequences")))
	_panel.add_child(Panels.label(
		I18n.t("ui.chain.paused"),
		UiScale.ui(), Palette.ink_soft()))
	_panel.add_child(Panels.primary_button(I18n.t("ui.continue_pending"), _continue_pending))


func _continue_pending() -> void:
	_pending_pages_in_sequence = 0
	if _show_next_pending_event():
		return
	if not state.active_journey.is_empty():
		_complete_journey()
	else:
		_open_city()


## The road list. `from_city` records that the player stepped out of the town
## interior: the top "back" button must then return them to the town, not to a
## bare map — walking out to read the roads and finding the town gone read as
## being stuck. Arrival and map entry return to the map instead.
func _show_roads(from_city: bool = false) -> void:
	_clear_panel()
	var here := db.get_record(state.city)

	# The road list is reached from the city interior and from arrival, and a
	# player who only came to look must be able to leave again without hunting
	# for an invisible exit. The button is first, so it survives whatever the
	# list below grows to.
	_panel.add_child(Panels.styled_button(
		I18n.t("ui.back_to_map"),
		func() -> void:
			if from_city:
				_open_city()
			else:
				_clear_panel()))

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
		# Bare `Button.new()` inherits Godot's default dark theme, so these sat
		# on the parchment as grey slabs with white text while every other
		# button in the game was vellum — on the panel the player uses most.
		var sbtn := Panels.styled_button(
			"◆ %s" % I18n.t(sev.get("title", "")), _show_event.bind(sev))
		sbtn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		_panel.add_child(sbtn)

	var here_rec := db.get_record(state.city)
	if here_rec.has("market"):
		var mbtn := Panels.styled_button(I18n.t("ui.open_market"), _open_market)
		mbtn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		_panel.add_child(mbtn)

	# The roads are a different kind of thing from the sites above them, and
	# the list ran straight on with only a bare Label between.
	_panel.add_child(Panels.rule())
	_panel.add_child(Panels.heading(I18n.t("ui.routes_from") % _city_name(state.city)))

	var any := false
	for r in travel.routes_from(state.city):
		if not travel.is_route_known(r, state):
			continue
		var dest := travel.other_end(r, state.city)
		for mode in r.get("modes", []):
			var av := travel.availability(r, state, clock.month(), String(mode))
			var days := travel.total_days(r, String(mode))
			var cost := travel.total_cost(r, String(mode)) / 100
			# The arrow used to point back at the city you are standing in
			# ("杭州 ← 骆驼"), which reads as arriving rather than leaving.
			var btn := Panels.styled_button(I18n.t("ui.route_button_fmt") % [
				_city_name(dest), I18n.t("transport.%s.name" % mode), days, cost],
				Callable())
			btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
			btn.disabled = not av["ok"]
			if not av["ok"]:
				var rr: Array[String] = []
				for reason in av["reasons"]:
					rr.append(I18n.fmt(String(reason)))
				var why := I18n.list(PackedStringArray(rr))
				# Say why on the face of the button, not only in a tooltip a
				# player has to hover a greyed-out control to discover — the
				# event dialog already states its reasons this way.
				btn.text += I18n.gap() + I18n.t("ui.why_fmt") % why
				btn.tooltip_text = why
			else:
				btn.tooltip_text = I18n.t("ui.route.tooltip") % [_city_name(dest), days, cost]
				btn.pressed.connect(_on_depart.bind(r, String(mode)))
			_panel.add_child(btn)
			any = true
	if not any:
		_panel.add_child(Panels.label(I18n.t("ui.no_routes"), UiScale.ui(), Palette.ink_faint()))
		_panel.add_child(Panels.label(I18n.t("ui.no_routes_hint"), UiScale.ui(), Palette.ink_soft()))


func _on_depart(route: Dictionary, mode: String) -> void:
	_travel_confirm.open(route, mode, state.city, state)
	_travel_confirm_layer.visible = true
	Motion.parchment_expand(_travel_confirm, 0.22)


func _perform_depart(route: Dictionary, mode: String) -> void:
	_travel_confirm_layer.visible = false
	# The hold on THIS road decides whether the cargo travels. A porter's mules
	# do not help at sea, so the party's contribution is computed per leg.
	var t_rec := db.get_record(mode)
	var kinds: Array = t_rec.get("kinds", ["land"])
	var mode_kind := String(kinds[0]) if not kinds.is_empty() else "land"

	# Capture origin before depart moves WorldState (goto + reveal_map).
	var origin_id := String(state.city)
	var trip := travel.depart(route, mode, state, rng)
	if not bool(trip.get("ok", false)):
		var reasons: Array[String] = []
		for reason in trip.get("reasons", []):
			reasons.append(I18n.fmt(String(reason)))
		_say("[color=#8a4a3a]%s[/color]" % I18n.t("ui.route.cannot") % I18n.list(
			PackedStringArray(reasons)))
		# A road the player is standing in may still be a town interior —
		# returning to a bare map would strand them outside their own city.
		var origin_rec := db.get_record(origin_id)
		_show_roads(not origin_rec.is_empty()
			and not (origin_rec.get("sites", []) as Array).is_empty())
		return
	if _audio_ready():
		_audio.on_depart(route)
		_audio.set_travel(route)
	# If the road holds an encounter, keep the transit plate on screen for the
	# whole passage: the beat it used to show was swallowed by the event dialog
	# opening instantly on top, which read as "the return trip had no animation".
	# With no encounter the plate runs its countdown, then arrival completes.
	var has_pending := not state.pending_events.is_empty()
	var transit_seconds := clampf(float(int(trip["days"])) * 0.09, 1.8, 3.6)
	_show_transit(route, mode, String(trip["destination"]), int(trip["days"]),
		has_pending, _complete_journey if not has_pending else Callable())

	# N2 M2 — stroke the road as a fire-and-forget visual. Must not await:
	# ANIMATION_PLAN §4 — animation must not gate game logic (or smoke tests).
	# The stroke length is the countdown's own, so the ink keeps pace with the
	# day counter instead of finishing in the first half-second.
	_map.animate_route(origin_id, String(trip["destination"]), int(trip["days"]),
		String(route.get("kind", mode_kind)), bool(route.get("trunk", false)),
		transit_seconds)

	# Wages fall due on the road (GDD §11). Unpaid means goodwill, not debt.
	var wage_fx := _roster.pay_effects(state, int(trip["days"]))
	if not wage_fx.is_empty():
		var wr := executor.execute(state, wage_fx, {"rng": rng, "event_id": "wages"})
		_log_effects(wr)

	# Spoilage and theft resolve per leg — GDD §9.2's brake is fares AND losses.
	var losses := _market.travel_losses(state, route, int(trip["days"]), rng.fork("cargo"))
	if not losses.is_empty():
		var lr := executor.execute(state, losses, {"rng": rng, "event_id": "cargo-loss"})
		_log_effects(lr)
	clock = WorldClock.new(state.jdn)
	if _audio_ready(): _audio.set_jdn(state.jdn)
	_say("[color=#4a6a4a]%s[/color]" % I18n.t("ui.route.departed") % [
		_city_name(trip["destination"]), trip["days"], trip["cost"] / 100])

	# Route-specific encounters were deterministically queued by Travel before
	# the location changed. Checkpoint here so quitting inside a road event
	# resumes that event and still completes the arrival afterwards.
	_pending_pages_in_sequence = 0
	if not state.pending_events.is_empty():
		_save("auto")
		if _show_next_pending_event():
			_refresh_hud()
			return
		_complete_journey()
		return
	# No encounter queued: the departure countdown plays out (or is skipped),
	# then arrival completes through the callback handed to _show_transit.
	# WorldState already moved during depart; only the presentation waits.


func _complete_journey() -> void:
	if state == null:
		return
	if not state.active_journey.is_empty():
		executor.execute(state, [{
			"op": "end_journey",
			"value": true,
			"reason": "journey-events-complete",
		}], {"rng": rng, "event_id": "journey-complete"})
	clock = WorldClock.new(state.jdn)
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
		_city_detail_card.show_city(c, state)
		_city_detail_layer.visible = true
		Motion.parchment_expand(_city_detail_card, 0.20)
	elif known > 0:
		_city_detail_card.show_city(c, state)
		_city_detail_layer.visible = true
		Motion.parchment_expand(_city_detail_card, 0.20)
	else:
		_say("[color=#6a6a6a]%s[/color]" % I18n.t("ui.route.unknown"))


func _city_name(cid: String) -> String:
	var c := db.get_record(cid)
	return I18n.t(c.get("name", cid)) if not c.is_empty() else cid


func _build_audio_controls() -> void:
	# A1: mute must be reachable before any sustained drone settles in.
	var btn := Button.new()
	btn.name = "MuteBtn"
	btn.text = I18n.t("ui.mute")
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
		btn.text = I18n.t("ui.unmute") if is_muted else I18n.t("ui.mute")
