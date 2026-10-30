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
var coastlines: Array = []
var _land_mesh: ArrayMesh
var rivers: Array = []
var seas: Array = []
var _vector_records: Dictionary = {}

var current_city: String = ""
var revealed: Dictionary = {}

var chrome_top := 58.0
var label_exclusions: Array[Rect2] = []
var _labels_visible := true
var _city_pos: Dictionary = {}
var _focused_city := ""
## Greedily-placed label rects from the last draw, in map space. `_pick` hits
## against them so a readable name is a clickable target.
var _label_hits: Array = []
## Projected geometry and texture choices are immutable between setup calls.
## Keeping them out of _draw matters while a route tween redraws every frame.
var _mountain_visuals: Array = []
var _route_visuals: Array = []
var _city_visuals: Array = []
var _map_font: Font
var _map_font_lang := ""
var _tiles: SlippyMapTiles
var _tile_attribution: Label

# ------------------------------------------------------------------- camera
# Without zoom and pan a 142-degree-wide world on a 1300px strip is unreadable:
# the Grand Canal corridor alone packs fourteen cities into ninety pixels.
const ZOOM_MIN := 1.0
const ZOOM_MAX := 16.0
const LOCAL_ZOOM := 6.0
var zoom: float = 1.0
var _zoom_target := 1.0
var _camera_tween: Tween
var journey_legs: Array = []
var pan: Vector2 = Vector2.ZERO
var _dragging := false
var _drag_from := Vector2.ZERO
var _pan_from := Vector2.ZERO
var _touches: Dictionary = {}
var _touch_starts: Dictionary = {}
var _pinch_distance := 0.0
var _touch_was_multitouch := false
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
		mountain_records: Array = [], vector_records: Dictionary = {}) -> void:
	projection = p
	cities = city_records
	routes = route_records
	mountains = mountain_records
	_vector_records = vector_records.duplicate(true)
	_rebuild_projected_geometry()
	_ensure_real_map_tiles()
	_ensure_fog()
	_ensure_tile_attribution()
	queue_redraw()


## Rebuilds every cached lon/lat overlay after the drawable viewport changes.
## The projection object is shared with Main and mutates during dock resizing;
## without this pass, fresh tiles move while cities and routes remain at their
## old pixel coordinates.
func on_projection_changed() -> void:
	if projection == null:
		return
	_rebuild_projected_geometry()
	_clamp_pan()
	_sync_fog()
	_refresh_tiles()
	queue_redraw()
	view_changed.emit()


func _rebuild_projected_geometry() -> void:
	coastlines = _project_lines(_vector_records.get("coastlines", []))
	_cache_land()
	rivers.clear()
	for river in _vector_records.get("rivers", []):
		rivers.append({
			"name": String(river.get("name", "")),
			"lines": _project_lines(river.get("lines", [])),
		})
	seas.clear()
	for sea in _vector_records.get("seas", []):
		var coord: Array = sea.get("coord", [0, 0])
		seas.append({
			"name": String(sea.get("name", "")),
			"pos": projection.to_view(float(coord[0]), float(coord[1])),
		})
	_city_pos.clear()
	for c in cities:
		var co: Array = c.get("coord", [0, 0])
		_city_pos[c.get("id", "")] = projection.to_view(float(co[0]), float(co[1]))
	_cache_visuals()


func _cache_land() -> void:
	var vertices := PackedVector3Array()
	var indices := PackedInt32Array()
	for ring in _project_lines(_vector_records.get("land", [])):
		var polygon: PackedVector2Array = ring
		if polygon[0].is_equal_approx(polygon[-1]):
			polygon.resize(polygon.size() - 1)
		var triangles := Geometry2D.triangulate_polygon(polygon)
		if triangles.is_empty():
			continue
		var base := vertices.size()
		for point in polygon:
			vertices.append(Vector3(point.x, point.y, 0))
		for index in triangles:
			indices.append(base + index)
	_land_mesh = ArrayMesh.new()
	if vertices.is_empty():
		return
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_INDEX] = indices
	_land_mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)


