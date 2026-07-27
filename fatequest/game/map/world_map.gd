extends Node2D

## The map, drawn as a mappa mundi (GDD §5.3) rather than as dots.
##
## Fog is NOT decoration and NOT a render cache: `revealed` lives in WorldState
## and is written only through reveal_map effects, because GDD P2 makes "the map
## comes from asking" a rule of the world. An unrevealed city is a blot of ink,
## never a name.
##
## Every texture is optional. If art is missing the map falls back to the
## primitives it drew before — a missing file must never break the world view.

const MASK_W := 192
const MASK_H := 96
## How far a known place clears the ink, in mask pixels. Roughly a region, not a
## pinprick: knowing Zayton means knowing you are on the Fukien coast.
const CLEAR_RADIUS := 9.0

var projection: MapProjection
var cities: Array = []
var routes: Array = []
var mountains: Array = []

var current_city: String = ""
var revealed: Dictionary = {}

var _labels_visible := true
var _city_pos: Dictionary = {}

# ------------------------------------------------------------------- camera
# Without zoom and pan a 142-degree-wide world on a 1300px strip is unreadable:
# the Grand Canal corridor alone packs fourteen cities into ninety pixels.
const ZOOM_MIN := 1.0
const ZOOM_MAX := 6.0
var zoom: float = 1.0
var pan: Vector2 = Vector2.ZERO
var _dragging := false
var _drag_from := Vector2.ZERO
var _pan_from := Vector2.ZERO
signal view_changed
var _fog: ColorRect
var _mask_tex: ImageTexture
var _mask_prev_tex: ImageTexture
var _mask_img: Image
var _mask_prev_img: Image
var _fog_tween: Tween
var _reveal_blend: float = 1.0

## N2 M2 — progressive route stroke while travelling.
var _route_draw: Dictionary = {}  # {from, to, kind, progress 0..1, trunk}
var _route_tween: Tween

signal city_clicked(city: Dictionary)
signal route_draw_finished


func setup(p: MapProjection, city_records: Array, route_records: Array = [],
		mountain_records: Array = []) -> void:
	projection = p
	cities = city_records
	routes = route_records
	mountains = mountain_records
	_city_pos.clear()
	for c in cities:
		var co: Array = c.get("coord", [0, 0])
		_city_pos[c.get("id", "")] = p.to_view(float(co[0]), float(co[1]))
	_ensure_fog()
	queue_redraw()


func set_current(city_id: String, p_revealed: Dictionary) -> void:
	var changed := city_id != current_city or not _revealed_equal(revealed, p_revealed)
	current_city = city_id
	revealed = p_revealed
	if changed:
		_animate_fog_reveal()
	else:
		_update_mask()
	queue_redraw()


func _revealed_equal(a: Dictionary, b: Dictionary) -> bool:
	if a.size() != b.size():
		return false
	for k in b:
		if int(a.get(k, -1)) != int(b[k]):
			return false
	return true


## N2 M1 — dissolve the wash from the previous mask into the current one.
func _animate_fog_reveal() -> void:
	if _fog == null or projection == null:
		_update_mask()
		return
	# Snapshot the current wash as "previous" before rebuilding.
	if _mask_img != null:
		_mask_prev_img = _mask_img.duplicate()
		if _mask_prev_tex == null:
			_mask_prev_tex = ImageTexture.create_from_image(_mask_prev_img)
		else:
			_mask_prev_tex.update(_mask_prev_img)
		_fog.material.set_shader_parameter("mask_prev", _mask_prev_tex)
	_update_mask()
	_reveal_blend = 0.0
	_fog.material.set_shader_parameter("reveal_blend", 0.0)
	if _fog_tween != null and _fog_tween.is_valid():
		_fog_tween.kill()
	var seconds := Motion.dur(0.85, Motion.Kind.FADE)
	if seconds <= 0.02:
		_reveal_blend = 1.0
		_fog.material.set_shader_parameter("reveal_blend", 1.0)
		return
	_fog_tween = create_tween()
	_fog_tween.tween_method(_set_reveal_blend, 0.0, 1.0, seconds)


func _set_reveal_blend(v: float) -> void:
	_reveal_blend = v
	if _fog != null and _fog.material != null:
		_fog.material.set_shader_parameter("reveal_blend", v)


