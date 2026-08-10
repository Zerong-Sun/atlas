extends RefCounted

var _fails := 0


func _ok(value: bool, message: String) -> void:
	if not value:
		printerr("  FAIL: %s" % message)
		_fails += 1


func run() -> bool:
	var projection := MapProjection.new()
	projection.origin = Vector2(48, 48)
	projection.set_viewport(1184, 454)
	var geo := Vector2(35.235, 31.778)
	var roundtrip := projection.to_geo(projection.to_view(geo.x, geo.y))
	_ok(roundtrip.distance_to(geo) < 0.0001, "projection round-trip preserves longitude and latitude")
	var north_y := projection.to_view(0.0, 60.0).y
	var mid_y := projection.to_view(0.0, 30.0).y
	var equator_y := projection.to_view(0.0, 0.0).y
	_ok(absf((mid_y - north_y) - (equator_y - mid_y)) > 1.0,
		"projection uses Web Mercator rather than an equirectangular approximation")
	var equator := MapProjection.longitude_km_per_degree(0.0)
	var north := MapProjection.longitude_km_per_degree(60.0)
	_ok(absf(equator - 111.32) < 0.01, "equatorial longitude scale is correct")
	_ok(absf(north - equator * 0.5) < 0.1,
		"longitude scale contracts with latitude instead of overstating distance")
	print("test_map_projection: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