func center_at(geo: Vector2) -> void:
	_stop_camera()
	var mid := projection.origin + Vector2(projection.width, projection.height) * 0.5
	pan = mid - projection.origin - (projection.to_view(geo.x, geo.y) - projection.origin) * zoom
	_clamp_pan()
	_sync_fog()
	_refresh_tiles()
	queue_redraw()
	view_changed.emit()


func _ensure_real_map_tiles() -> void:
	if _tiles == null:
		_tiles = preload("res://game/map/slippy_map_tiles.gd").new()
		add_child(_tiles)
		_tiles.tiles_changed.connect(queue_redraw)
	# SlippyMapTiles reads its config in _ready(), which has run immediately
	# after add_child in a live tree. A deferred refresh also covers setup in a
	# node that has not entered the tree yet (benchmarks instantiate this way).
	_refresh_tiles()
	call_deferred("_refresh_tiles")


func _refresh_tiles() -> void:
	if _tiles != null and projection != null:
		_tiles.update_view(projection, zoom, pan)
	if _tile_attribution == null:
		_ensure_tile_attribution()
	else:
		_sync_tile_attribution()


func _ensure_tile_attribution() -> void:
	if _tiles == null or not _tiles.enabled or _tiles.attribution.is_empty():
		return
	if _tile_attribution == null:
		_tile_attribution = Label.new()
		_tile_attribution.name = "MapAttribution"
		_tile_attribution.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_tile_attribution.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		_tile_attribution.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		_tile_attribution.add_theme_color_override("font_color", Color(0.08, 0.08, 0.08, 0.94))
		_tile_attribution.add_theme_color_override("font_shadow_color", Color(1, 1, 1, 0.92))
		_tile_attribution.add_theme_constant_override("shadow_offset_x", 1)
		_tile_attribution.add_theme_constant_override("shadow_offset_y", 1)
		add_child(_tile_attribution)
	_tile_attribution.text = _tiles.attribution
	_sync_tile_attribution()


func _sync_tile_attribution() -> void:
	if _tile_attribution == null or projection == null:
		return
	_tile_attribution.position = projection.origin \
		+ Vector2(projection.width - 450.0, projection.height - 26.0)
	_tile_attribution.size = Vector2(440.0, 24.0)
	_tile_attribution.add_theme_font_size_override("font_size", maxi(UiScale.ui() - 4, 9))


func _project_lines(raw_lines: Array) -> Array:
	var out: Array = []
	for raw in raw_lines:
		var points := PackedVector2Array()
		for coord in raw:
			if coord is Array and coord.size() >= 2:
				points.append(projection.to_view(float(coord[0]), float(coord[1])))
		if points.size() >= 2:
			out.append(points)
	return out


func _cache_visuals() -> void:
	_mountain_visuals.clear()
	for mountain in mountains:
		var points: Array = mountain.get("points", [])
		if points.is_empty():
			continue
		var peak := float(mountain.get("peak_m", 1000.0))
		var icon := MapArt.mountain_icon(String(mountain.get("name", "")), peak)
		if icon == null:
			continue
		var height := clampf(14.0 + peak / 340.0, 15.0, 34.0)
		var size := Vector2(height * 1.6, height)
		var step := maxi(1, int(points.size() / 6))
		var index := 0
		while index < points.size():
			var coord: Array = points[index]
			var position := projection.to_view(float(coord[0]), float(coord[1]))
			_mountain_visuals.append({
				"texture": icon,
				"rect": Rect2(position - Vector2(size.x * 0.5, size.y * 0.82), size),
			})
			index += step

	_route_visuals.clear()
	for route in routes:
		var a: Vector2 = _city_pos.get(route.get("from", ""), Vector2.ZERO)
		var b: Vector2 = _city_pos.get(route.get("to", ""), Vector2.ZERO)
		if a == Vector2.ZERO or b == Vector2.ZERO:
			continue
		var kind := String(route.get("kind", "land"))
		_route_visuals.append({
			"record": route,
			"a": a,
			"b": b,
			"kind": kind,
			"trunk": bool(route.get("trunk", false)),
			"brush": MapArt.route_brush(kind),
		})

	_city_visuals.clear()
	for city in cities:
		var tier := String(city.get("tier", "station"))
		var icon: Texture2D = null
		if MapArt.has_city_icon(tier):
			icon = MapArt.city_icon(String(city.get("culture", "east_asia")), tier)
		var icon_size := Vector2.ZERO
		if icon != null:
			var icon_scale := 0.17 if tier == "metropolis" else (
				0.13 if tier == "city" else 0.16)
			icon_size = icon.get_size() * icon_scale
		_city_visuals.append({
			"record": city,
			"position": _city_pos.get(city.get("id", ""), Vector2.ZERO),
			"tier": tier,
			"icon": icon,
			"icon_size": icon_size,
		})