## N2 M2 — stroke a road from A to B over `seconds` (scaled by travel days).
## Returns immediately; emits `route_draw_finished` when done.
func animate_route(from_id: String, to_id: String, days: int = 7,
		kind: String = "land", trunk: bool = false) -> void:
	if not _city_pos.has(from_id) or not _city_pos.has(to_id):
		route_draw_finished.emit()
		return
	_route_draw = {
		"from": from_id,
		"to": to_id,
		"kind": kind,
		"trunk": trunk,
		"progress": 0.0,
	}
	if _route_tween != null and _route_tween.is_valid():
		_route_tween.kill()
	# Longer journeys take a touch longer to draw — capped so it never stalls.
	var seconds := Motion.dur(clampf(0.35 + float(days) * 0.04, 0.45, 1.4),
		Motion.Kind.MOVE)
	if not Motion.allows(Motion.Kind.MOVE) or seconds <= 0.02:
		_route_draw["progress"] = 1.0
		queue_redraw()
		route_draw_finished.emit()
		_route_draw.clear()
		return
	_route_tween = create_tween()
	_route_tween.tween_method(_set_route_progress, 0.0, 1.0, seconds)
	_route_tween.finished.connect(func():
		route_draw_finished.emit()
		_route_draw.clear()
		queue_redraw())


func _set_route_progress(v: float) -> void:
	if _route_draw.is_empty():
		return
	_route_draw["progress"] = v
	queue_redraw()


## 0 unknown · 1 heard of · 2 described · 3 fully known.
## Where you stand is always fully known — you are looking at it.
func intel(id: String) -> int:
	if id == current_city:
		return 3
	return int(revealed.get(id, 0))


# ---------------------------------------------------------------------- fog

func _ensure_fog() -> void:
	var ink := MapArt.tex("map-fog-ink")
	if ink == null or projection == null:
		return
	if _fog == null:
		_fog = ColorRect.new()
		_fog.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var mat := ShaderMaterial.new()
		var sh := load("res://game/shaders/fog.gdshader")
		if sh == null:
			return
		mat.shader = sh
		mat.set_shader_parameter("ink", ink)
		mat.set_shader_parameter("reveal_blend", 1.0)
		_fog.material = mat
		add_child(_fog)
	_fog.position = projection.origin
	_fog.size = Vector2(projection.width, projection.height)
	_update_mask()
	# Seed previous mask so the first dissolve has a valid sampler.
	if _mask_img != null and _mask_prev_tex == null:
		_mask_prev_img = _mask_img.duplicate()
		_mask_prev_tex = ImageTexture.create_from_image(_mask_prev_img)
		_fog.material.set_shader_parameter("mask_prev", _mask_prev_tex)


## Paints the revealed mask from world state. Low resolution on purpose: this is
## a wash of ink, not a stencil, and a 192x96 image costs nothing to rebuild.
func _update_mask() -> void:
	if _fog == null or projection == null:
		return
	if _mask_img == null:
		_mask_img = Image.create(MASK_W, MASK_H, false, Image.FORMAT_RF)
	_mask_img.fill(Color(0, 0, 0, 1))

	for c in cities:
		var cid := String(c.get("id", ""))
		var k := intel(cid)
		if k <= 0:
			continue
		var pos: Vector2 = _city_pos.get(cid, Vector2.ZERO)
		var u := (pos.x - projection.origin.x) / maxf(projection.width, 1.0)
		var v := (pos.y - projection.origin.y) / maxf(projection.height, 1.0)
		# Better-known places clear a wider circle.
		_stamp(u * MASK_W, v * MASK_H, CLEAR_RADIUS * (0.7 + 0.22 * float(k)))

	for r in routes:
		if intel(String(r.get("id", ""))) <= 0:
			continue
		var a: Vector2 = _city_pos.get(r.get("from", ""), Vector2.ZERO)
		var b: Vector2 = _city_pos.get(r.get("to", ""), Vector2.ZERO)
		if a == Vector2.ZERO or b == Vector2.ZERO:
			continue
		for t in range(0, 13):
			var f := float(t) / 12.0
			var p := a.lerp(b, f)
			var pu := (p.x - projection.origin.x) / maxf(projection.width, 1.0)
			var pv := (p.y - projection.origin.y) / maxf(projection.height, 1.0)
			_stamp(pu * MASK_W, pv * MASK_H, CLEAR_RADIUS * 0.55)

	if _mask_tex == null:
		_mask_tex = ImageTexture.create_from_image(_mask_img)
	else:
		_mask_tex.update(_mask_img)
	_fog.material.set_shader_parameter("mask", _mask_tex)


func _stamp(cx: float, cy: float, radius: float) -> void:
	var r := int(ceil(radius))
	for y in range(maxi(0, int(cy) - r), mini(MASK_H, int(cy) + r + 1)):
		for x in range(maxi(0, int(cx) - r), mini(MASK_W, int(cx) + r + 1)):
			var d := Vector2(float(x) - cx, float(y) - cy).length()
			if d > radius:
				continue
			var v := 1.0 - (d / radius)
			var cur := _mask_img.get_pixel(x, y).r
			_mask_img.set_pixel(x, y, Color(maxf(cur, v), 0, 0, 1))


