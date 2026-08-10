class_name MapProjection
extends RefCounted

## lon/lat -> view pixels using Web Mercator (EPSG:3857).
##
## The runtime map now has a real XYZ tile underlay. Using the same projection
## as that underlay is essential: an equirectangular overlay only lines up near
## the equator and visibly drifts away from coastlines toward northern Eurasia.
## Every local GeoJSON layer remains WGS84 lon/lat and is projected here.

var west: float = -20.0
var south: float = -8.0
var east: float = 122.0
var north: float = 66.0
var width: float = 1280.0
var height: float = 720.0
var origin: Vector2 = Vector2.ZERO   ## view-space offset of the map's top-left

const MERCATOR_LIMIT := 85.05112878


## Reads content/world/world_config.json, NOT worldmap/data/. The worldmap
## directory carries a .gdignore (its cities.csv would otherwise be imported as
## a localization file), and .gdignore'd files are excluded from EXPORTED
## builds — so reading the bbox from there works in the editor and then
## silently falls back to defaults in a shipped game. The copy under content/
## is kept in sync by tools/lore/sync_world_config.mjs.
static func from_config(path: String = "res://content/world/world_config.json") -> MapProjection:
	var p := MapProjection.new()
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("MapProjection: %s missing - bbox falling back to defaults" % path)
		return p
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) == TYPE_DICTIONARY and doc.has("bbox"):
		var b: Dictionary = doc["bbox"]
		p.west = float(b["west"]); p.south = float(b["south"])
		p.east = float(b["east"]); p.north = float(b["north"])
	return p


func set_viewport(w: float, h: float) -> void:
	width = w
	height = h


func to_view(lon: float, lat: float) -> Vector2:
	var top := _mercator_y(north)
	var bottom := _mercator_y(south)
	return origin + Vector2(
		(lon - west) / (east - west) * width,
		(top - _mercator_y(lat)) / maxf(top - bottom, 0.000001) * height
	)


func to_geo(view_point: Vector2) -> Vector2:
	var top := _mercator_y(north)
	var bottom := _mercator_y(south)
	var mercator_y := top - (view_point.y - origin.y) / maxf(height, 1.0) * (top - bottom)
	return Vector2(
		west + (view_point.x - origin.x) / maxf(width, 1.0) * (east - west),
		rad_to_deg(2.0 * atan(exp(mercator_y)) - PI * 0.5)
	)


static func _mercator_y(latitude: float) -> float:
	var lat := deg_to_rad(clampf(latitude, -MERCATOR_LIMIT, MERCATOR_LIMIT))
	return log(tan(PI * 0.25 + lat * 0.5))


static func longitude_km_per_degree(latitude: float) -> float:
	return 111.32 * maxf(0.01, cos(deg_to_rad(clampf(latitude, -89.0, 89.0))))