func set_current(city_id: String, p_revealed: Dictionary) -> void:
	var moved := city_id != current_city
	var changed := moved or not _revealed_equal(revealed, p_revealed)
	current_city = city_id
	revealed = p_revealed.duplicate()
	if moved or _focused_city.is_empty() or intel(_focused_city) <= 0:
		_focused_city = city_id
	if moved:
		zoom = LOCAL_ZOOM
		_zoom_target = zoom
		center_on(city_id)
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
## Strokes the travelled route with an ink line. `seconds` lets the caller
## (the departure countdown) drive the pacing so the ink keeps up with the
## day counter; when omitted the length follows the journey's own duration.
func animate_route(from_id: String, to_id: String, days: int = 7,
		kind: String = "land", trunk: bool = false, seconds: float = -1.0) -> void:
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
	# When the caller passes a countdown length, honour it exactly so the ink
	# and the day counter land on "arrived" together.
	var total := seconds if seconds > 0.0 \
		else clampf(0.35 + float(days) * 0.04, 0.45, 1.4)
	var dur := Motion.dur(total, Motion.Kind.MOVE)
	if not Motion.allows(Motion.Kind.MOVE) or dur <= 0.02:
		_route_draw["progress"] = 1.0
		queue_redraw()
		route_draw_finished.emit()
		_route_draw.clear()
		return
	_route_tween = create_tween()
	_route_tween.tween_method(_set_route_progress, 0.0, 1.0, dur)
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
	var ink := MapArt.tex("map-vellum-tile")
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
		mat.set_shader_parameter("max_opacity", 0.20)
		mat.set_shader_parameter("ink_scale", 5.0)
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


func set_zoom(z: float, focus: Vector2, smooth := true) -> void:
	_stop_camera()
	var before := to_map(focus)
	_zoom_target = clampf(z, ZOOM_MIN, ZOOM_MAX)
	if not smooth or Motion.reduce_motion or not is_inside_tree():
		_camera_step(_zoom_target, before, focus)
		return
	_camera_tween = create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	_camera_tween.tween_method(_camera_step.bind(before, focus), zoom, _zoom_target, 0.20)


func _stop_camera() -> void:
	if _camera_tween != null and _camera_tween.is_running():
		_camera_tween.kill()


func _camera_step(value: float, map_focus: Vector2, screen_focus: Vector2) -> void:
	zoom = value
	pan = screen_focus - projection.origin - (map_focus - projection.origin) * zoom
	_clamp_pan()
	_sync_fog()
	_refresh_tiles()
	queue_redraw()
	view_changed.emit()


func reset_local_view() -> void:
	_stop_camera()
	zoom = LOCAL_ZOOM
	_zoom_target = zoom
	center_on(current_city)


func set_journey(legs: Array) -> void:
	journey_legs = legs.duplicate(true)
	queue_redraw()


func nudge(delta: Vector2) -> void:
	_stop_camera()
	pan += delta
	_clamp_pan()
	_sync_fog()
	_refresh_tiles()
	queue_redraw()
	view_changed.emit()


## Never let the vellum pull away from the frame.
func _clamp_pan() -> void:
	var w: float = projection.width
	var h: float = projection.height
	var slack_x: float = maxf(0.0, w * zoom - w)
	var slack_y: float = maxf(0.0, h * zoom - h)
	var margin := 0.45 if zoom > 1.05 else 0.0
	pan.x = clampf(pan.x, -slack_x - w * margin, w * margin)
	pan.y = clampf(pan.y, -slack_y - h * margin, h * margin)