# --------------------------------------------------------------------- draw

## Screen point -> map point, so hit-testing matches what is drawn.
func to_map(screen: Vector2) -> Vector2:
	return (screen - projection.origin - pan) / zoom + projection.origin


func to_screen(map_p: Vector2) -> Vector2:
	return (map_p - projection.origin) * zoom + projection.origin + pan


func set_zoom(z: float, focus: Vector2) -> void:
	var before := to_map(focus)
	zoom = clampf(z, ZOOM_MIN, ZOOM_MAX)
	# Keep the point under the cursor pinned while zooming.
	pan = focus - projection.origin - (before - projection.origin) * zoom
	_clamp_pan()
	_sync_fog()
	queue_redraw()
	view_changed.emit()


func nudge(delta: Vector2) -> void:
	pan += delta
	_clamp_pan()
	_sync_fog()
	queue_redraw()
	view_changed.emit()


## Never let the vellum pull away from the frame.
func _clamp_pan() -> void:
	var w: float = projection.width
	var h: float = projection.height
	var slack_x: float = maxf(0.0, w * zoom - w)
	var slack_y: float = maxf(0.0, h * zoom - h)
	pan.x = clampf(pan.x, -slack_x, 0.0)
	pan.y = clampf(pan.y, -slack_y, 0.0)


func center_on(city_id: String) -> void:
	if not _city_pos.has(city_id):
		return
	var p: Vector2 = _city_pos[city_id]
	var mid := projection.origin + Vector2(projection.width, projection.height) * 0.5
	pan = mid - projection.origin - (p - projection.origin) * zoom
	_clamp_pan()
	_sync_fog()
	queue_redraw()
	view_changed.emit()


## The fog is a child Control, so it has to follow the same transform by hand.
func _sync_fog() -> void:
	if _fog == null:
		return
	_fog.position = projection.origin + pan
	_fog.size = Vector2(projection.width, projection.height) * zoom


func _draw() -> void:
	if projection == null:
		return
	var o: Vector2 = projection.origin
	draw_set_transform(o + pan - o * zoom, 0.0, Vector2(zoom, zoom))
	var rect := Rect2(o, Vector2(projection.width, projection.height))

	var vellum := MapArt.tex("map-vellum-tile")
	if vellum != null:
		draw_texture_rect(vellum, rect, true, Color(1, 1, 1, 1))
	else:
		draw_rect(rect, Color("d9c9a3"))

	_draw_mountains()
	_draw_routes()
	_draw_ornaments(rect)
	_draw_cities()
	_draw_wind_heads(rect)
	_draw_border(rect)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## Decorative beasts, forests and seas — sparse enough not to crowd cities.
func _draw_ornaments(rect: Rect2) -> void:
	var placements := [
		{"stem": "beast-whale", "u": 0.18, "v": 0.72, "s": 38.0},
		{"stem": "beast-serpent", "u": 0.62, "v": 0.78, "s": 34.0},
		{"stem": "beast-roc", "u": 0.78, "v": 0.28, "s": 32.0},
		{"stem": "beast-griffin", "u": 0.42, "v": 0.22, "s": 30.0},
		{"stem": "forest", "u": 0.55, "v": 0.38, "s": 28.0},
		{"stem": "reef", "u": 0.30, "v": 0.68, "s": 26.0},
		{"stem": "sea", "u": 0.12, "v": 0.55, "s": 40.0},
		{"stem": "river", "u": 0.70, "v": 0.48, "s": 28.0},
		{"stem": "rose", "u": 0.92, "v": 0.88, "s": 44.0},
		{"stem": "shrine", "u": 0.48, "v": 0.55, "s": 22.0},
	]
	for p in placements:
		var t := MapArt.map_ornament(String(p["stem"]))
		if t == null:
			continue
		var s: float = p["s"]
		var pos := Vector2(
			rect.position.x + rect.size.x * float(p["u"]),
			rect.position.y + rect.size.y * float(p["v"]))
		draw_texture_rect(t, Rect2(pos - Vector2(s, s) * 0.5, Vector2(s, s)),
			false, Color(1, 1, 1, 0.28))

	# Culture cartouches in the four corners of the known world.
	var orns := [
		{"stem": "orn-chr", "pos": rect.position + Vector2(48, 48)},
		{"stem": "orn-isl", "pos": Vector2(rect.end.x - 48, rect.position.y + 48)},
		{"stem": "orn-con", "pos": Vector2(rect.end.x - 48, rect.end.y - 48)},
		{"stem": "orn-mazu", "pos": Vector2(rect.position.x + 48, rect.end.y - 48)},
	]
	for o in orns:
		var t2 := MapArt.map_ornament(String(o["stem"]))
		if t2 == null:
			continue
		var sz := Vector2(36, 36)
		draw_texture_rect(t2, Rect2(o["pos"] - sz * 0.5, sz), false, Color(1, 1, 1, 0.35))


