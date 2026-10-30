extends Control

## Illustrated touch surface. All actions are routed through the same enabled
## buttons as keyboard input, so decoration cannot bypass challenge rules.
signal interacted(action: String, index: int)
signal inspected(index: int)
const Art = preload("res://game/ui/lesson_art.gd")
var _effect := 0.0
var _effect_action := ""
var _effect_index := 0
var _effect_code := ""
var _previous: Dictionary = {}
var _hover := Vector2(-100, -100)
var _effect_tween: Tween
var engine: RefCounted
const GOLD := Color("cda860")
const INK := Color("e6dcc6")
const BLUE := Color("7eafbc")
const MUTED := Color("9f9b91")
var _font: Font

func _ready() -> void:
	custom_minimum_size = Vector2(350, 284)
	size_flags_horizontal = Control.SIZE_FILL
	mouse_filter = Control.MOUSE_FILTER_STOP
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	mouse_exited.connect(func(): _hover = Vector2(-100, -100); queue_redraw())
	tooltip_text = I18n.t("lesson.stage.direct")

func _text(at: Vector2, value: String, color: Color = INK, font_size: int = 16) -> void:
	draw_string(_font, at, value, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, color)

func _t(key: String) -> String:
	return I18n.t("challenge.ui.%s" % key)

func _draw() -> void:
	if engine == null or engine.state.is_empty(): return
	_font = get_theme_default_font()
	var background := Color("202c32")
	if engine.kind in ["parity", "numbers", "cycle"]: background = Color("352e26")
	if engine.kind in ["memory", "draft", "cast"]: background = Color("2d352e")
	draw_style_box(_panel(background), Rect2(Vector2.ZERO, size))
	var cloth := Art.texture("table")
	if cloth != null: draw_texture_rect_region(cloth, Rect2(Vector2.ZERO, size), Rect2(Vector2(160, 160), cloth.get_size() - Vector2(320, 320)))
	var s: Dictionary = engine.state
	var center := Vector2(size.x * 0.5, 132)
	match engine.kind:
		"cast":
			if not s.cast:
				_prop(Art.instrument(engine.config), Rect2(center - Vector2(64, 105), Vector2(128, 112)))
			else:
				for i in s.coins.size():
					var point := Vector2(64 + i * 95, 51)
					var sprite := "block_flat" if int(s.coins[i]) == 0 else "block_curved"
					if engine.config.variant != "blocks": sprite = "coin_heads" if int(s.coins[i]) == 0 else "coin_tails"
					_prop(sprite, Rect2(point - Vector2(36, 36), Vector2(72, 72)), 1.0, _effect_action == "cast")
					var face := _t("flat" if int(s.coins[i]) == 0 else "curved") if engine.config.variant == "blocks" else str(int(s.coins[i]) + 2)
					_text(point + Vector2(-14, 50), face, INK, 17)
			if engine.config.variant != "blocks":
				_text(Vector2(18, 115), _t("line_chart"), MUTED, 13)
				for i in 6:
					var y := 238.0 - i * 19.0
					_text(Vector2(20, y + 4), str(i + 1), MUTED, 12)
					if i < engine.records.size():
						var value := int(engine.records[i].answer)
						_line(Vector2(48, y), value % 2 == 1, GOLD)
						var changed := value in [6, 9]
						_line(Vector2(185, y), (value % 2 == 0) if changed else (value % 2 == 1), BLUE)
						if changed: _text(Vector2(147, y + 4), "*", GOLD, 18)
					else: draw_line(Vector2(48, y), Vector2(115, y), Color("52605a"), 1)
			else:
				for i in engine.records.size():
					_text(Vector2(24, 135 + i * 30), "%d  %s" % [i + 1, _t("block%d" % int(engine.records[i].answer))], GOLD, 16)
		"parity":
			_prop("sand_tray", Rect2(4, 4, size.x - 8, 252), 0.55)
			_text(Vector2(30, 32), "A", GOLD)
			_text(Vector2(132, 32), "B", GOLD)
			_text(Vector2(230, 32), _t("current"), BLUE)
			for i in 4:
				var y := 68.0 + i * 48
				_dots(Vector2(48, y), int(s.left[i]), GOLD)
				_text(Vector2(87, y + 4), "+", MUTED)
				_dots(Vector2(148, y), int(s.right[i]), GOLD)
				_text(Vector2(190, y + 4), "=", MUTED)
				_dots(Vector2(253, y), int(s.cells[i]), BLUE)
		"rings":
			_prop("astrolabe", Rect2(center - Vector2(125, 125), Vector2(250, 250)), 0.65)
			for i in 12:
				var point := center + Vector2.UP.rotated(i * TAU / 12.0) * 106
				_text(point + Vector2(-7, 5), str(i + 1), MUTED, 13)
			for i in 3:
				var radius := 36.0 + i * 26
				draw_arc(center, radius, 0, TAU, 96, GOLD.darkened(0.55), 1.5, true)
				var target := center + Vector2.UP.rotated(int(s.target[i]) * TAU / 12.0) * radius
				var angle := int(s.rings[i]) * TAU / 12.0
				if _effect > 0 and _effect_action in ["left", "right"] and _previous.has("rings"):
					angle = lerp_angle(int(_previous.rings[i]) * TAU / 12.0, angle, 1.0 - _effect)
				var current := center + Vector2.UP.rotated(angle) * radius
				draw_arc(target, 7, 0, TAU, 24, GOLD, 2, true)
				draw_line(center, current, BLUE, 2, true)
				draw_circle(current, 5, BLUE)
			_text(Vector2(15, 253), "○ " + _t("goal") + "    • " + _t("current"), MUTED, 13)
		"route":
			_prop("terrain_map", Rect2(13, 6, size.x - 26, 246), 0.55)
			for cell in 25:
				var p := _grid_point(cell)
				if cell in s.blocked:
					_prop("mountain", Rect2(p - Vector2(21, 22), Vector2(42, 44)))
				else: draw_circle(p, 2, MUTED)
				if cell in s.checkpoints:
					_prop("waypoint", Rect2(p - Vector2(16, 20), Vector2(32, 40)))
				if cell == int(s.goal): _prop("destination", Rect2(p - Vector2(21, 22), Vector2(42, 44)))
			for i in range(1, s.path.size()): draw_line(_grid_point(int(s.path[i - 1])), _grid_point(int(s.path[i])), GOLD, 3, true)
			draw_circle(_grid_point(int(s.path.back())), 7, GOLD)
			_prop("traveler", Rect2(_grid_point(int(s.path.back())) - Vector2(16, 21), Vector2(32, 42)))
		"memory":
			for i in 8:
				var p := Vector2(20 + (i % 4) * 77, 22 + (i / 4) * 118)
				var revealed: bool = s.preview or i in s.open or i in s.matched
				var runic: bool = engine.config.variant == "runes"
				var sprite := "rune_back" if runic else "card_back"
				if revealed: sprite = Art.RUNES[int(s.cards[i])] if runic else "card_face"
				_prop(sprite, Rect2(p, Vector2(61, 100)), 1.0, _effect_action == "cell" and _effect_index == i)
				if revealed and not runic:
					_prop(Art.DREAMS[int(s.cards[i])], Rect2(p + Vector2(9, 26), Vector2(43, 52)), 1.0, _effect_action == "cell" and _effect_index == i)
				_text(p + Vector2(5, 13), str(i + 1), INK if runic or not revealed else Color("483822"), 12)
				if i in s.matched: draw_arc(p + Vector2(49, 88), 5, 0, TAU, 20, BLUE, 2, true)
		"trace":
			_prop(Art.instrument(engine.config), Rect2(center - Vector2(122, 122), Vector2(244, 244)), 0.75)
			for cell in 25:
				var p := _grid_point(cell)
				draw_circle(p, 2, Color("b5b6a2"))
				if cell in s.selected:
					draw_circle(p, 8, BLUE)
					draw_arc(p, 12, 0, TAU, 24, INK, 2, true)
				if s.preview and cell in s.target:
					draw_circle(p, 7, GOLD)
					draw_arc(p, 11, 0, TAU, 24, GOLD.darkened(0.3), 1, true)
			_text(Vector2(16, 253), _t("preview" if s.preview else "covered"), MUTED, 12)
		"draft":
			var labels := symbol_labels()
			var totals: Array = engine.totals()
			for i in 4:
				var p := Vector2(22 + (i % 2) * 153, 20 + (i / 2) * 119)
				draw_style_box(_panel(Color("3d4338")), Rect2(p, Vector2(134, 102)))
				_emblem(p + Vector2(104, 49), i)
				_text(p + Vector2(12, 28), labels[i], GOLD, 18)
				_text(p + Vector2(18, 70), "%d / %d" % [int(totals[i]), int(s.target[i])], BLUE if totals[i] == s.target[i] else INK, 25)
		"cycle":
			var points: Array[Vector2] = []
			for i in 5: points.append(center + Vector2.UP.rotated(i * TAU / 5.0) * 88)
			for i in 5:
				var destination := (i + int(s.offset)) % 5
				var a := points[i]
				var b := points[destination]
				draw_line(a, b, GOLD.darkened(0.4), 2, true)
				var tip := a.lerp(b, 0.65)
				var direction := (b-a).normalized()
				draw_line(tip, tip - direction.rotated(0.5) * 10, GOLD, 2, true)
				draw_line(tip, tip - direction.rotated(-0.5) * 10, GOLD, 2, true)
			for i in 5:
				_prop(Art.ELEMENTS[i], Rect2(points[i] - Vector2(30, 30), Vector2(60, 60)), 0.85)
				_text(points[i] + Vector2(-22, -31), _t(["wood","fire","earth","metal","water"][i]), INK, 13)
				_text(points[i] + Vector2(-18, 40), "%d/%d" % [int(s.cells[i]), int(s.target[i])], BLUE, 16)
		"numbers":
			_text(Vector2(24, 35), _t("goal") + "  " + str(s.target), GOLD, 24)
			for i in s.values.size():
				var p := Vector2(65 + (i % 3) * 105, 95 + (i / 3) * 85)
				_prop("number_tile", Rect2(p - Vector2(34, 34), Vector2(68, 68)), 0.85)
				_text(p + Vector2(-10, 7), str(s.values[i]), Color("392c21"), 21)
				if i in s.selected: draw_arc(p, 34, 0, TAU, 32, BLUE, 3, true)
		"timing":
			var angle: float = (engine.needle() - 0.5) * 0.4
			draw_set_transform(center, angle if not Motion.reduce_motion else 0.0)
			_prop("lot_tube", Rect2(-95, -128, 190, 212))
			draw_set_transform(Vector2.ZERO)
			var area := Rect2(22, 225, size.x - 44, 15)
			draw_rect(area, Color("101d20"))
			draw_rect(Rect2(area.position.x + float(s.low) * area.size.x, 225, (float(s.high) - float(s.low)) * area.size.x, 15), GOLD)
			var x: float = 22 + engine.needle() * area.size.x
			draw_line(Vector2(x, 216), Vector2(x, 246), BLUE, 4, true)

	# Ornament and gesture feedback live outside the readable instrument markings.
	var hint_key := "rings_touch" if engine.kind == "rings" else ("draft_touch" if engine.kind == "draft" else "direct")
	_text(Vector2(12, size.y - 10), I18n.t("lesson.stage.%s" % hint_key), MUTED, 11)
	var target := action_at(_hover)
	if not target.is_empty() and engine.status == "active":
		draw_arc(_hover, 17, 0, TAU, 24, Color(GOLD, 0.8), 1.5, true)
	if _effect > 0 and not Motion.reduce_motion:
		var color := BLUE if _effect_code not in ["wrong", "mismatch", "illegal"] else Color("dc906b")
		var p := Vector2(size.x * 0.5, 130)
		if _effect_action == "cell" and engine.kind in ["route", "trace"]: p = _grid_point(_effect_index)
		for i in 8:
			var dust := p + Vector2.UP.rotated(i * TAU / 8.0) * (16 + (1.0 - _effect) * 45)
			draw_circle(dust, 2.2 * _effect, Color(color, _effect * 0.8))