func center_on(city_id: String) -> void:
	_stop_camera()
	if not _city_pos.has(city_id):
		return
	var p: Vector2 = _city_pos[city_id]
	var mid := projection.origin + Vector2(projection.width, projection.height) * 0.5
	pan = mid - projection.origin - (p - projection.origin) * zoom
	_clamp_pan()
	_sync_fog()
	_refresh_tiles()
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
	var viewport := Rect2(Vector2.ZERO, get_viewport_rect().size)
	draw_rect(viewport, Color("bdc9bd"))
	# Paper is a screen surface; never magnify its pixels with the camera.
	var vellum := MapArt.tex("map-vellum-tile")
	if vellum != null:
		draw_texture_rect(vellum, viewport, true, Color(1, 1, 1, 0.18))
	draw_set_transform(o + pan - o * zoom, 0.0, Vector2(zoom, zoom))
	var rect := Rect2(o, Vector2(projection.width, projection.height))

	if _land_mesh != null and _land_mesh.get_surface_count() > 0:
		draw_mesh(_land_mesh, null, Transform2D.IDENTITY, Color("e6d7b7"))
	_draw_real_map_tiles()
	_draw_graticule(rect)
	_draw_worldmap_vectors()
	_draw_mountains()
	_draw_routes()
	_draw_journey()
	_draw_cities()
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	_draw_scale_and_coordinates()


func _draw_real_map_tiles() -> void:
	if _tiles == null or not _tiles.enabled:
		return
	for tile in _tiles.draw_tiles(projection):
		var texture: Texture2D = tile.get("texture")
		var tile_rect: Rect2 = tile.get("rect")
		if texture == null or tile_rect.size.x <= 0.0 or tile_rect.size.y <= 0.0:
			continue
		var region := _clip_tile_to_map(tile_rect, texture.get_size())
		if region.is_empty():
			continue
		# XYZ edge tiles extend beyond the game's geographic bbox. Crop both the
		# destination and source region so they cannot bleed into HUD/dock space.
		# The live cartography remains legible while a light parchment tint keeps
		# the historical city and route overlay visually coherent.
		draw_texture_rect_region(texture, region["destination"], region["source"],
			Color(0.93, 0.90, 0.82, 0.92), false, true)


func _clip_tile_to_map(tile_rect: Rect2, texture_size: Vector2) -> Dictionary:
	var map_rect := Rect2(projection.origin, Vector2(projection.width, projection.height))
	var clipped := tile_rect.intersection(map_rect)
	if clipped.size.x <= 0.0 or clipped.size.y <= 0.0:
		return {}
	return {
		"destination": clipped,
		"source": Rect2(
			(clipped.position - tile_rect.position) / tile_rect.size * texture_size,
			clipped.size / tile_rect.size * texture_size),
	}


func _draw_graticule(rect: Rect2) -> void:
	# A faint geographic scaffold makes zooming readable without turning the
	# parchment into a modern road atlas. Lines are true lon/lat, not decoration.
	var col := Color(0.34, 0.27, 0.18, 0.13 if zoom < 2.0 else 0.20)
	for lon in range(int(ceil(projection.west / 10.0)) * 10,
			int(floor(projection.east / 10.0)) * 10 + 1, 10):
		var a := projection.to_view(float(lon), projection.south)
		var b := projection.to_view(float(lon), projection.north)
		draw_line(a, b, col, 0.65 / zoom, true)
	for lat in range(int(ceil(projection.south / 10.0)) * 10,
			int(floor(projection.north / 10.0)) * 10 + 1, 10):
		var a := projection.to_view(projection.west, float(lat))
		var b := projection.to_view(projection.east, float(lat))
		draw_line(a, b, col, 0.65 / zoom, true)