func _draw_border(rect: Rect2) -> void:
	var border := MapArt.map_ornament("border")
	if border == null:
		return
	# Nine-slice-ish: stretch the border frame around the map plate.
	draw_texture_rect(border, Rect2(rect.position - Vector2(8, 8),
		rect.size + Vector2(16, 16)), false, Color(1, 1, 1, 0.22))


func _draw_mountains() -> void:
	for m in mountains:
		var pts: Array = m.get("points", [])
		if pts.is_empty():
			continue
		var peak := float(m.get("peak_m", 1000.0))
		var icon := MapArt.mountain_icon(String(m.get("name", "")), peak)
		if icon == null:
			continue
		# Relief is drawn in SIDE elevation along the spine (GDD §5.3 is explicit
		# that this is not a top-down map), so the range reads as a wall to cross.
		var step := maxi(1, int(pts.size() / 6))
		var i := 0
		while i < pts.size():
			var p: Array = pts[i]
			var pos := projection.to_view(float(p[0]), float(p[1]))
			var h := clampf(14.0 + peak / 340.0, 15.0, 34.0)
			var w := h * 1.6
			draw_texture_rect(icon, Rect2(pos - Vector2(w * 0.5, h * 0.82),
				Vector2(w, h)), false, Color(1, 1, 1, 0.85))
			i += step


func _draw_routes() -> void:
	for r in routes:
		var a: Vector2 = _city_pos.get(r.get("from", ""), Vector2.ZERO)
		var b: Vector2 = _city_pos.get(r.get("to", ""), Vector2.ZERO)
		if a == Vector2.ZERO or b == Vector2.ZERO:
			continue
		# A road you have not heard of is not drawn at all. This is the whole of
		# P2: the world does not unfold in advance.
		var seen := maxi(intel(String(r.get("id", ""))),
			mini(intel(String(r.get("from", ""))), intel(String(r.get("to", "")))))
		if seen <= 0:
			continue

		var kind := String(r.get("kind", "land"))
		var is_trunk: bool = r.get("trunk", false)
		var alpha := 0.55 + 0.15 * float(seen)
		var brush := MapArt.route_brush(kind)
		var width := (13.0 if is_trunk else 9.0)

		if brush != null:
			_draw_brush_line(brush, a, b, width, alpha, kind)
		else:
			var col := Color("2f6f8f", alpha) if kind == "sea" else \
				(Color("4f7f6f", alpha) if kind == "coastal" else Color("7a5a34", alpha * 0.8))
			draw_line(a, b, col, 3.0 if is_trunk else 1.0)

	# N2 M2 — the stroke currently being drawn on departure.
	if not _route_draw.is_empty():
		var fa: Vector2 = _city_pos.get(String(_route_draw.get("from", "")), Vector2.ZERO)
		var fb: Vector2 = _city_pos.get(String(_route_draw.get("to", "")), Vector2.ZERO)
		var prog := float(_route_draw.get("progress", 0.0))
		if fa != Vector2.ZERO and fb != Vector2.ZERO and prog > 0.001:
			var mid := fa.lerp(fb, prog)
			var kind2 := String(_route_draw.get("kind", "land"))
			var brush2 := MapArt.route_brush(kind2)
			var w2 := 14.0 if bool(_route_draw.get("trunk", false)) else 11.0
			if brush2 != null:
				_draw_brush_line(brush2, fa, mid, w2, 0.95, kind2)
			else:
				draw_line(fa, mid, Color("b04a2a", 0.9), 3.0)


## Stretches the brush texture along the segment, rotated to match. Godot has no
## "draw textured line", so the quad is built by hand from the segment's angle.
func _draw_brush_line(brush: Texture2D, a: Vector2, b: Vector2, width: float,
		alpha: float, kind: String) -> void:
	var d := b - a
	var len := d.length()
	if len < 1.0:
		return
	var o: Vector2 = projection.origin
	var cam := Transform2D(0.0, Vector2(zoom, zoom), 0.0, o + pan - o * zoom)
	draw_set_transform_matrix(cam * Transform2D(d.angle(), a))
	var tint := Color(0.42, 0.30, 0.18, alpha)      # brown ink for land
	if kind == "sea":
		tint = Color(0.20, 0.38, 0.52, alpha)       # blue ink for sea lanes
	elif kind == "coastal":
		tint = Color(0.28, 0.42, 0.38, alpha)
	draw_texture_rect(brush, Rect2(Vector2(0, -width * 0.5), Vector2(len, width)),
		false, tint)
	var o2: Vector2 = projection.origin
	draw_set_transform_matrix(Transform2D(0.0, Vector2(zoom, zoom), 0.0, o2 + pan - o2 * zoom))


