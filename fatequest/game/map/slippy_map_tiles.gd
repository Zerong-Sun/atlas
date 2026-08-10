class_name SlippyMapTiles
extends Node

## On-demand XYZ raster tile source for the real geographic underlay.
##
## Only tiles intersecting the current viewport are requested. Files are kept
## under user:// for at least seven days, so revisiting a place does not hit the
## community tile service again and an offline session can reuse prior views.

signal tiles_changed

const CONFIG_PATH := "res://content/world/map_tiles.json"
const CACHE_ROOT := "user://map_tiles"
const SECONDS_PER_DAY := 86400

var enabled := false
var attribution := ""
var _url_template := ""
var _user_agent := "FateQuest"
var _min_zoom := 2
var _max_zoom := 7
var _base_zoom := 3
var _cache_seconds := 7 * SECONDS_PER_DAY
var _max_concurrent := 4
var _max_memory_tiles := 192

var _textures: Dictionary = {}
var _texture_order: Array[String] = []
var _queued: Dictionary = {}
var _jobs: Array[Dictionary] = []
var _active := 0
var _visible_keys: Dictionary = {}
var _tile_zoom := 3


func _ready() -> void:
	_load_config()
	# Headless tests must stay deterministic and never wait on the network. The
	# vector underlay in WorldMap remains the offline/test fallback.
	if DisplayServer.get_name() == "headless":
		enabled = false


func _load_config() -> void:
	var file := FileAccess.open(CONFIG_PATH, FileAccess.READ)
	if file == null:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	var config: Dictionary = parsed
	enabled = bool(config.get("enabled", true))
	_url_template = String(config.get("urlTemplate", ""))
	attribution = String(config.get("attribution", ""))
	_user_agent = String(config.get("userAgent", _user_agent))
	_min_zoom = clampi(int(config.get("minZoom", 2)), 0, 19)
	_max_zoom = clampi(int(config.get("maxZoom", 7)), _min_zoom, 19)
	_base_zoom = clampi(int(config.get("baseZoom", 3)), _min_zoom, _max_zoom)
	_cache_seconds = maxi(7, int(config.get("cacheDays", 7))) * SECONDS_PER_DAY
	_max_concurrent = clampi(int(config.get("maxConcurrentRequests", 4)), 1, 8)
	_max_memory_tiles = clampi(int(config.get("maxMemoryTiles", 192)), 32, 512)
	if not _url_template.begins_with("https://") or not _url_template.contains("{z}") \
			or not _url_template.contains("{x}") or not _url_template.contains("{y}"):
		enabled = false
	if attribution.is_empty() or _user_agent.is_empty():
		enabled = false


## Recomputes the small set of tiles intersecting the visible map rectangle.
func update_view(projection: MapProjection, camera_zoom: float, pan: Vector2) -> void:
	if not enabled or projection == null:
		return
	_tile_zoom = clampi(_base_zoom + int(round(log(maxf(camera_zoom, 1.0)) / log(2.0))),
		_min_zoom, _max_zoom)

	# Convert the screen viewport back into untransformed map coordinates. One
	# tile of padding prevents a blank seam during a drag, but nothing beyond
	# the player's immediate view is prefetched.
	var top_left := (projection.origin - projection.origin - pan) / camera_zoom + projection.origin
	var bottom_right := (projection.origin + Vector2(projection.width, projection.height) \
			- projection.origin - pan) / camera_zoom + projection.origin
	var geo_a := projection.to_geo(top_left)
	var geo_b := projection.to_geo(bottom_right)
	var west := clampf(minf(geo_a.x, geo_b.x), projection.west, projection.east)
	var east := clampf(maxf(geo_a.x, geo_b.x), projection.west, projection.east)
	var north := clampf(maxf(geo_a.y, geo_b.y), projection.south, projection.north)
	var south := clampf(minf(geo_a.y, geo_b.y), projection.south, projection.north)

	var count := 1 << _tile_zoom
	# At the fitted world view there is nowhere to pan, so padding would only
	# download off-screen tiles. Add the one-tile seam guard after zooming in.
	var padding := 0 if camera_zoom <= 1.01 else 1
	var x0 := clampi(int(floor(_lon_to_tile_x(west, _tile_zoom))) - padding, 0, count - 1)
	var x1 := clampi(int(floor(_lon_to_tile_x(east, _tile_zoom))) + padding, 0, count - 1)
	var y0 := clampi(int(floor(_lat_to_tile_y(north, _tile_zoom))) - padding, 0, count - 1)
	var y1 := clampi(int(floor(_lat_to_tile_y(south, _tile_zoom))) + padding, 0, count - 1)

	_visible_keys.clear()
	for y in range(y0, y1 + 1):
		for x in range(x0, x1 + 1):
			var key := _key(_tile_zoom, x, y)
			_visible_keys[key] = {"z": _tile_zoom, "x": x, "y": y}
			_ensure_tile(_tile_zoom, x, y)
	_pump_queue()