func _draw_scale_and_coordinates() -> void:
	var font := _label_font()
	draw_string(font, Vector2(projection.origin.x + 12, chrome_top + 22), I18n.t("ui.map.legend"),
		HORIZONTAL_ALIGNMENT_LEFT, -1, maxi(12, UiScale.ui() - 2), Palette.ink_soft())
	var base := projection.origin + Vector2(22, projection.height - 20)
	var focus: Vector2 = _city_pos.get(_focused_city,
		_city_pos.get(current_city, Vector2.ZERO))
	var geo := projection.to_geo(focus) if focus != Vector2.ZERO else Vector2(
		(projection.west + projection.east) * 0.5,
		(projection.south + projection.north) * 0.5)
	var px_per_degree := projection.width / (projection.east - projection.west) * zoom
	var px_per_km := px_per_degree / MapProjection.longitude_km_per_degree(geo.y)
	var distance := 100
	for candidate in [100, 250, 500, 1000, 2000]:
		if float(candidate) * px_per_km <= 150.0:
			distance = candidate
	var length := float(distance) * px_per_km
	draw_line(base, base + Vector2(length, 0), Palette.ink(), 2.0)
	draw_line(base + Vector2(0, -5), base + Vector2(0, 5), Palette.ink(), 2.0)
	draw_line(base + Vector2(length, -5), base + Vector2(length, 5), Palette.ink(), 2.0)
	draw_string(font, base + Vector2(0, -8), "%d km" % distance,
		HORIZONTAL_ALIGNMENT_LEFT, -1, maxi(UiScale.ui() - 2, 10), Palette.ink())
	if focus != Vector2.ZERO:
		var label := "%.1f°%s  %.1f°%s" % [absf(geo.y), "N" if geo.y >= 0 else "S",
			absf(geo.x), "E" if geo.x >= 0 else "W"]
		draw_string(font, projection.origin + Vector2(projection.width - 160,
			projection.height - 38), label, HORIZONTAL_ALIGNMENT_LEFT, -1,
			maxi(UiScale.ui() - 2, 10), Palette.ink_soft())


func _draw_worldmap_vectors() -> void:
	# Geometry is generated by fatequest-worldmap and synced into content/world
	# for export. The textures dress the map; these vectors make it a map.
	for line in coastlines:
		draw_polyline(line, Color(0.24, 0.34, 0.36, 0.62), 1.5 / zoom, true)
	for river in rivers:
		for line in river.get("lines", []):
			draw_polyline(line, Color(0.20, 0.38, 0.48, 0.42), 1.0 / zoom, true)


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
	for visual in _mountain_visuals:
		var rect: Rect2 = visual.get("rect")
		var reduced := rect.size / sqrt(zoom)
		draw_texture_rect(visual.get("texture"), Rect2(rect.get_center() - reduced * 0.5, reduced),
			false, Color(1, 1, 1, 0.45))


func _draw_routes() -> void:
	for visual in _route_visuals:
		var r: Dictionary = visual.get("record", {})
		var a: Vector2 = visual.get("a", Vector2.ZERO)
		var b: Vector2 = visual.get("b", Vector2.ZERO)
		# A road you have not heard of is not drawn at all. This is the whole of
		# P2: the world does not unfold in advance.
		# Knowing both cities does not reveal the road between them. Route intel
		# is independent and only comes from conversation, reading or travel.
		var seen := intel(String(r.get("id", "")))
		if seen <= 0:
			continue

		var kind := String(visual.get("kind", "land"))
		var color := Color("37697b", 0.55) if kind in ["sea", "coastal"] else Color("94734a", 0.55)
		draw_dashed_line(a, b, color, 1.4 / zoom, 6.0 / zoom, true)

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
				_draw_brush_line(brush2, fa, mid, w2 / zoom, 0.95, kind2)
			else:
				draw_line(fa, mid, Color("b04a2a", 0.9), 3.0 / zoom, true)


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