func _draw_cities() -> void:
	var font := ThemeDB.fallback_font
	for c in cities:
		var cid := String(c.get("id", ""))
		var pos: Vector2 = _city_pos.get(cid, Vector2.ZERO)
		var k := intel(cid)

		if k <= 0:
			draw_circle(pos, 2.0, Color(0.42, 0.36, 0.28, 0.30))
			continue

		var tier := String(c.get("tier", "station"))
		var icon: Texture2D = null
		if MapArt.has_city_icon(tier):
			icon = MapArt.city_icon(String(c.get("culture", "east_asia")), tier)

		if icon != null:
			var scale := 0.17 if tier == "metropolis" else (0.13 if tier == "city" else 0.16)
			var sz := icon.get_size() * scale
			draw_texture_rect(icon, Rect2(pos - Vector2(sz.x * 0.5, sz.y * 0.86), sz),
				false, Color(1, 1, 1, 0.55 + 0.15 * float(k)))
		else:
			draw_circle(pos, 3.0, Color("6f5136", 0.55 + 0.15 * float(k)))

		if cid == current_city:
			draw_arc(pos, 13.0, 0, TAU, 28, Color("b04a2a", 0.9), 2.0)

		# Name it only once you know more than its existence.
		# Below tier city, only label once zoomed in — otherwise 102 names collide.
		var label_ok := k >= 2 and (tier in ["metropolis", "city"] or zoom >= 2.2)
		if _labels_visible and label_ok:
			var label := I18n.t(c.get("name", ""))
			var off := Vector2(-14, 8) if tier == "station" else Vector2(-18, 11)
			# Cheap legibility pass: dark text over busy vellum needs a halo.
			draw_string(font, pos + off + Vector2(1, 1), label,
				HORIZONTAL_ALIGNMENT_LEFT, -1, UiScale.map_label(), Color(0.97, 0.94, 0.86, 0.92))
			draw_string(font, pos + off, label,
				HORIZONTAL_ALIGNMENT_LEFT, -1, UiScale.map_label(), Palette.ink())


func _draw_wind_heads(rect: Rect2) -> void:
	var placements := {
		"n": Vector2(rect.position.x + rect.size.x * 0.5, rect.position.y + 34),
		"s": Vector2(rect.position.x + rect.size.x * 0.5, rect.end.y - 34),
		"w": Vector2(rect.position.x + 34, rect.position.y + rect.size.y * 0.5),
		"e": Vector2(rect.end.x - 34, rect.position.y + rect.size.y * 0.5),
	}
	for dir in placements:
		var t := MapArt.wind_head(dir)
		if t == null:
			continue
		var s := Vector2(52, 52)
		draw_texture_rect(t, Rect2(placements[dir] - s * 0.5, s), false,
			Color(1, 1, 1, 0.30))


# -------------------------------------------------------------------- input

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			set_zoom(zoom * 1.18, to_local(mb.position))
			return
		if mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			set_zoom(zoom / 1.18, to_local(mb.position))
			return
		if mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed:
				_dragging = true
				_drag_from = mb.position
				_pan_from = pan
			else:
				_dragging = false
				# A click that did not drag is a selection, not a pan.
				if _drag_from.distance_to(mb.position) < 5.0:
					_pick(to_map(to_local(mb.position)))
	elif event is InputEventMouseMotion and _dragging:
		pan = _pan_from + (event.position - _drag_from)
		_clamp_pan()
		_sync_fog()
		queue_redraw()
		view_changed.emit()


func _pick(map_p: Vector2) -> void:
	var best: Dictionary = {}
	# Hit radius shrinks as you zoom in, so dense clusters become selectable.
	var best_d := 18.0 / maxf(zoom, 1.0)
	for c in cities:
		var d: float = _city_pos.get(c.get("id", ""), Vector2(-9999, -9999)).distance_to(map_p)
		if d < best_d:
			best_d = d
			best = c
	if not best.is_empty():
		city_clicked.emit(best)


func toggle_labels() -> void:
	_labels_visible = not _labels_visible
	queue_redraw()
