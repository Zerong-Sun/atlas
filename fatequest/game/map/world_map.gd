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
var _fog: ColorRect
var _mask_tex: ImageTexture
var _mask_img: Image

signal city_clicked(city: Dictionary)


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
	current_city = city_id
	revealed = p_revealed
	_update_mask()
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
		_fog.material = mat
		add_child(_fog)
	_fog.position = projection.origin
	_fog.size = Vector2(projection.width, projection.height)
	_update_mask()


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

func _draw() -> void:
	if projection == null:
		return
	var rect := Rect2(projection.origin, Vector2(projection.width, projection.height))

	var vellum := MapArt.tex("map-vellum-tile")
	if vellum != null:
		draw_texture_rect(vellum, rect, true, Color(1, 1, 1, 1))
	else:
		draw_rect(rect, Color("d9c9a3"))

	_draw_mountains()
	_draw_routes()
	_draw_cities()
	_draw_wind_heads(rect)


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


## Stretches the brush texture along the segment, rotated to match. Godot has no
## "draw textured line", so the quad is built by hand from the segment's angle.
func _draw_brush_line(brush: Texture2D, a: Vector2, b: Vector2, width: float,
		alpha: float, kind: String) -> void:
	var d := b - a
	var len := d.length()
	if len < 1.0:
		return
	var xf := Transform2D(d.angle(), a)
	draw_set_transform_matrix(xf)
	var tint := Color(0.42, 0.30, 0.18, alpha)      # brown ink for land
	if kind == "sea":
		tint = Color(0.20, 0.38, 0.52, alpha)       # blue ink for sea lanes
	elif kind == "coastal":
		tint = Color(0.28, 0.42, 0.38, alpha)
	draw_texture_rect(brush, Rect2(Vector2(0, -width * 0.5), Vector2(len, width)),
		false, tint)
	draw_set_transform_matrix(Transform2D.IDENTITY)


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
		if _labels_visible and k >= 2:
			var label := I18n.t(c.get("name", ""))
			var off := Vector2(-14, 8) if tier == "station" else Vector2(-18, 11)
			# Cheap legibility pass: dark text over busy vellum needs a halo.
			draw_string(font, pos + off + Vector2(1, 1), label,
				HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.94, 0.90, 0.80, 0.85))
			draw_string(font, pos + off, label,
				HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.20, 0.14, 0.08))


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
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var local := to_local(event.position)
		var best: Dictionary = {}
		var best_d := 16.0
		for c in cities:
			var d: float = _city_pos.get(c.get("id", ""), Vector2(-9999, -9999)).distance_to(local)
			if d < best_d:
				best_d = d
				best = c
		if not best.is_empty():
			city_clicked.emit(best)


func toggle_labels() -> void:
	_labels_visible = not _labels_visible
	queue_redraw()