func _draw_journey() -> void:
	# Deduplicate identical directed legs visually; opposite directions retain
	# separate arrowheads offset to their own side of the road.
	var drawn := {}
	for leg in journey_legs:
		var from_id := String(leg.get("from", ""))
		var to_id := String(leg.get("to", ""))
		var key := from_id + ">" + to_id
		if drawn.has(key) or not _city_pos.has(from_id) or not _city_pos.has(to_id):
			continue
		drawn[key] = true
		var a: Vector2 = _city_pos[from_id]
		var b: Vector2 = _city_pos[to_id]
		if a.distance_to(b) < 0.01:
			continue
		var direction := (b - a).normalized()
		var side := direction.orthogonal() * 3.0 / zoom
		draw_line(a + side, b + side, Palette.RED, 2.5 / zoom, true)
		var tip := a.lerp(b, 0.62) + side
		var back := tip - direction * 11.0 / zoom
		draw_colored_polygon(PackedVector2Array([tip, back + direction.orthogonal() * 5.0 / zoom,
			back - direction.orthogonal() * 5.0 / zoom]), Palette.RED)


func _draw_cities() -> void:
	# Geography scales; markers and typography stay in screen pixels.
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	var font := _label_font()
	var label_size := UiScale.map_label()
	var occupied: Array[Vector2] = []
	var ordered := _ordered_cities()
	for visual in ordered:
		var c: Dictionary = visual.get("record", {})
		var cid := String(c.get("id", ""))
		if intel(cid) <= 0:
			continue
		var pos := to_screen(visual.get("position", Vector2.ZERO))
		var icon: Texture2D = visual.get("icon")
		var room := true
		for other in occupied:
			if pos.distance_to(other) < 38:
				room = false
				break
		if room and icon != null:
			var sz := Vector2(36, 36) if cid != current_city else Vector2(42, 42)
			draw_texture_rect(icon, Rect2(pos - Vector2(sz.x * 0.5, sz.y * 0.85), sz), false)
			occupied.append(pos)
		else:
			draw_circle(pos, 3.5, Palette.ink_soft())
		if cid == current_city:
			draw_circle(pos, 5, Palette.RED)
			draw_arc(pos, 20, 0, TAU, 36, Palette.RED, 2, true)
		if cid == _focused_city and cid != current_city:
			draw_arc(pos, 18, 0, TAU, 28, Palette.FOCUS, 2, true)
	_label_hits = _compute_label_hits()
	for hit in _label_hits:
		var map_rect: Rect2 = hit.rect
		var rect := Rect2(to_screen(map_rect.position), map_rect.size * zoom)
		var label := I18n.t(String(hit.label))
		var marker := to_screen(_city_pos[hit.id])
		if marker.distance_to(rect.get_center()) > 35:
			draw_line(marker, rect.get_center(), Palette.ink_soft(), 1, true)
		draw_rect(rect, Palette.panel())
		if hit.id == current_city:
			draw_rect(rect, Palette.RED, false, 1)
		draw_string(font, rect.position + Vector2(5, font.get_ascent(label_size) + 3), label,
			HORIZONTAL_ALIGNMENT_LEFT, -1, label_size, Palette.ink())


func _label_font() -> Font:
	if _map_font == null or _map_font_lang != I18n.lang():
		_map_font = Panels.ui_theme().default_font
		_map_font_lang = I18n.lang()
	return _map_font


func _ordered_cities() -> Array:
	var ordered := _city_visuals.duplicate()
	ordered.sort_custom(func(a, b):
		var ar := _city_rank(a.record)
		var br := _city_rank(b.record)
		return ar > br if ar != br else String(a.record.id) < String(b.record.id))
	return ordered


func _compute_label_hits() -> Array:
	var font := _label_font()
	var label_size := UiScale.map_label()
	var hits: Array = []
	var placed: Array[Rect2] = label_exclusions.duplicate()
	var bounds := Rect2(projection.origin + Vector2(4, 4),
		Vector2(projection.width, projection.height) - Vector2(8, 8))
	# Reserve the actual marker locations as well as previously placed names.
	for visual in _city_visuals:
		if intel(String(visual.record.id)) > 0:
			placed.append(Rect2(to_screen(visual.position) - Vector2(8, 18), Vector2(16, 26)))
	for visual in _ordered_cities():
		var c: Dictionary = visual.record
		var cid := String(c.id)
		if intel(cid) <= 0 or not _labels_visible:
			continue
		if not (c.get("tier", "station") in ["metropolis", "city"] or zoom >= 2.2 or cid == current_city):
			continue
		var pos := to_screen(visual.position)
		if not bounds.has_point(pos):
			continue
		var label := I18n.t(c.get("name", ""))
		var rect := _place_label(font, label_size, pos, label, "current" if cid == current_city else "", placed)
		if rect.size == Vector2.ZERO or not bounds.encloses(rect):
			continue
		placed.append(rect.grow(3))
		hits.append({"id": cid, "label": c.get("name", ""),
			"rect": Rect2(to_map(rect.position), rect.size / zoom)})
	return hits