func _prop(name: String, rect: Rect2, opacity: float = 1.0, flip: bool = false) -> void:
	var texture := Art.prop(name)
	if texture == null: return
	# Preserve each asset's proportions and consistent visual weight.
	var ratio := minf(rect.size.x / texture.get_width(), rect.size.y / texture.get_height())
	var dimensions := texture.get_size() * ratio
	var area := Rect2(rect.get_center() - dimensions * 0.5, dimensions)
	if flip and _effect > 0 and not Motion.reduce_motion:
		var original_width := area.size.x
		area.size.x *= maxf(0.12, absf(cos(_effect * PI * 2)))
		area.position.x += (original_width - area.size.x) * 0.5
	draw_texture_rect(texture, area, false, Color(1, 1, 1, opacity))

func animate(action: String, index: int, code: String, previous: Dictionary) -> void:
	if _effect_tween != null and _effect_tween.is_valid(): _effect_tween.kill()
	_effect_action = action
	_effect_index = index
	_effect_code = code
	_previous = previous
	_effect = 0.0 if Motion.reduce_motion else 1.0
	if not Motion.reduce_motion:
		_effect_tween = create_tween()
		_effect_tween.tween_method(func(value: float): _effect = value; queue_redraw(), 1.0, 0.0, 0.45)
	queue_redraw()