## Ready textures and their map-space rectangles, consumed by WorldMap._draw.
func draw_tiles(projection: MapProjection) -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	if not enabled:
		return out
	for key in _visible_keys:
		if not _textures.has(key):
			continue
		var tile: Dictionary = _visible_keys[key]
		var z := int(tile["z"])
		var x := int(tile["x"])
		var y := int(tile["y"])
		var nw := Vector2(_tile_x_to_lon(x, z), _tile_y_to_lat(y, z))
		var se := Vector2(_tile_x_to_lon(x + 1, z), _tile_y_to_lat(y + 1, z))
		var a := projection.to_view(nw.x, nw.y)
		var b := projection.to_view(se.x, se.y)
		out.append({
			"texture": _textures[key],
			"rect": Rect2(a, b - a),
		})
	return out


func _ensure_tile(z: int, x: int, y: int) -> void:
	var key := _key(z, x, y)
	if _textures.has(key) or _queued.has(key):
		return
	var path := _cache_path(z, x, y)
	if FileAccess.file_exists(path):
		var image := Image.new()
		if image.load(path) == OK:
			_store_texture(key, ImageTexture.create_from_image(image))
			tiles_changed.emit()
			# A stale tile remains the offline fallback while a fresh copy is
			# requested. Failed refreshes therefore never turn a known view blank.
			if _cache_is_fresh(path):
				return
	_queued[key] = true
	_jobs.append({"key": key, "z": z, "x": x, "y": y, "path": path})


func _pump_queue() -> void:
	while enabled and _active < _max_concurrent and not _jobs.is_empty():
		var job: Dictionary = _jobs.pop_front()
		# A fast drag can make queued work irrelevant before it starts. Discard it
		# rather than downloading tiles outside the current view.
		if not _visible_keys.has(job["key"]):
			_queued.erase(job["key"])
			continue
		_start_request(job)


func _start_request(job: Dictionary) -> void:
	var request := HTTPRequest.new()
	request.timeout = 15.0
	add_child(request)
	_active += 1
	request.request_completed.connect(_on_request_completed.bind(job, request))
	var url := _url_template.replace("{z}", str(job["z"])) \
		.replace("{x}", str(job["x"])).replace("{y}", str(job["y"]))
	var headers := PackedStringArray()
	# Browsers own the User-Agent header and also provide the required Referer.
	# Native exports identify the application explicitly.
	if not OS.has_feature("web"):
		headers.append("User-Agent: %s" % _user_agent)
	var error := request.request(url, headers)
	if error != OK:
		_finish_request(job, request)


func _on_request_completed(result: int, response_code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		job: Dictionary, request: HTTPRequest) -> void:
	if result == HTTPRequest.RESULT_SUCCESS and response_code == 200 and not body.is_empty():
		var image := Image.new()
		if image.load_png_from_buffer(body) == OK:
			var path := String(job["path"])
			var absolute_dir := ProjectSettings.globalize_path(path.get_base_dir())
			DirAccess.make_dir_recursive_absolute(absolute_dir)
			image.save_png(path)
			_store_texture(String(job["key"]), ImageTexture.create_from_image(image))
			tiles_changed.emit()
	_finish_request(job, request)


func _finish_request(job: Dictionary, request: HTTPRequest) -> void:
	_queued.erase(job["key"])
	_active = maxi(0, _active - 1)
	if is_instance_valid(request):
		request.queue_free()
	_pump_queue()


func _cache_is_fresh(path: String) -> bool:
	var modified := FileAccess.get_modified_time(path)
	return modified > 0 and Time.get_unix_time_from_system() - float(modified) < float(_cache_seconds)


func _store_texture(key: String, texture: Texture2D) -> void:
	_textures[key] = texture
	_texture_order.erase(key)
	_texture_order.append(key)
	# Visible tiles are never evicted. Old off-screen textures remain on disk
	# and can be decoded again without network traffic if the player returns.
	var attempts := _texture_order.size()
	while _textures.size() > _max_memory_tiles and attempts > 0:
		attempts -= 1
		var oldest: String = _texture_order.pop_front()
		if _visible_keys.has(oldest):
			_texture_order.append(oldest)
			continue
		_textures.erase(oldest)


func _cache_path(z: int, x: int, y: int) -> String:
	return "%s/%d/%d/%d.png" % [CACHE_ROOT, z, x, y]


static func _key(z: int, x: int, y: int) -> String:
	return "%d/%d/%d" % [z, x, y]


static func _lon_to_tile_x(lon: float, z: int) -> float:
	return (lon + 180.0) / 360.0 * float(1 << z)


static func _lat_to_tile_y(lat: float, z: int) -> float:
	var radians := deg_to_rad(clampf(lat, -85.05112878, 85.05112878))
	return (1.0 - asinh(tan(radians)) / PI) * 0.5 * float(1 << z)


static func _tile_x_to_lon(x: int, z: int) -> float:
	return float(x) / float(1 << z) * 360.0 - 180.0


static func _tile_y_to_lat(y: int, z: int) -> float:
	var n := PI - 2.0 * PI * float(y) / float(1 << z)
	return rad_to_deg(atan(sinh(n)))
