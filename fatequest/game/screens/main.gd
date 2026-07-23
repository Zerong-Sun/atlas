extends Control

## P1 shell: desk -> map -> travel + events. Deliberately plain; art lands in
## P2 (docs/ART_REQUIREMENTS.md). What matters here is that the kernel loop is
## reachable by a human: arrive, read an event, choose, hire a road, depart.

const MARGIN := 48.0
const START_JDN_Y := 1292
const START_COINS := 500000     # fen — the kernel keeps money in integers

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
var _hud: Label
var _log: RichTextLabel
var _panel: VBoxContainer


func _ready() -> void:
	I18n.load_lang("zh")
	var n := db.load_all()
	DivinationBootstrap.register_all()

	projection = MapProjection.from_config()
	# Inset the drawable area. Zayton and Kinsay sit at ~120E, within a degree
	# of the bbox edge, so a flush-to-edge projection clips the corridor's
	# terminus and its labels straight off the screen.
	projection.set_viewport(size.x - MARGIN * 2.0, size.y - 150.0 - MARGIN)
	projection.origin = Vector2(MARGIN, MARGIN)

	print("[boot] records: %d | cities: %d | routes: %d | methods: %s"
		% [n, db.cities().size(), db.get_table("routes").size(), str(DivinationRegistry.ids())])
	print("[boot] missing i18n keys: %d" % I18n.missing_keys().size())

	_build_desk()


func _build_desk() -> void:
	_desk = VBoxContainer.new()
	_desk.set_anchors_preset(Control.PRESET_CENTER)
	_desk.position = size * 0.5 - Vector2(180, 90)
	add_child(_desk)

	var title := Label.new()
	title.text = "远行之书\nThe Book of Far Roads"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_desk.add_child(title)

	var sub := Label.new()
	sub.text = "\n%d 座城 · %d 条路线 · %d 条事件\n%d 种商品 · %d 位随从 · %d 种占法\n" % [
		db.cities().size(), db.get_table("routes").size(), db.get_table("events").size(),
		db.get_table("goods").size(), db.get_table("retainers").size(),
		DivinationRegistry.ids().size()]
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_desk.add_child(sub)

	for a in db.get_table("archetypes"):
		var btn := Button.new()
		btn.text = "%s  →  %s" % [I18n.t(a.get("name", "")), _city_name(a.get("start", ""))]
		btn.pressed.connect(_begin.bind(a))
		_desk.add_child(btn)


func _begin(archetype: Dictionary) -> void:
	_desk.queue_free()

	clock = WorldClock.new(GameDate.from_gregorian(START_JDN_Y, 4, 11).jdn)
	rng = Rng.new("run:%s:%d" % [archetype.get("id", "x"), clock.date.jdn])
	executor = EffectExecutor.new()
	conditions = ConditionEvaluator.new()
	events = EventMachine.new(db, conditions, executor)
	travel = Travel.new(db, executor)

	state = WorldState.new()
	state.seed = rng_seed(archetype)
	state.city = archetype.get("start", "tauris")
	state.jdn = clock.date.jdn
	state.coins = int(archetype.get("startKit", {}).get("coins", START_COINS))
	state.faith = archetype.get("faith", "latin")
	for l in archetype.get("startKit", {}).get("languages", []):
		state.languages.append(String(l))
	for it in archetype.get("startKit", {}).get("items", []):
		state.items.append(String(it))

	_build_map()
	_arrive()


func rng_seed(a: Dictionary) -> String:
	return "fatequest:%s" % a.get("id", "run")


func _build_map() -> void:
	_map = preload("res://game/map/world_map.gd").new()
	add_child(_map)
	_map.setup(projection, db.cities(), db.get_table("routes"))
	_map.city_clicked.connect(_on_city_clicked)

	_hud = Label.new()
	_hud.position = Vector2(MARGIN, size.y - 140)
	add_child(_hud)

	_log = RichTextLabel.new()
	_log.position = Vector2(MARGIN, size.y - 112)
	_log.size = Vector2(size.x * 0.5 - MARGIN, 104)
	_log.bbcode_enabled = true
	add_child(_log)

	_panel = VBoxContainer.new()
	_panel.position = Vector2(size.x * 0.55, size.y - 140)
	_panel.size = Vector2(size.x * 0.4, 130)
	add_child(_panel)


func _refresh_hud() -> void:
	var g := clock.date.to_gregorian()
	_hud.text = "%s · %d年%d月%d日 · %s · 银 %d · 第 %d 日" % [
		_city_name(state.city), g["year"], g["month"], g["day"],
		clock.date.ganzhi_day(), state.coins / 100, state.days_elapsed]
	_map.set_current(state.city, state.revealed)


func _say(line: String) -> void:
	_log.text += line + "\n"
	_log.scroll_to_line(_log.get_line_count())


## Arrival: fire the entry event if there is one, else offer the roads.
func _arrive() -> void:
	_refresh_hud()
	var ctx := _ctx()
	var ev := events.pick("entry", state, rng, ctx)
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


func _show_event(ev: Dictionary) -> void:
	_clear_panel()
	_say("[b]%s[/b]  %s" % [I18n.t(ev.get("title", "")), _origin_tag(ev)])

	var states := events.choice_states(ev, state, _ctx())
	for i in states.size():
		var s: Dictionary = states[i]
		var btn := Button.new()
		btn.text = I18n.t(s["choice"].get("label", ""))
		btn.disabled = not s["enabled"]
		if not s["enabled"]:
			# GDD §7.1: say WHY, never a bare refusal.
			btn.tooltip_text = ", ".join(PackedStringArray(s["reasons"]))
			btn.text += "  (%s)" % btn.tooltip_text
		btn.pressed.connect(_on_choice.bind(ev, i))
		_panel.add_child(btn)

	var skip := Button.new()
	skip.text = "— 看看道路 —"
	skip.pressed.connect(_show_roads)
	_panel.add_child(skip)


## GDD §19: the player must always be able to tell source from invention.
func _origin_tag(rec: Dictionary) -> String:
	match rec.get("lore", {}).get("origin", ""):
		"source":  return "[color=#7a6a4a](据《马可·波罗游记》)[/color]"
		"hybrid":  return "[color=#7a6a4a](据原文演绎)[/color]"
		"authored": return "[color=#7a6a4a](据原文语体新撰)[/color]"
	return ""


func _on_choice(ev: Dictionary, index: int) -> void:
	var res := events.choose(ev, index, state, rng, _ctx())
	for line in res.log_lines:
		_say("  · %s" % line)
	if not res.rejected.is_empty():
		_say("  [color=#8a4a3a]· %d 项未能达成[/color]" % res.rejected.size())
	_refresh_hud()
	_show_roads()


func _show_roads() -> void:
	_clear_panel()
	var here := db.get_record(state.city)
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
				btn.tooltip_text = ", ".join(PackedStringArray(av["reasons"]))
			btn.pressed.connect(_on_depart.bind(r, String(mode)))
			_panel.add_child(btn)
			any = true
			break   # one mode per destination keeps the P1 panel readable
	if not any:
		var none := Label.new()
		none.text = "（无路可走）"
		_panel.add_child(none)


func _on_depart(route: Dictionary, mode: String) -> void:
	var trip := travel.depart(route, mode, state, rng)
	clock = WorldClock.new(state.jdn)
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