func action_at(point: Vector2, reverse: bool = false) -> Dictionary:
	if engine == null or engine.status != "active" or not Rect2(Vector2.ZERO, size).has_point(point): return {}
	var s: Dictionary = engine.state
	match engine.kind:
		"cast":
			if not s.cast and point.y < 115: return {"action": "cast", "index": 0}
		"timing":
			if point.y < 250: return {"action": "submit", "index": 0}
		"parity":
			for i in 4:
				if Rect2(218, 46 + i * 48, 80, 44).has_point(point): return {"action": "cell", "index": i}
		"rings":
			var distance := point.distance_to(Vector2(size.x * 0.5, 132))
			for i in 3:
				if absf(distance - (36 + i * 26)) <= 13: return {"action": "left" if reverse else "right", "index": i}
		"route", "trace":
			if s.get("preview", false): return {}
			for i in 25:
				if point.distance_to(_grid_point(i)) <= 21: return {"action": "cell", "index": i}
		"memory":
			if s.preview: return {}
			for i in 8:
				if Rect2(20 + (i % 4) * 77, 22 + (i / 4) * 118, 61, 100).has_point(point): return {"action": "cell", "index": i}
		"draft":
			for i in 4:
				if Rect2(22 + (i % 2) * 153, 20 + (i / 2) * 119, 134, 102).has_point(point): return {"action": "inspect", "index": i}
		"cycle":
			for i in 5:
				var p := Vector2(size.x * 0.5, 132) + Vector2.UP.rotated(i * TAU / 5.0) * 88
				if point.distance_to(p) <= 28: return {"action": "cell", "index": i}
		"numbers":
			for i in 6:
				if point.distance_to(Vector2(65 + (i % 3) * 105, 95 + (i / 3) * 85)) <= 34: return {"action": "cell", "index": i}
	return {}

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		_hover = event.position
		queue_redraw()
	elif event is InputEventMouseButton and event.pressed and event.button_index in [MOUSE_BUTTON_LEFT, MOUSE_BUTTON_RIGHT]:
		var target := action_at(event.position, event.button_index == MOUSE_BUTTON_RIGHT)
		if target.is_empty(): return
		accept_event()
		if target.action == "inspect": inspected.emit(int(target.index))
		else: interacted.emit(String(target.action), int(target.index))