func _place_label(font: Font, font_size: int, pos: Vector2, label: String,
		tier: String, placed: Array) -> Rect2:
	var text_size := font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size) + Vector2(10, 6)
	var anchors := [Vector2(-text_size.x * 0.5, 12), Vector2(25, -text_size.y * 0.5),
		Vector2(-text_size.x - 25, -text_size.y * 0.5), Vector2(-text_size.x * 0.5, -text_size.y - 38),
		Vector2(25, 12), Vector2(-text_size.x - 25, 12),
		Vector2(-text_size.x - 60, -text_size.y * 0.5), Vector2(60, -text_size.y * 0.5)]
	if tier == "current":
		# At world scale the east-coast corridor and the action rail can occupy
		# every near anchor. The traveller's name must still have a readable home.
		for distance in [80.0, 120.0, 160.0, 200.0]:
			for direction in [Vector2.LEFT, Vector2.UP, Vector2.DOWN, Vector2.RIGHT,
				Vector2(-1, -1), Vector2(-1, 1), Vector2(1, -1), Vector2(1, 1)]:
				anchors.append(direction.normalized() * distance - text_size * 0.5)
	var bounds := Rect2(projection.origin, Vector2(projection.width, projection.height))
	for offset in anchors:
		var rect := Rect2(pos + offset, text_size)
		if not bounds.encloses(rect):
			continue
		var blocked := false
		for used in placed:
			if rect.intersects(used):
				blocked = true
				break
		if not blocked:
			return rect
	return Rect2()


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
	handle_map_input(event)


## Public input entry used by Main's transparent map interaction surface.
## Keeping the handling here lets keyboard navigation, mouse, trackpads and
## touch all manipulate the exact same camera state.
func handle_map_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			set_zoom(_zoom_target * 1.18, to_local(mb.position))
			return
		if mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			set_zoom(_zoom_target / 1.18, to_local(mb.position))
			return
		if mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed:
				_stop_camera()
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
		_refresh_tiles()
		queue_redraw()
		view_changed.emit()
	elif event is InputEventMagnifyGesture:
		var magnify := event as InputEventMagnifyGesture
		set_zoom(zoom * magnify.factor, to_local(magnify.position), false)
	elif event is InputEventPanGesture:
		var gesture := event as InputEventPanGesture
		# Godot reports the content travel direction; map dragging follows the
		# fingers, hence the negative delta.
		nudge(-gesture.delta * 24.0)
	elif event is InputEventScreenTouch:
		_handle_touch(event as InputEventScreenTouch)
	elif event is InputEventScreenDrag:
		_handle_touch_drag(event as InputEventScreenDrag)
	elif event is InputEventKey:
		var key := event as InputEventKey
		if not key.pressed or key.echo:
			return
		match key.keycode:
			KEY_LEFT:
				_focus_direction(Vector2.LEFT)
			KEY_RIGHT:
				_focus_direction(Vector2.RIGHT)
			KEY_UP:
				_focus_direction(Vector2.UP)
			KEY_DOWN:
				_focus_direction(Vector2.DOWN)
			KEY_ENTER, KEY_KP_ENTER:
				var city := _city_record(_focused_city)
				if not city.is_empty():
					city_clicked.emit(city)
			KEY_HOME:
				_focused_city = current_city
				center_on(current_city)


