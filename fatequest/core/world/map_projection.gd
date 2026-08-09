class_name MapProjection
extends RefCounted

## lon/lat -> view pixels. Equirectangular, matching the bbox the heightmap and
## every GeoJSON layer share (worldmap/data/world_config.json). Keeping one
## formula here is what lets map art, city dots and the fog mask line up.

var west: float = -20.0
var south: float = -8.0
var east: float = 122.0
var north: float = 66.0
var width: float = 1280.0
var height: float = 720.0
var origin: Vector2 = Vector2.ZERO   ## view-space offset of the map's top-left


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
	return origin + Vector2(
		(lon - west) / (east - west) * width,
		(north - lat) / (north - south) * height
	)


func to_geo(view_point: Vector2) -> Vector2:
	return Vector2(
		west + (view_point.x - origin.x) / maxf(width, 1.0) * (east - west),
		north - (view_point.y - origin.y) / maxf(height, 1.0) * (north - south)
	)


static func longitude_km_per_degree(latitude: float) -> float:
	return 111.32 * maxf(0.01, cos(deg_to_rad(clampf(latitude, -89.0, 89.0))))