func _grid_point(cell: int) -> Vector2:
	return Vector2(size.x * 0.5 - 88 + (cell % 5) * 44, 42 + (cell / 5) * 44)

func _panel(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(9)
	style.set_border_width_all(1)
	style.border_color = GOLD.darkened(0.6)
	return style

func _line(point: Vector2, yang: bool, color: Color) -> void:
	_prop("yang" if yang else "yin", Rect2(point + Vector2(0, -8), Vector2(68, 16)))
	# A small state dot identifies the changed column without recoloring the art.
	if color == BLUE: draw_circle(point + Vector2(75, 0), 2, BLUE)

func _dots(point: Vector2, count: int, _color: Color) -> void:
	if count == 0: _text(point, "?", MUTED)
	elif count == 1: _prop("bead", Rect2(point - Vector2(7, 7), Vector2(14, 14)))
	else:
		_prop("bead", Rect2(point + Vector2(-17, -7), Vector2(14, 14)))
		_prop("bead", Rect2(point + Vector2(3, -7), Vector2(14, 14)))

func symbol_labels() -> Array[String]:
	var keys: Array = {
		"suits": ["cups", "swords", "batons", "coins"],
		"story": ["boat", "key", "letter", "tree"],
		"oracle": ["moon", "lamp", "gate", "seed"],
		"astro": ["sun", "moon", "mercury", "venus"]
	}.get(engine.config.variant, ["cups", "swords", "batons", "coins"])
	var result: Array[String] = []
	for key in keys: result.append(_t(key))
	return result

func _emblem(point: Vector2, index: int) -> void:
	_prop(Art.suit(engine.config, index), Rect2(point - Vector2(29, 33), Vector2(58, 66)))