func _handle_touch(event: InputEventScreenTouch) -> void:
	if event.pressed:
		_touches[event.index] = event.position
		_touch_starts[event.index] = event.position
		if _touches.size() >= 2:
			_touch_was_multitouch = true
	else:
		var start: Vector2 = _touch_starts.get(event.index, event.position)
		var tap := not _touch_was_multitouch and _touches.size() == 1 \
			and start.distance_to(event.position) < 12.0
		_touches.erase(event.index)
		_touch_starts.erase(event.index)
		if tap:
			_pick(to_map(to_local(event.position)))
	if _touches.size() == 1:
		var points := _touches.values()
		_dragging = event.pressed
		_drag_from = points[0] if event.pressed else event.position
		_pan_from = pan
	elif _touches.size() >= 2:
		_dragging = false
		var points := _touches.values()
		_pinch_distance = (points[0] as Vector2).distance_to(points[1] as Vector2)
	else:
		_dragging = false
		_pinch_distance = 0.0
		_touch_was_multitouch = false


func _handle_touch_drag(event: InputEventScreenDrag) -> void:
	_touches[event.index] = event.position
	if _touches.size() == 1:
		nudge(event.relative)
		return
	if _touches.size() < 2:
		return
	var points := _touches.values()
	var a := points[0] as Vector2
	var b := points[1] as Vector2
	var distance := a.distance_to(b)
	var centre := (a + b) * 0.5
	if _pinch_distance > 1.0:
		set_zoom(zoom * distance / _pinch_distance, to_local(centre), false)
	_pinch_distance = distance


func _pick(map_p: Vector2) -> void:
	var best: Dictionary = {}
	# A placed label is a first-class target: a readable name should be clickable
	# even when the dot itself sits inside a denser neighbour's shadow.
	for hit in _label_hits:
		if (hit.get("rect", Rect2()) as Rect2).has_point(map_p):
			var c := _city_record(String(hit.get("id", "")))
			if not c.is_empty() and _city_rank(c) > _city_rank(best):
				best = c
	# No label hit — nearest revealed dot wins.
	if best.is_empty():
		# Hit radius shrinks as you zoom in, so dense clusters become selectable.
		var best_d := 24.0 / maxf(zoom, 1.0)
		for c in cities:
			var cid := String(c.get("id", ""))
			if intel(cid) <= 0:
				continue
			var d: float = _city_pos.get(c.get("id", ""), Vector2(-9999, -9999)).distance_to(map_p)
			var same_distance := is_equal_approx(d, best_d)
			var higher_rank := _city_rank(c) > _city_rank(best)
			var stable_tie := _city_rank(c) == _city_rank(best) \
				and String(c.get("id", "")) < String(best.get("id", ""))
			if d < best_d or (same_distance and (higher_rank or stable_tie)):
				best_d = d
				best = c
	if not best.is_empty():
		_focused_city = String(best.get("id", ""))
		queue_redraw()
		city_clicked.emit(best)


func _city_record(city_id: String) -> Dictionary:
	for c in cities:
		if String(c.get("id", "")) == city_id and intel(city_id) > 0:
			return c
	return {}


func _city_rank(city: Dictionary) -> int:
	if city.is_empty():
		return -1
	var cid := String(city.get("id", ""))
	var tier_score: int = int(
		{"station": 0, "town": 1, "city": 2, "metropolis": 3}.get(
			String(city.get("tier", "station")), 0))
	return (100 if cid == current_city else 0) + intel(cid) * 10 + int(tier_score)


func _focus_direction(direction: Vector2) -> void:
	if _focused_city.is_empty() or _city_record(_focused_city).is_empty():
		_focused_city = current_city
	var origin: Vector2 = _city_pos.get(_focused_city, _city_pos.get(current_city, Vector2.ZERO))
	var best_id := ""
	var best_score := INF
	for c in cities:
		var cid := String(c.get("id", ""))
		if cid == _focused_city or intel(cid) <= 0:
			continue
		var delta: Vector2 = _city_pos.get(cid, Vector2.ZERO) - origin
		var forward := delta.dot(direction)
		if forward <= 0.0:
			continue
		var perpendicular := absf(delta.cross(direction))
		var score := perpendicular * 3.0 + delta.length()
		if score < best_score:
			best_score = score
			best_id = cid
	if not best_id.is_empty():
		_focused_city = best_id
		queue_redraw()


func toggle_labels() -> void:
	_labels_visible = not _labels_visible
	queue_redraw()
